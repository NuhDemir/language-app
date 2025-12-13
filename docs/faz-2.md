
---

# Phase 2: Database Naming Constitution & Standards

**Durum:** Şema tasarımı öncesi kurallar bütünü.
**Hedef:** Büyük ekiplerde kod kalitesini, SQL okunabilirliğini ve ORM uyumluluğunu garanti altına alacak katı isimlendirme standartlarını (Naming Conventions) belirlemek ve uygulamak.

### 📋 Teknik Gereksinimler ve Prensipler (PDF Referansları)
*   **Kaynak:** PDF Sayfa 3, Bölüm 1.3 (İsimlendirme Konvansiyonları).
*   **Dil:** Tamamen İngilizce.
*   **Format:** `snake_case` (Küçük harf ve alt çizgi). CamelCase veritabanında yasak.
*   **Felsefe:** Tablo isimleri çoğul (bir koleksiyonu temsil eder), sütun isimleri tekil.

### 🛠 Uygulama Adımları ve Kurallar

#### 1. Genel Sözdizimi Kuralları (General Syntax)
Veritabanı nesnelerinde sadece `[a-z0-9_]` karakterleri kullanılacaktır.
*   **Doğru:** `user_settings`, `last_login_at`
*   **Yanlış:** `UserSettings`, `LastLogin`, `kullanıcı_ayarları`

#### 2. Tablo İsimlendirme Standardı
Tablolar mantıksal olarak birer kayıt kümesidir. Bu nedenle **Çoğul (Plural)** isimler zorunludur. Bu yapı, Prisma ve TypeORM gibi araçların otomatik eşleştirme standartlarıyla uyumludur.

*   **Örnekler:**
    *   `users` (Tekil `user` yasak)
    *   `course_units` (Snake case ile ayrılmış)
    *   `daily_events`

#### 3. Sütun ve Anahtar Stratejisi (Columns & Keys)
Sütunlar bir niteliği temsil eder, **Tekil (Singular)** olmalıdır. Macar notasyonundan (Hungarian Notation - `strName`, `intCount`) kaçınılmalıdır.

*   **Primary Key (PK):** Her tabloda istisnasız `id` adında bir PK olacaktır.
    *   Tipi: PDF Sayfa 3 uyarınca `UUID v4` (dağıtık sistemler/users için) veya `BIGSERIAL` (sıralı loglar/items için) seçilecektir.
    *   *Yanlış:* `user_id` (tablonun içinde), `uuid`.
    *   *Doğru:* `id`.

*   **Foreign Key (FK):** İlişki kurulan tablonun **tekil adı** + `_id` soneki.
    *   Bu format, SQL JOIN sorgularında `ON users.id = enrollments.user_id` okunabilirliğini sağlar.
    *   *Yanlış:* `user`, `owner`, `creator`.
    *   *Doğru:* `user_id`, `assigned_user_id` (özel durumlarda önek eklenebilir ama `_id` bitişi zorunludur).

#### 4. İndeks ve Kısıtlama İsimlendirmesi (Constraints)
Hata ayıklarken (Debugging) hangi kısıtlamanın patladığını anlamak için bu format hayati önem taşır.

*   **Normal İndeks:** `idx_[tablo_adı]_[sütun_adları]`
    *   Örn: `idx_users_email`
*   **Unique İndeks:** `uq_[tablo_adı]_[sütun_adları]`
    *   Örn: `uq_users_username`
*   **Foreign Key Constraint:** `fk_[tablo]_[hedef_tablo]`
*   **Primary Key Constraint:** `pk_[tablo]`

### 🔍 "Senior Dev" Code Review Checklist (Örnek Prisma Modeli)

Aşağıdaki şablonu projenin `schema.prisma` dosyasının en tepesine yorum satırı olarak ekleyin.

```prisma
// --------------------------------------------------------
// NAMING CONVENTION CHECKLIST
// 1. Language: English only.
// 2. Case: snake_case for DB columns/tables (map in Prisma).
// 3. Tables: Plural (e.g., 'users').
// 4. PK: Always 'id'.
// 5. FK: 'target_singular_name' + '_id'.
// --------------------------------------------------------

// ÖRNEK MODEL (BAD vs GOOD)

// ❌ BAD
// model UserSettings {
//   UserID String @id
//   strPreferences String
// }

// ✅ GOOD (Prisma)
// model UserSettings {
//   id          String @id @default(uuid())
//   user_id     String
//   preferences Json
//
//   @@map("user_settings") // DB tarafında snake_case zorla
// }
```

### ✅ Definition of Done (Bitti Tanımı)
1.  Takım içindeki tüm geliştiriciler bu kuralları okudu ve onayladı.
2.  Linter veya CI/CD pipeline'ında bu isimlendirmeleri denetleyecek (varsa) kurallar gözden geçirildi.
3.  Projenin `README.md` dosyasına "Database Standards" bölümü eklendi.

---

**Devam et** dediğinde, bu kuralları uygulayarak ilk fiziksel tablolarımızı oluşturacağımız **Faz 3: Dil Altyapısı (Cluster A)** aşamasına geçeceğiz.