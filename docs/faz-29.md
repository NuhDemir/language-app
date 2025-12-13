
---

# Phase 29: Dashboard Performance Tuning (Covering Indexes)

**Durum:** Okuma Optimizasyonu (Read Heavy).
**Hedef:** Uygulamanın en çok çağrılan "GetUserProfile" sorgusunu, tabloya hiç erişmeden doğrudan RAM'deki indeks üzerinden (Index-Only Scan) yanıtlayacak hale getirmek.

### 📋 Mimari Analiz (PDF Referansı: Sayfa 15)
1.  **Senaryo:** Uygulama açıldığında `SELECT username, total_xp, streak_days FROM users WHERE id = ?` sorgusu çalışır.
2.  **Standart İndeks (PK):** Primary Key (`id`) zaten bir indekstir. Ancak bu indeks sadece `id`'nin yerini (pointer) tutar. Diğer verileri okumak için diskteki tablo satırına (Heap Fetch) gitmek gerekir.
3.  **Covering Index:** İndeks yapısına `INCLUDE (username, total_xp, streak_days)` eklersek, PostgreSQL cevabı direkt indeksten verir. Maliyet (Cost) yarıya düşer.

### 🛠 Implementation Task

#### 1. Prisma Model Notu (`schema.prisma`)
Prisma şema dosyasında `INCLUDE` sözdizimi henüz tam stabil (GA) değildir ve veritabanı sağlayıcısına göre değişir. Bu yüzden şemada standart bir indeks tanımlayıp, migration dosyasında onu "upgrade" edeceğiz.

```prisma
// schema.prisma

model User {
  // ... alanlar
  
  // Dashboard sorgusu için "niyetimizi" belli eden bir indeks tanımı.
  // Prisma bunu standart bir indeks olarak oluşturacak, biz SQL ile güçlendireceğiz.
  @@index([id], name: "idx_users_dashboard_covering") 
}
```

#### 2. Migration Müdahalesi (Manuel SQL)
Bu adımda indeksi "Kapsayan İndeks"e çeviriyoruz.

1.  Migration oluştur:
    ```bash
    npx prisma migrate dev --create-only --name optimize_user_dashboard
    ```
2.  Oluşan SQL dosyasını aç ve içeriği değiştir:

```sql
-- Önce Prisma'nın oluşturacağı (veya mevcut olan) standart indeksi kaldır
DROP INDEX IF EXISTS "idx_users_dashboard_covering";

-- COVERING INDEX OLUŞTURMA
-- Anahtar: id (Arama kriteri)
-- Include: username, total_xp, streak_days (Select listesindeki alanlar)
-- settings, email vb. alanları eklemiyoruz, çünkü indeks boyutunu gereksiz şişirir.

CREATE INDEX "idx_users_dashboard_covering" 
ON "users" ("id") 
INCLUDE ("username", "total_xp", "streak_days", "current_course_id");

-- Not: Primary Key zaten 'id' üzerinde unique index oluşturur. 
-- Ancak PK'ler genelde INCLUDE desteklemez (Postgres versiyonuna göre değişir).
-- Bu yüzden dashboard'a özel ayrı bir indeks, okuma yükünü izole etmek için iyidir.
```

3.  Migration'ı uygula: `npx prisma migrate dev`

### 🔍 Senior Dev Test Senaryosu (Index-Only Scan)
Bu optimizasyonun çalıştığını kanıtlamak zorundasın.

1.  SQL İstemcisinde şu sorguyu analiz et:
    ```sql
    EXPLAIN (ANALYZE, VERBOSE, BUFFERS)
    SELECT username, total_xp, streak_days 
    FROM users 
    WHERE id = '...bir-uuid...';
    ```

2.  **Çıktı Analizi:**
    *   **Kötü:** `Index Scan using users_pkey` -> `Heap Fetches: 1` (Tabloya gitti).
    *   **İyi:** `Index Only Scan using idx_users_dashboard_covering` -> `Heap Fetches: 0` (Tabloya gitmedi).

### ✅ Definition of Done
1.  Veritabanında `idx_users_dashboard_covering` indeksinin oluştuğu ve `INCLUDE` sütunlarını barındırdığı doğrulandı.
2.  Dashboard sorgusunun `Heap Fetches: 0` ile çalıştığı test edildi.
3.  Kullanıcı profilini güncellerken (Write) bu indeksin getirdiği ek maliyetin ihmal edilebilir düzeyde olduğu değerlendirildi (Sadece 3 sütun içeriyor).

---

**Devam et** dediğinde, bu devasa planın finaline geliyoruz. **Faz 30: Batch Insert Stratejisi (Acil Durum Planı)**. Veritabanı artık yazma yükünü kaldıramadığında ne yapacağız? Kuyruk (Queue) mimarisini kuracağız.