
---

# Phase 4: User Core & Denormalization (Cluster B)

**Durum:** Kullanıcı veritabanı şemasının oluşturulması.
**Hedef:** Milyonlarca satıra ulaşacak `users` tablosunu; güvenlik (UUID), esneklik (JSONB) ve okuma performansı (Denormalization) ilkelerine göre oluşturmak.

### 📋 Teknik Gereksinimler (PDF Referansları: Sayfa 7, 16)
*   **Küme:** Cluster B (User Progress). En yüksek yazma trafiğini alacak bölge.
*   **Primary Key:** Sıralı tamsayı (Serial) değil, **UUID v4** kullanılmalı. Bu, veritabanı şarding (parçalama) yapıldığında ID çakışmalarını önler ve ID tahminini zorlaştırır.
*   **Performans (Denormalizasyon):** `SUM(xp)` sorguları sistem performansını öldüreceği için, `total_xp` kullanıcının üzerinde bir sayaç olarak tutulmalı.
*   **JSONB Stratejisi:** Kullanıcı ayarları (tema, sesler) için ayrı bir tablo açılmamalı, `users` tablosunda `settings` JSONB sütunu kullanılmalı.

### 🛠 Uygulama Adımları

#### 1. Prisma Modeli Tanımı (`schema.prisma`)
`User` modelini ekleyin.
*   **Not:** Henüz `Course` tablosu (Faz 6) oluşturulmadığı için, PDF'te görünen `current_course_id` alanını şimdilik **yorum satırına** alıyoruz veya null bırakılabilir `BigInt` olarak tanımlayıp ilişkiyi (relation) sonra kuruyoruz. Göç (Migration) hatası almamak için ilişkiyi sonra kurmak en temizidir.

```prisma
model User {
  // PK: UUID v4 (PostgreSQL gen_random_uuid())
  id           String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  
  // Kimlik Bilgileri
  username     String   @unique @db.VarChar(30)
  email        String   @unique @db.VarChar(255)
  passwordHash String   @map("password_hash") @db.VarChar(255)

  // --------------------------------------------------------
  // DENORMALIZATION FIELDS (Performans İçin)
  // PDF Sayfa 16: "users tablosunda total_xp sütunu tutulur."
  // --------------------------------------------------------
  
  // Leaderboard hesaplaması için önbellek (Cache)
  totalXp      BigInt   @default(0) @map("total_xp")
  
  // Streak mekanizması için sayaç
  streakDays   Int      @default(0) @map("streak_days")
  
  // Streak bozulup bozulmadığını kontrol etmek için son tarih
  lastActivity DateTime? @map("last_activity_date") @db.Date

  // --------------------------------------------------------
  // JSONB SETTINGS (Esneklik İçin)
  // PDF Sayfa 3 & 7: "Kullanıcı Ayarları JSONB"
  // UI tercihleri buraya gömülür.
  // Varsayılan değer: { "daily_goal": 50, "sound_effects": true }
  // --------------------------------------------------------
  settings     Json     @default("{\"daily_goal\": 50, \"sound_effects\": true}")

  // Metadata
  createdAt    DateTime @default(now()) @map("created_at") @db.Timestamptz
  updatedAt    DateTime @default(now()) @updatedAt @map("updated_at") @db.Timestamptz

  @@map("users") // Tablo adı çoğul
}
```

#### 2. Migration Oluşturma
UUID uzantısının (extension) aktif olduğundan emin olmalıyız. Prisma genellikle bunu otomatik halleder ama manuel kontrol iyidir.

```bash
npx prisma migrate dev --name init_users_table
```

*Oluşan SQL (Migration Dosyası) Kontrolü:*
PostgreSQL'de UUID üretimi için `pgcrypto` uzantısı gerekebilir (Postgres 13 öncesi). Postgres 16'da `gen_random_uuid()` yerleşiktir (built-in).

```sql
-- Migration.sql içinde görmeniz gereken:
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "username" VARCHAR(30) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "total_xp" BIGINT NOT NULL DEFAULT 0,
    "streak_days" INTEGER NOT NULL DEFAULT 0,
    "last_activity_date" DATE,
    "settings" JSONB NOT NULL DEFAULT '{"daily_goal": 50, "sound_effects": true}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- İndeksler
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
```

#### 3. TypeScript Interface (Settings)
JSONB alanını kod tarafında güvenli kullanmak için (Type Safety) bir arayüz tanımlayın. Bunu projenin `src/common/interfaces` klasörüne koyabilirsiniz.

```typescript
// src/interfaces/user-settings.interface.ts
export interface UserSettings {
  daily_goal: number;
  sound_effects: boolean;
  dark_mode?: boolean; // Gelecekte eklenebilir, migration gerektirmez!
}
```

### ✅ Definition of Done (Bitti Tanımı)
1.  `users` tablosu oluşturuldu.
2.  `id` sütunu UUID tipinde ve otomatik değer üretiyor.
3.  `total_xp` ve `streak_days` sütunları varsayılan 0 değeriyle geldi.
4.  `settings` sütunu JSONB tipinde ve varsayılan JSON objesiyle oluştu.
5.  `email` ve `username` üzerinde UNIQUE constraint var.

---

**Devam et** dediğinde, **Faz 5**'i atlayacağız (çünkü Faz 4 içinde JSONB ayarlarını hallettik) ve doğrudan **Faz 6: Kurs İskeleti (Course Skeleton)** ile İçerik Motoruna geri döneceğiz. Ancak listenin tutarlılığı için "Faz 5: JSONB Ayarları"nı tamamlanmış sayıp Faz 6'ya geçiş yapacağız.