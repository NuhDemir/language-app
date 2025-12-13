
---

# Phase 16: SRS Algorithm Infrastructure (The Memory Engine)

**Durum:** Hafıza ve Algoritma Katmanı.
**Hedef:** Kullanıcının her bir kelime üzerindeki hafıza durumunu (ne kadar iyi hatırlıyor, ne zaman unutacak) takip edecek, FSRS (Free Spaced Repetition Scheduler) veya SM-2 algoritmalarına uyumlu tablo yapısını kurmak.

### 📋 Mimari Gereklilikler (PDF Referansı: Sayfa 9)
1.  **Algoritma Agnostik Yapı:** Sistem hem klasik SM-2 (SuperMemo-2) hem de modern FSRS algoritmalarını desteklemelidir. Bu yüzden `stability` (kararlılık) ve `difficulty` (zorluk) gibi ondalıklı (Float) alanlara ihtiyacımız var.
2.  **Kimlik Yönetimi:** Her kelime için ayrı bir `id` sütunu kullanmak israftır.
    *   **Composite Key:** `(user_id, course_id, word_token)` üçlüsü benzersizdir.
    *   *Not:* `word_token` kelimenin kök halidir (örn: "run").
3.  **Kritik Sorgu Alanı:** `next_review_at`. Sistem sürekli "Şu an tekrar edilmesi gereken kelimeler neler?" sorusunu soracaktır.

### 🛠 Prisma Schema Task

Aşağıdaki modeli `schema.prisma` dosyasına ekleyin.

```prisma
// --------------------------------------------------------
// MODEL: USER VOCABULARY PROGRESS (SRS)
// PDF Ref: Sayfa 9 ve 15
// --------------------------------------------------------
model UserVocabularyProgress {
  userId       String   @map("user_id") @db.Uuid
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  courseId     BigInt   @map("course_id")
  course       Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)

  // Öğrenilen kelime veya kök (stem).
  // Ayrı bir 'Words' tablosu yerine string olarak tutulması, 
  // içerik JSONB yapısında olduğu için daha esnektir (Loose Coupling).
  wordToken    String   @map("word_token") @db.VarChar(100)

  // --------------------------------------------------------
  // ALGORİTMA PARAMETRELERİ (FSRS / SM-2)
  // --------------------------------------------------------
  
  // Hafıza Kararlılığı (Gün cinsinden): Kelimeyi ne kadar süre unutmayacak?
  // FSRS için kritik.
  stability    Float    @default(0) @map("stability")

  // Zorluk Seviyesi (0-10): Kelime ne kadar zor?
  difficulty   Float    @default(0) @map("difficulty")

  // Kaç kez tekrar edildi?
  repetitionCount Int   @default(0) @map("repetition_count")

  // Zaman Damgaları
  lastReviewedAt  DateTime? @default(now()) @map("last_reviewed_at") @db.Timestamptz
  
  // EN KRİTİK ALAN: Bir sonraki tekrar ne zaman yapılmalı?
  // Sorgular bu alana göre filtrelenecek.
  nextReviewAt    DateTime  @map("next_review_at") @db.Timestamptz

  // COMPOSITE PRIMARY KEY
  // Bir kursta, bir kullanıcının, bir kelime için sadece tek bir kaydı olabilir.
  @@id([userId, courseId, wordToken])

  // İndeksler (Faz 17'de Partial Index ile optimize edilecek)
  // Şimdilik standart tanımları yapalım.
  @@map("user_vocabulary_progress")
}
```

### 🔍 Senior Dev Notu: Neden Float?
`difficulty` ve `stability` alanlarını `Int` yapma hatasına düşmeyin. Modern SRS algoritmaları (özellikle FSRS), logaritmik hesaplamalar yapar ve hassas ondalık değerlere (örn: `difficulty: 2.34`) ihtiyaç duyar. Veri kaybı, algoritmanın verimini düşürür.

### ✅ Definition of Done
1.  `npx prisma migrate dev --name create_srs_table` komutu hatasız çalıştı.
2.  `user_vocabulary_progress` tablosu oluşturuldu.
3.  Aynı kullanıcıya, aynı kursta "apple" kelimesini ikinci kez eklemeye çalıştığında hata alındığı (Unique Constraint) doğrulandı.
4.  `next_review_at` sütununun `DateTime` tipinde olduğu teyit edildi.

---

**Devam et** dediğinde, bu tablonun performansını %90 artıracak olan **Faz 17: Kritik SRS Sorgusu ve Kısmi İndeksler (Partial Indexes)** aşamasına geçeceğiz. Milyonlarca "ezberlenmiş" kelimeyi indekslemekten nasıl kurtulacağımızı göreceğiz.