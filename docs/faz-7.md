
---

# Phase 7: Hierarchical Structure (Units & Levels)

**Durum:** Kurs içeriğinin iskeleti (Müfredat Ağacı).
**Hedef:** Bir kursun içindeki ünite ve seviyeleri (Unit -> Level) katı bir hiyerarşi ile tanımlamak. Bu yapı "Saf İlişkisel" (Strict Relational) olmalıdır çünkü müfredat yapısı nadiren değişir ama çok sık sorgulanır.

### 📋 Mimari Notlar ve Kısıtlamalar
1.  **Sıralama Garantisi:** Hem `units` hem de `levels` tablolarında `order_index` alanı zorunludur.
2.  **Veri Bütünlüğü (Composite Unique):** Aynı kursta aynı sıraya sahip iki ünite olamaz. Aynı ünitede aynı sıraya sahip iki seviye olamaz. (`@@unique([relationId, orderIndex])`).
3.  **Yetim Veri Koruması (Cascade):** Kurs silinirse üniteler, ünite silinirse seviyeler otomatik silinmelidir (`onDelete: Cascade`).
4.  **Zengin İçerik:** Ünite rehberleri (Guidebooks) metin formatında değil, zengin içerik olabileceği için `JSONB` tutulmalıdır.

### 🛠 Prisma Schema Definition

Aşağıdaki modelleri `schema.prisma` dosyasına ekle ve `Course` modeli ile ilişkilerini bağla.

```prisma
// --------------------------------------------------------
// MODEL: UNIT (Kursun Ana Bölümleri)
// PDF Ref: Sayfa 5
// --------------------------------------------------------
model Unit {
  id              BigInt   @id @default(autoincrement())
  
  // İlişki: Hangi kursa ait?
  courseId        BigInt   @map("course_id")
  course          Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)
  
  // Sıralama: Kurs içindeki sıra no (1, 2, 3...)
  orderIndex      Int      @map("order_index")
  
  title           String   @db.VarChar(100)
  description     String?  @db.Text
  
  // Dil Bilgisi Notları (Rich Text / Structured Content)
  // Örn: { "sections": [{ "header": "Fiiller", "body": "..." }] }
  guidebookContent Json?   @map("guidebook_content")
  
  // UI Görselliği
  colorTheme      String?  @map("color_theme") @db.VarChar(7) // Hex Code: #FF5733
  iconUrl         String?  @map("icon_url") @db.VarChar(255)

  // Alt İlişkiler
  levels          Level[]

  // CONSTRAINT: Bir kursta aynı sıra numarası tekrar edemez.
  @@unique([courseId, orderIndex], name: "uq_unit_order")
  @@map("units")
}

// --------------------------------------------------------
// MODEL: LEVEL (Ünite içindeki zorluk kademeleri)
// PDF Ref: Sayfa 5-6
// --------------------------------------------------------
model Level {
  id              BigInt   @id @default(autoincrement())
  
  // İlişki: Hangi üniteye ait?
  unitId          BigInt   @map("unit_id")
  unit            Unit     @relation(fields: [unitId], references: [id], onDelete: Cascade)
  
  // Sıralama: Ünite içindeki sıra no
  orderIndex      Int      @map("order_index")
  
  // Bu seviyeyi bitirmek için kaç ders (exercise grubu) tamamlanmalı?
  totalLessons    Int      @default(5) @map("total_lessons")
  
  // Ödül Referansı (Gelecekteki fazlar için placeholder)
  chestRewardId   Int?     @map("chest_reward_id")

  // Alt İlişkiler (Faz 8'de eklenecek)
  // exercises    Exercise[]

  // CONSTRAINT: Bir ünitede aynı sıra numarası tekrar edemez.
  @@unique([unitId, orderIndex], name: "uq_level_order")
  @@map("levels")
}

// --------------------------------------------------------
// GÜNCELLENECEK MEVCUT MODEL: COURSE
// --------------------------------------------------------
// model Course {
//   ...
//   units Unit[] // İlişkiyi eklemeyi unutma
// }
```

### ✅ Definition of Done
1.  `npx prisma migrate dev --name create_hierarchy_tables` komutu hatasız çalıştı.
2.  Veritabanında `uq_unit_order` ve `uq_level_order` kısıtlamalarının oluştuğu doğrulandı.
3.  Bir `Course` silindiğinde bağlı `Unit` ve `Level` kayıtlarının da silindiği (Cascade) test edildi.

---

**Devam et** dediğinde, yapının en dinamik parçası olan **Faz 8: Hibrit Egzersiz Modeli (Exercises & JSONB)** şemasına geçeceğiz.