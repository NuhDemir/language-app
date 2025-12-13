
---

# Phase 17: SRS Query Optimization (Composite & Covering Indexes)

**Durum:** Algoritma Performans Optimizasyonu.
**Hedef:** Kullanıcının çalışma sırasındaki kelimeleri (`next_review_at <= NOW()`) sorgularken, veritabanında "Table Scan" yapmadan, milisaniyeler içinde sonucu döndürecek en optimal indeks yapısını kurmak.

### 📋 Mimari Analiz ve Strateji
1.  **Sorgu Deseni:** SRS algoritması her zaman şu sorguyu atar:
    `SELECT word_token FROM srs_table WHERE user_id = X AND course_id = Y AND next_review_at <= NOW()`
2.  **Yanlış Yaklaşım:** Sadece `next_review_at` üzerine indeks koymak yetmez. Veritabanı önce kullanıcıyı, sonra kursu, sonra zamanı bulmaya çalışır.
3.  **Doğru Yaklaşım (Composite Index):** İndeks `(user_id, course_id, next_review_at)` sırasıyla oluşturulmalıdır. Bu sayede Postgres doğrudan o kullanıcının o kurstaki zaman çizelgesine "ışınlanır".
4.  **Covering Index (Kapsayan İndeks):** Sorgu sadece `word_token`'ı istiyorsa, veritabanı tabloya (Heap) gitmemeli, cevabı direkt indeksten vermelidir (`INCLUDE` clause).

### 🛠 Implementation Task

#### 1. Prisma Model Güncellemesi (`schema.prisma`)
Mevcut `UserVocabularyProgress` modeline stratejik indeksimizi ekleyin.

```prisma
// --------------------------------------------------------
// MEVCUT MODEL: USER VOCABULARY PROGRESS (Güncelleme)
// --------------------------------------------------------
model UserVocabularyProgress {
  // ... alanlar (userId, courseId, wordToken, nextReviewAt vs.)

  // STRATEJİK İNDEKS:
  // 1. userId ve courseId: Eşitlik (=) araması için en başa.
  // 2. nextReviewAt: Aralık (<, >) araması için sona.
  // Not: Prisma 'INCLUDE' özelliğini Schema'da tam desteklemez (Preview).
  // Bu yüzden migration dosyasında manuel 'INCLUDE' ekleyeceğiz.
  
  @@index([userId, courseId, nextReviewAt], name: "idx_srs_fetch_queue")

  @@id([userId, courseId, wordToken])
  @@map("user_vocabulary_progress")
}
```

#### 2. Migration Müdahalesi (Covering Index Ekleme)
Prisma'nın oluşturduğu indeksi, tabloya hiç uğramadan veri okuyabilen "Covering Index"e çevireceğiz.

1.  Migration oluştur:
    ```bash
    npx prisma migrate dev --create-only --name optimize_srs_query
    ```
2.  Oluşan SQL dosyasını aç ve içeriği şu şekilde düzenle:

```sql
-- Mevcut indeksi (varsa) kaldır
DROP INDEX IF EXISTS "idx_srs_fetch_queue";

-- OPTİMİZE EDİLMİŞ INDEX (COVERING INDEX)
-- Sorgu: "Bana sırası gelen kelimeleri ver"
-- INCLUDE: word_token, stability, difficulty
-- Bu alanları indekse gömüyoruz. Böylece DB, ana tabloya gitmeden (Heap Fetch)
-- sadece indeksi okuyarak yanıt döner. (Index Only Scan)

CREATE INDEX "idx_srs_fetch_queue" 
ON "user_vocabulary_progress" (user_id, course_id, next_review_at ASC)
INCLUDE (word_token, stability, difficulty);

-- Açıklama:
-- WHERE user_id = ... AND course_id = ... (İndeksin ilk 2 sütunu filtreler)
-- AND next_review_at <= NOW() (3. sütun aralığı bulur)
-- RETURNING word_token (INCLUDE kısmından veriyi okur, tabloya gitmez)
```

3.  Migration'ı uygula: `npx prisma migrate dev`

#### 3. Performans Testi (Critical Verification)
Bu indeksin çalıştığını kanıtlamalısın.

**Senaryo:** Kullanıcının (ID: 1) İngilizce kursunda (ID: 10) tekrar etmesi gereken kelimeleri getir.

```sql
EXPLAIN (ANALYZE, COSTS, BUFFERS)
SELECT word_token, stability, difficulty
FROM user_vocabulary_progress
WHERE user_id = '...' -- Geçerli bir UUID
  AND course_id = 1
  AND next_review_at <= NOW();
```

**Beklenen Sonuç:**
*   **Scan Type:** `Index Only Scan using idx_srs_fetch_queue`
*   **Heap Fetches:** `0` (Sıfır). Bu mükemmel sonuçtur. Veritabanı diskten tabloyu okumaz, sadece indeksten yanıt döner.

#### 4. (Opsiyonel) NestJS Repository Metodu
Bu sorguyu `VocabRepository` içine ekleyin.

```typescript
// vocab.repository.ts
async getDueWords(userId: string, courseId: bigint, limit = 10) {
  // Prisma bu sorguyu otomatik olarak "idx_srs_fetch_queue" indeksine yönlendirir.
  return this.prisma.userVocabularyProgress.findMany({
    where: {
      userId,
      courseId,
      nextReviewAt: { lte: new Date() } // <= NOW()
    },
    select: {
      wordToken: true,
      stability: true,
      difficulty: true
    },
    orderBy: {
      nextReviewAt: 'asc' // En eski tarihi (en acil) önce getir
    },
    take: limit
  });
}
```

### ✅ Definition of Done
1.  Veritabanında `idx_srs_fetch_queue` indeksinin oluştuğu ve `INCLUDE` sütunlarını içerdiği (`\d user_vocabulary_progress` ile) doğrulandı.
2.  `EXPLAIN ANALYZE` çıktısında **Index Only Scan** görüldü.
3.  SRS sorgularının, tablo boyutu artsa bile (10M satır), sabit sürede (O(log n)) çalıştığı teorik olarak garantilendi.

---

**Devam et** dediğinde, veri tutarlılığını sağlamak için NestJS tarafında transaction yönetimini ele alacağımız **Faz 18: Transactional Update & Atomic Operations** aşamasına geçeceğiz. "Ders bitti ama XP gelmedi" şikayetlerini kökten çözeceğiz.