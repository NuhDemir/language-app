
---

# Phase 14: High-Volume Progress Tracking (Partitioning Strategy)

**Durum:** Büyük Veri (Big Data) Yönetimi - Yapısal Hazırlık.
**Hedef:** Sistemdeki en yüksek yazma trafiğine sahip `lesson_completions` tablosunu, zamana dayalı bölümleme (**Range Partitioning**) stratejisi ile oluşturmak.

### 📋 Mimari Gereklilikler ve Engeller (PDF Referansı: Sayfa 8, 9, 16)
1.  **Hacim Problemi:** Günde 1M aktif kullanıcı x 5 ders = Günlük 5M satır. Yıllık 1.8 Milyar satır. Tek parça tabloda indeksler şişer, `VACUUM` işlemleri sistemi kilitler.
2.  **Partition Key:** Tablo `completed_at` (tamamlanma zamanı) sütununa göre bölünecektir.
3.  **Primary Key Zorunluluğu:** Partitioned Table'larda Primary Key, mutlaka Partition Key'i (`completed_at`) içermek zorundadır. Sadece `id` yetmez.
    *   PK: `(user_id, completed_at, id)`
4.  **Prisma Engeli:** Prisma şema dosyasında `partition by` diye bir komut yoktur. Prisma'yı standart bir tablo gibi tanımlayıp, SQL tarafında tabloyu bölümlemeye çevireceğiz.

### 🛠 Implementation Task

#### 1. Prisma Model Tanımı (`schema.prisma`)
Modeli tanımla ama *sakın* migrate etme (henüz).

```prisma
// --------------------------------------------------------
// MODEL: LESSON COMPLETION (Partitioned Table)
// PDF Ref: Sayfa 8-9
// --------------------------------------------------------
model LessonCompletion {
  // Global ID olarak BigInt kullanıyoruz ama PK tek başına bu değil.
  // Partitioning için 'default(autoincrement())' yerine manuel yönetim veya sequence gerekebilir.
  // Basitlik için Prisma'nın yönetmesine izin veriyoruz, SQL'de BIGSERIAL yapacağız.
  id        BigInt   @default(autoincrement())

  userId    String   @map("user_id") @db.Uuid
  // User ilişkisi tanımlamıyoruz (Opsiyonel): Partitioned tablolarda FK bazen sorun çıkarır.
  // Ancak PG16+ destekler. Şimdilik sadece scalar alan olarak bırakalım, performans için.
  
  courseId  BigInt   @map("course_id")
  unitId    BigInt   @map("unit_id")
  levelId   BigInt   @map("level_id")

  // Analitik Verileri
  xpEarned           Int      @map("xp_earned")
  durationSeconds    Int      @map("duration_seconds")
  accuracyPercentage Decimal  @map("accuracy_percentage") @db.Decimal(5, 2)

  // PARTITION KEY (Kritik Alan)
  completedAt        DateTime @default(now()) @map("completed_at") @db.Timestamptz

  // PRIMARY KEY STRATEJİSİ
  // Partition Key (completedAt) mutlaka PK içinde olmalı.
  @@id([userId, completedAt, id])
  
  // İndeksler (Her partition üzerinde otomatik oluşur)
  @@index([userId, courseId]) // "Kullanıcının bu kurstaki ilerlemesi" sorgusu için
  
  @@map("lesson_completions")
}
```

#### 2. Manuel SQL Müdahalesi (Critical Step)
Prisma'nın oluşturacağı standart tabloyu kabul etmiyoruz. Onu Partitioned Table'a dönüştüreceğiz.

1.  Migration dosyasını oluştur (uygulamadan):
    ```bash
    npx prisma migrate dev --create-only --name create_partitioned_completions
    ```
2.  Oluşan SQL dosyasını aç ve **içeriği tamamen silip** aşağıdakini yapıştır:

```sql
-- 1. Tabloyu PARTITION BY RANGE ile oluştur
-- Not: PRIMARY KEY tanımına dikkat!

CREATE TABLE lesson_completions (
    id BIGSERIAL NOT NULL, -- Global Sequence
    user_id UUID NOT NULL,
    course_id BIGINT NOT NULL,
    unit_id BIGINT NOT NULL,
    level_id BIGINT NOT NULL,
    xp_earned INTEGER NOT NULL CHECK (xp_earned >= 0),
    duration_seconds INTEGER NOT NULL,
    accuracy_percentage DECIMAL(5,2) NOT NULL,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Partition Key (completed_at) PK'in bir parçası olmak ZORUNDA
    CONSTRAINT lesson_completions_pkey PRIMARY KEY (user_id, completed_at, id)
) PARTITION BY RANGE (completed_at);

-- 2. İndeksler (Ana tabloya eklenir, partitionlara miras geçer)
CREATE INDEX idx_completions_user_course 
ON lesson_completions (user_id, course_id);

-- UYARI: Henüz alt tablolar (Partitions) yok. 
-- Şu an bu tabloya INSERT yaparsanız hata alırsınız.
-- Faz 15'te partitionları oluşturacağız.
```

3.  Migration'ı uygula:
    ```bash
    npx prisma migrate dev
    ```

### ✅ Definition of Done
1.  Veritabanında `lesson_completions` tablosunun oluştuğu doğrulandı.
2.  Tablo özelliklerine bakıldığında (veya `\d lesson_completions` komutuyla) **"Partitioned Table"** ibaresi görüldü.
3.  Partition Key olarak `Range (completed_at)` ayarlandığı teyit edildi.
4.  Şu an tabloya veri eklenemediği (çünkü aktif bir partition yok) "no partition of relation found" hatasıyla doğrulandı. (Bu beklenen bir durumdur).

---

**Devam et** dediğinde, bu hayalet tabloyu canlandıracağız. **Faz 15: Partition Otomasyonu (Maintenance)** ile içine veri yazılabilir hale getireceğiz.