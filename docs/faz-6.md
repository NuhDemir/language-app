
---

# Phase 6: Course Architecture (The Skeleton)

**Durum:** İçerik motorunun (Content Engine) ana tablosunun inşası.
**Hedef:** Çift yönlü dil ilişkilerini (Learning X from Y) destekleyen, mükerrer kayıtları veritabanı seviyesinde engelleyen kurs iskeletini kurmak.

### 📋 Teknik Gereksinimler (PDF Referansı: Sayfa 4 ve 5)
*   **Küme:** Cluster A (Content Management).
*   **Kimlik (ID):** `BIGSERIAL`. İçerik tabloları sıralı ID kullanabilir (UUID şart değil).
*   **Veri Bütünlüğü:** Aynı dil çifti (Örn: TR -> EN) için ikinci bir kurs açılması `UNIQUE` constraint ile engellenmelidir.
*   **İlişkiler:** `languages` tablosuna iki ayrı Foreign Key ile bağlanır.

### 🛠 Uygulama Adımları

#### 1. Prisma Modeli Tanımı (`schema.prisma`)
`Course` modelini ekleyin ve `Language` modeli ile ilişkileri kurun.

```prisma
// schema.prisma

model Course {
  // PDF Sayfa 4: id BIGSERIAL PRIMARY KEY
  id BigInt @id @default(autoincrement())

  // İlişkiler: Hangi dili öğreniyor?
  learningLangCode String @map("learning_lang_code") @db.Char(2)
  learningLang     Language @relation("LearningLang", fields: [learningLangCode], references: [code])

  // İlişkiler: Hangi dilden öğreniyor? (Ana dili)
  fromLangCode     String @map("from_lang_code") @db.Char(2)
  fromLang         Language @relation("FromLang", fields: [fromLangCode], references: [code])

  // Kurs Başlığı: "Türkçe konuşanlar için İngilizce"
  title            String @db.VarChar(100)
  
  // Açıklama
  description      String? @db.Text

  // Kurs Aşaması: 'incubator' (geliştirme), 'beta', 'live'
  phase            String @default("live") @db.VarChar(20)

  // Zaman Damgaları
  createdAt        DateTime @default(now()) @map("created_at") @db.Timestamptz
  updatedAt        DateTime @default(now()) @updatedAt @map("updated_at") @db.Timestamptz

  // İlişkiler (Gelecek fazlar için placeholder)
  // units Unit[]
  // enrollments Enrollment[]
  // usersWithCurrent User[] // User tablosundaki current_course_id için

  // CONSTRAINT: Aynı dil çifti için birden fazla kurs olamaz.
  // PDF Sayfa 5: CONSTRAINT uq_course_path UNIQUE(learning_lang_code, from_lang_code)
  @@unique([learningLangCode, fromLangCode], name: "uq_course_path")
  
  @@map("courses")
}

// ---------------------------------------------------------
// Language modelini güncellemeniz gerekecek (Ters ilişkiler):
// ---------------------------------------------------------
// model Language {
//   ...
//   coursesLearning Course[] @relation("LearningLang")
//   coursesTeaching Course[] @relation("FromLang")
// }
```

#### 2. Migration Oluşturma
Bu adımda hem `courses` tablosu oluşacak hem de `languages` ile FK bağları kurulacak.

```bash
npx prisma migrate dev --name create_courses_table
```

*SQL Kontrolü (Migration Dosyası):*
```sql
CREATE TABLE "courses" (
    "id" BIGSERIAL NOT NULL,
    "learning_lang_code" CHAR(2) NOT NULL,
    "from_lang_code" CHAR(2) NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "phase" VARCHAR(20) NOT NULL DEFAULT 'live',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- Unique Constraint
CREATE UNIQUE INDEX "courses_learning_lang_code_from_lang_code_key" 
ON "courses"("learning_lang_code", "from_lang_code");

-- Foreign Keys
ALTER TABLE "courses" ADD CONSTRAINT "courses_learning_lang_code_fkey" 
FOREIGN KEY ("learning_lang_code") REFERENCES "languages"("code") ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE "courses" ADD CONSTRAINT "courses_from_lang_code_fkey" 
FOREIGN KEY ("from_lang_code") REFERENCES "languages"("code") ON UPDATE CASCADE ON DELETE RESTRICT;
```

#### 3. Seed Verisi (İlk Kurslar)
`prisma/seed.ts` dosyasına örnek kursları ekleyin.

```typescript
// prisma/seed.ts içine ekle:

const courses = [
  { 
    learningLangCode: 'en', 
    fromLangCode: 'tr', 
    title: 'Türkçe Konuşanlar İçin İngilizce', 
    phase: 'live' 
  },
  { 
    learningLangCode: 'es', 
    fromLangCode: 'en', 
    title: 'Spanish for English Speakers', 
    phase: 'live' 
  },
  { 
    learningLangCode: 'tr', 
    fromLangCode: 'en', 
    title: 'Turkish for English Speakers', 
    phase: 'beta' 
  }
];

for (const course of courses) {
  // where clause, @@unique constraint'ine uygun olmalı
  await prisma.course.upsert({
    where: { 
       uq_course_path: { 
         learningLangCode: course.learningLangCode, 
         fromLangCode: course.fromLangCode 
       } 
    },
    update: {},
    create: course,
  });
}
```

### ✅ Definition of Done (Bitti Tanımı)
1.  `courses` tablosu oluşturuldu.
2.  `uq_course_path` kısıtlaması sayesinde `(en, tr)` çiftinden ikinci bir kayıt atılamadığı test edildi.
3.  `Language` tablosu ile FK ilişkileri (Learning/From) doğru çalışıyor.
4.  Seed komutu çalıştırıldığında örnek kurslar başarıyla yüklendi.

---

**Devam et** dediğinde, kursun iç yapısını (Müfredat Ağacı) oluşturacağımız **Faz 7: Hiyerarşik Yapı (Units & Levels)** aşamasına geçeceğiz.