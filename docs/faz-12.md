
---

# Phase 12: Eliminating N+1 Problem (The `json_build_object` Strategy)

**Durum:** Veri Erişim Katmanı (Data Access Layer) - Optimizasyon.
**Hedef:** Karmaşık hiyerarşik veriyi (Kurs -> Üniteler -> Seviyeler) uygulama tarafında (Node.js) birleştirmek yerine, veritabanı motorunun (PostgreSQL) gücünü kullanarak **tek bir SQL sorgusu** ile JSON formatında çekmek.

### 📋 Mimari Analiz ve Uyarılar (PDF Referansı: Sayfa 20)
1.  **Sorun (The Trap):** Prisma ile şöyle bir sorgu yazarsan:
    ```typescript
    // SAKIN YAPMA (High Traffic için):
    prisma.course.findUnique({
      where: { id: 1 },
      include: {
        units: {
          include: {
            levels: true // N+1 veya devasa JOIN yükü
          }
        }
      }
    })
    ```
    *   Bu sorgu veritabanından binlerce satır (row) çeker.
    *   Node.js bu satırları tek tek işleyip (Hydration) nesneye çevirir (CPU darboğazı).
    *   Veritabanı ile uygulama arasında gereksiz veri transferi (Network I/O) oluşur.

2.  **Çözüm:** PostgreSQL'in `jsonb_build_object` ve `jsonb_agg` fonksiyonları.
    *   Veritabanı, veriyi zaten JSON olarak paketleyip tek satırda gönderir.
    *   Node.js sadece bu JSON'ı alır ve istemciye (Client) iletir (Pass-through). Serialization maliyeti sıfıra yakındır.

### 🛠 Implementation Task

#### 1. Repository Pattern (Raw SQL Hazırlığı)
Prisma Client'ı doğrudan serviste kullanmak yerine, bu karmaşık sorguyu bir Repository metoduna gömün.

`src/courses/repositories/course.repository.ts` dosyasını oluşturun/düzenleyin.

#### 2. Optimize Edilmiş SQL Sorgusu
Aşağıdaki sorgu, bir kursun tüm müfredatını (Skeleton) tek seferde çeker.

```typescript
import { PrismaService } from '../../prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CourseRepository {
  constructor(private prisma: PrismaService) {}

  async getCourseHierarchy(courseId: number) {
    // RAW SQL: Prisma'nın oluşturamayacağı kadar optimize.
    const result = await this.prisma.$queryRaw`
      SELECT 
        c.id,
        c.title,
        c.description,
        
        -- Üniteleri JSON Array olarak topla
        COALESCE(
          (
            SELECT jsonb_agg(
              jsonb_build_object(
                'id', u.id,
                'title', u.title,
                'order_index', u.order_index,
                'color_theme', u.color_theme,
                
                -- Ünite içindeki Seviyeleri JSON Array olarak topla
                'levels', COALESCE(
                  (
                    SELECT jsonb_agg(
                      jsonb_build_object(
                        'id', l.id,
                        'order_index', l.order_index,
                        'total_lessons', l.total_lessons
                      ) ORDER BY l.order_index ASC
                    )
                    FROM levels l
                    WHERE l.unit_id = u.id
                  ), 
                  '[]'::jsonb
                )
              ) ORDER BY u.order_index ASC
            )
            FROM units u
            WHERE u.course_id = c.id
          ),
          '[]'::jsonb
        ) as curriculum
        
      FROM courses c
      WHERE c.id = ${courseId}
    `;

    // $queryRaw her zaman bir Array döner. İlk elemanı al.
    return result[0] || null;
  }
}
```

#### 3. Tip Tanımlaması (DTO)
Dönen verinin tipini `any` bırakmayın. TypeScript'in gücünü kullanın.

```typescript
// Bu interface, SQL'den dönen JSON yapısını karşılar.
export interface CourseHierarchyResponse {
  id: number;
  title: string;
  description: string;
  curriculum: Array<{
    id: number;
    title: string;
    order_index: number;
    color_theme: string;
    levels: Array<{
      id: number;
      order_index: number;
      total_lessons: number;
    }>
  }>
}
```

### ✅ Definition of Done
1.  `getCourseHierarchy` metodu oluşturuldu.
2.  Postman veya Swagger üzerinden test edildiğinde, tek bir endpoint isteği ile tüm ağacın (Course -> Unit -> Level) eksiksiz ve sıralı (`ORDER BY` ile) geldiği görüldü.
3.  Prisma Logları açıldığında (`log: ['query']`), konsolda onlarca küçük sorgu yerine **tek bir SELECT** sorgusu görüldü.
4.  Performans kazancı: Node.js işlemci kullanımı, standart `include` yöntemine göre düşüş gösterdi (Opsiyonel: Benchmark).

---

**Devam et** dediğinde, projenin **Veri Çekme** (Read) kısmını tamamlamış oluyoruz. Şimdi, en büyük zorluk olan **Yazma** (Write) trafiğine, yani **Faz 13: İlerleme ve Bölümleme (Cluster B)** aşamasına geçeceğiz. Milyonlarca satırlık `lesson_completions` tablosunu hazırlamaya başla!