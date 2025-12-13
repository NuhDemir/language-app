
---

# Phase 8: Hybrid Exercise Model (The Content Payload)

**Durum:** Dinamik eğitim içeriğinin modellenmesi.
**Hedef:** İlişkisel veritabanının sorgu gücüyle (filtreleme, sıralama), NoSQL'in esnekliğini (polimorfik içerik) tek bir tabloda birleştirmek.

### 📋 Mimari Kararlar (PDF Referansı: Sayfa 2, 6)
1.  **Hibrit Yapı:**
    *   **Statik Alanlar (Relational):** Sorgularda sık kullanılan `type`, `difficulty_score` gibi alanlar sütun olarak tanımlanır.
    *   **Dinamik Alanlar (JSONB):** Sorunun metni, cevap şıkları, doğru cevap gibi yapıya göre değişen veriler `content` JSONB sütununda tutulur.
2.  **Polimorfizm:** `type` sütunu, JSONB içeriğinin şemasını belirler (Örn: `type='translate'` ise JSON içinde `prompt` ve `tokens` beklenir).
3.  **Metadata:** Ses dosyaları ve görsel URL'leri için ayrı bir `media_metadata` JSONB sütunu kullanılır.

### 🛠 Prisma Schema Task

Aşağıdaki `Exercise` modelini `schema.prisma` dosyasına ekle ve `Level` modeli ile ilişkisini kur.

```prisma
// --------------------------------------------------------
// MODEL: EXERCISE (Dersin en küçük yapı taşı)
// PDF Ref: Sayfa 6
// --------------------------------------------------------
model Exercise {
  // Veri hacmi çok yüksek olacağı için BIGSERIAL tercih edildi.
  id              BigInt   @id @default(autoincrement())
  
  // İlişki: Hangi seviyeye ait?
  levelId         BigInt   @map("level_id")
  level           Level    @relation(fields: [levelId], references: [id], onDelete: Cascade)
  
  // Egzersiz Tipi: 'translate', 'match_pairs', 'listen_tap', 'speak'
  // Enum yerine String kullanıyoruz çünkü yeni soru tipleri kod tarafında eklenebilir.
  type            String   @db.VarChar(50)
  
  // Adaptif öğrenme algoritmaları için zorluk puanı (1-10)
  difficultyScore Int      @default(1) @map("difficulty_score") @db.SmallInt
  
  // --------------------------------------------------------
  // CONTENT PAYLOAD (Polimorfik Yapı)
  // PDF Sayfa 6: Farklı soru tipleri için değişen yapı.
  // Örn (Translate): { "prompt": "Kedi süt içer", "correct_answers": ["The cat drinks milk"] }
  // Örn (Match): { "pairs": [{"en": "cat", "tr": "kedi"}, ...] }
  // --------------------------------------------------------
  content         Json     // NOT NULL
  
  // Medya varlıkları (Ses dosyası, Görsel URL vb.)
  // Varsayılan: Boş JSON obje
  mediaMetadata   Json     @default("{}") @map("media_metadata")
  
  createdAt       DateTime @default(now()) @map("created_at") @db.Timestamptz

  // İndeksler (Faz 10'da GIN indeksi eklenecek, şimdilik standart indeksler)
  @@index([levelId]) // FK performansı için
  @@index([type])    // "Tüm konuşma sorularını getir" sorgusu için
  
  @@map("exercises")
}

// --------------------------------------------------------
// GÜNCELLENECEK MEVCUT MODEL: LEVEL
// --------------------------------------------------------
// model Level {
//   ...
//   exercises Exercise[] // İlişki eklendi
// }
```

### 🔍 Senior Dev Notu (Validasyon Uyarısı)
Bu model veritabanı seviyesinde `content` alanının içine ne yazıldığını denetlemez. Bu bir güçtür ama aynı zamanda risktir.
*   **Risk:** `content` alanına geçersiz veri yazılırsa mobil uygulama çöker (Crash).
*   **Çözüm (Gelecek Notu):** Faz 9'da (TypeScript/Zod) bu JSON alanları için uygulama katmanında "Schema Validation" yazmak zorundasın. Veritabanına "çöp" girmesini ancak böyle engelleriz.

### ✅ Definition of Done
1.  `npx prisma migrate dev --name create_exercises_table` komutu hatasız çalıştı.
2.  `content` sütununun `JSONB` (Postgres) tipinde olduğu doğrulandı.
3.  `type` sütununa göre sorgu atılabildiği (`SELECT * FROM exercises WHERE type = 'speak'`) test edildi.

---

**Devam et** dediğinde, az önce bahsettiğim riski ortadan kaldıracak olan **Faz 9: JSONB Veri Doğrulama (Zod Validation)** aşamasına geçeceğiz. Bu, veritabanı değil, uygulama kodu (Back-end logic) fazıdır.