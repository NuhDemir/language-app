
---

# Phase 10: Advanced JSONB Indexing Strategy (GIN & OpClasses)

**Durum:** Performans Darboğazı Önleme (Content Engine).
**Hedef:** `exercises` tablosundaki `content` JSONB sütunu üzerinde, standart B-Tree indekslerinin yapamadığı "derinlemesine yapısal sorguları" (Deep Structural Queries) milisaniyeler mertebesine indirmek.

### 📋 Mimari Derinlik ve Kararlar (PDF Referansı: Sayfa 15)

1.  **Neden GIN (Generalized Inverted Index)?**
    *   Standart indeksler (B-Tree), veriyi sıralı tutar (`=`, `<`, `>`). Ancak JSON hiyerarşiktir.
    *   GIN indeksi, bir kitabın "indeks" sayfası gibi çalışır: JSON içindeki her bir anahtarı (key) ve değeri (value) ayrıştırıp, hangi satırlarda geçtiğini bir harita (posting list) olarak tutar.

2.  **Kritik Optimizasyon: `jsonb_path_ops`**
    *   Varsayılan GIN indeksi (`jsonb_ops`), her anahtarı ve değeri ayrı ayrı saklar.
    *   **Karar:** Bizim senaryomuzda "Bu anahtar var mı?" (`?`) sorgusundan ziyade, "Bu JSON yapısı şunun içinde var mı?" (`@>`) sorgusu (Containment) baskındır.
    *   **Uygulama:** `jsonb_path_ops` operatör sınıfını kullanarak indeksi **%30-%50 daha küçük** tutacak ve hash tabanlı karşılaştırma ile sorguları hızlandıracağız.

3.  **Write Penalty (Yazma Maliyeti):**
    *   GIN indekslerinin güncellenmesi maliyetlidir. `fastupdate` parametresinin PostgreSQL varsayılanında açık olduğu teyit edilerek, yazma işlemleri "Pending List" üzerinde toplanıp topluca indekse işlenecektir.

### 🛠 Implementation Task

#### 1. Prisma Şema Tanımı (Placeholder)
Prisma şemasında indeksi tanımlayın. Ancak Prisma'nın DSL'i şu an için `jsonb_path_ops` gibi özel operatör sınıflarını tam desteklemeyebilir veya migration dosyasında varsayılanı üretebilir. Bu yüzden önce standart tanımı yapıp, SQL seviyesinde müdahale edeceğiz.

```prisma
// schema.prisma

model Exercise {
  // ... fields
  
  content Json

  // Prisma'ya burada bir GIN indeksi istediğimizi söylüyoruz.
  // Ancak 'ops' parametresi her versiyonda stabil çalışmayabilir.
  // Biz bunu migration dosyasında manuel 'tweak' edeceğiz.
  @@index([content], type: Gin, name: "idx_exercises_content_gin")
  
  @@map("exercises")
}
```

#### 2. Migration Müdahalesi (Manuel SQL Düzenleme)
Bu adım **zorunludur**. Prisma'nın ürettiği SQL'i, daha performanslı olan versiyonla değiştireceğiz.

1.  Migration dosyasını oluştur (ama uygulama):
    ```bash
    npx prisma migrate dev --create-only --name optimize_exercise_indexing
    ```
2.  Oluşan `prisma/migrations/xxxxxxxx_optimize_exercise_indexing/migration.sql` dosyasını aç.
3.  Dosya içeriğini aşağıdaki **Optimize Edilmiş SQL** ile değiştir:

```sql
-- Varsayılan (YAVAŞ ve BÜYÜK):
-- CREATE INDEX "idx_exercises_content_gin" ON "exercises" USING GIN ("content");

-- OPTİMİZE EDİLMİŞ (HIZLI ve KÜÇÜK):
-- jsonb_path_ops: Sadece '@>' operatörünü destekler ama çok daha hızlıdır.
-- İçerik aramalarında (bunu içeriyor mu?) tam ihtiyacımız olan şeydir.

DROP INDEX IF EXISTS "idx_exercises_content_gin";

CREATE INDEX "idx_exercises_content_gin" 
ON "exercises" 
USING GIN ("content" jsonb_path_ops);

-- İstatistiklerin güncellenmesi için analiz komutu (Production deploy sonrası çalışır)
COMMENT ON INDEX "idx_exercises_content_gin" IS 'Optimized GIN index with jsonb_path_ops for containment queries';
```

4.  Migration'ı uygula:
    ```bash
    npx prisma migrate dev
    ```

#### 3. Sorgu Performans Analizi (`EXPLAIN ANALYZE`)
İndeksin çalıştığını ve PostgreSQL Query Planner'ın bu indeksi tercih ettiğini kanıtlamanız gerekir.

**Test Senaryosu:** İçinde "apple" kelimesi geçen `tokens` array'ine sahip soruları bul.

```sql
-- SQL İstemcisinde (DBeaver/PgAdmin) Çalıştır:

EXPLAIN (ANALYZE, COSTS, VERBOSE, BUFFERS)
SELECT id, type 
FROM exercises 
WHERE content @> '{"tokens": ["apple"]}';
```

**Başarı Kriterleri (Çıktı Analizi):**
*   **Node Type:** `Bitmap Heap Scan` üzerinde `Bitmap Index Scan` görmelisiniz.
*   **Index Name:** `idx_exercises_content_gin` kullanılmalı.
*   **Execution Time:** Tabloda 100k satır varken bile < 10ms olmalı.
*   *Hata:* Eğer `Seq Scan` (Sıralı Tarama) görüyorsanız, tablo çok küçüktür (Postgres küçük tablolarda indeksi takmaz) veya indeks yanlış kurulmuştur.

#### 4. Prisma ile Sorgulama (Advanced)
Prisma Client ile bu optimize indeksi kullanmak için `contains` filtresi veya `Raw Query` kullanın.

```typescript
// Yöntem A: Prisma Native (Basit durumlar)
// Prisma bunu 'content @> ...' SQL'ine çevirir.
const results = await prisma.exercise.findMany({
  where: {
    content: {
      path: ['tokens'],
      array_contains: ['apple'] 
    }
  }
});

// Yöntem B: Raw Query (En garanti yöntem)
// Karmaşık JSON sorguları için önerilir.
const results = await prisma.$queryRaw`
  SELECT * FROM exercises 
  WHERE content @> '{"tokens": ["apple"]}'::jsonb
`;
```

### ✅ Definition of Done
1.  Veritabanında `idx_exercises_content_gin` indeksinin `jsonb_path_ops` operatör sınıfı ile oluşturulduğu doğrulandı (`\d exercises` çıktısında `using gin (content jsonb_path_ops)` görülmeli).
2.  Büyük veri setinde (mock data ile) yapılan `EXPLAIN ANALYZE` testinde `Seq Scan` yerine `Index Scan` görüldü.
3.  Uygulama kodunda bu indeksi tetikleyen örnek bir servis metodu (`findExercisesByKeyword`) yazıldı.

---

**Devam et** dediğinde, içerik yönetiminin son halkası olan ve statik varlıkları (resim, ses) yöneteceğimiz **Faz 11: Medya Metadata Stratejisi** aşamasına geçeceğiz.