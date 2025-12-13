
---

# Phase 19: Wallet Architecture (Zero-Trust Balance Protection)

**Durum:** Sanal Ekonomi Altyapısı (Cluster C).
**Hedef:** Kullanıcı cüzdanlarını, uygulama mantığı hatalı olsa bile negatif bakiyeye düşmeyi **fiziksel olarak reddedecek** şekilde (Defense in Depth) tasarlamak.

### 📋 Mimari Prensipler (PDF Referansı: Sayfa 10)
1.  **Çift Anahtar (Composite Key):** Her cüzdan satırı `(user_id, currency)` çifti ile benzersizdir. Bir kullanıcının "GEMS" cüzdanından sadece bir tane olabilir.
2.  **Enum Kullanımı:** Para birimleri string ('Gems') değil, veritabanı seviyesinde `ENUM` ('GEMS', 'HEARTS') olarak tanımlanır. Hatalı veri girişini engeller.
3.  **CHECK Constraint:** Veritabanı seviyesinde `CHECK (balance >= 0)` kısıtlaması zorunludur.

### 🛠 Implementation Task

#### 1. Prisma Model Tanımı (`schema.prisma`)
`Currency` enum'ını ve `UserWallet` modelini tanımlayın.

```prisma
// --------------------------------------------------------
// ENUM: CURRENCY TYPE
// PDF Ref: Sayfa 10
// --------------------------------------------------------
enum Currency {
  GEMS
  LINGOTS
  HEARTS
}

// --------------------------------------------------------
// MODEL: USER WALLET
// Hedef: Negatif bakiye imkansız olmalı.
// --------------------------------------------------------
model UserWallet {
  userId    String   @map("user_id") @db.Uuid
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  currency  Currency // Enum tipi
  
  // Varsayılan 0 bakiye.
  // Uygulama tarafında "yeni kullanıcı bonusu" verilecekse Create anında set edilir.
  balance   Int      @default(0)

  updatedAt DateTime @default(now()) @updatedAt @map("updated_at") @db.Timestamptz

  // COMPOSITE KEY
  // Bir kullanıcının tek bir para birimi için tek bir cüzdanı olur.
  @@id([userId, currency])
  
  @@map("user_wallets")
}

// --------------------------------------------------------
// MEVCUT MODEL GÜNCELLEMESİ: USER
// --------------------------------------------------------
// model User {
//   ...
//   wallets UserWallet[]
// }
```

#### 2. Manuel SQL Müdahalesi (CHECK Constraint)
Prisma şu an şema dosyasında `CHECK` constraint tanımlamayı native olarak desteklemiyor (desteklese de migration'a her zaman yansımıyor). Bunu manuel ekleyeceğiz.

1.  Migration oluştur:
    ```bash
    npx prisma migrate dev --create-only --name create_wallets_with_check
    ```
2.  Oluşan SQL dosyasını aç ve tablonun sonuna `CONSTRAINT` ekle:

```sql
-- Enum Oluşturma (Prisma otomatik yapar ama kontrol et)
-- CREATE TYPE "Currency" AS ENUM ('GEMS', 'LINGOTS', 'HEARTS');

CREATE TABLE "user_wallets" (
    "user_id" UUID NOT NULL,
    "currency" "Currency" NOT NULL,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_wallets_pkey" PRIMARY KEY ("user_id","currency"),
    
    -- DEFENSE IN DEPTH: 
    -- Uygulama hata yapsa bile veritabanı negatif bakiyeyi reddeder.
    CONSTRAINT "chk_wallet_balance_non_negative" CHECK (balance >= 0)
);

-- Foreign Key
ALTER TABLE "user_wallets" ADD CONSTRAINT "user_wallets_user_id_fkey" 
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

3.  Migration'ı uygula: `npx prisma migrate dev`

### 🔍 Senior Dev Test Senaryosu (Panic Test)
Bu kısıtlamanın çalıştığını kanıtlamalısın.

1.  Veritabanına manuel bir SQL sorgusu atarak bakiyeyi eksiye düşürmeyi dene:
    ```sql
    INSERT INTO user_wallets (user_id, currency, balance) VALUES ('...uuid...', 'GEMS', -50);
    -- VEYA --
    UPDATE user_wallets SET balance = balance - 1000 WHERE balance < 1000;
    ```
2.  **Beklenen Sonuç:** PostgreSQL hatası: `new row for relation "user_wallets" violates check constraint "chk_wallet_balance_non_negative"`.
3.  Eğer bu hatayı alıyorsan, sistem güvendedir. Uygulama tarafındaki Race Condition hataları bile veritabanını bozamaz.

### ✅ Definition of Done
1.  `user_wallets` tablosu oluşturuldu.
2.  Para birimi olarak `ENUM` kullanıldığı doğrulandı.
3.  `CHECK (balance >= 0)` kısıtlamasının aktif olduğu test edildi.
4.  Kullanıcı silindiğinde cüzdanının da silindiği (Cascade) görüldü.

---

**Devam et** dediğinde, bu cüzdanla satın alınacak eşyaların tanımlandığı **Faz 20: Envanter Yönetimi ve Eşya Yapısı** aşamasına geçeceğiz. Kostümler ve güçlendirmeler (Power-ups) burada tanımlanacak. 