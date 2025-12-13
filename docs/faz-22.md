
---

# Phase 22: Transaction Ledger & Financial Partitioning

**Durum:** Finansal Denetim ve Loglama (Audit Trail).
**Hedef:** Her para giriş-çıkışını (Credit/Debit) değişmez (Immutable) bir defterde tutmak, bakiyenin anlık görüntüsünü (Snapshot) saklamak ve bu devasa tabloyu zamana göre bölümlemek.

### 📋 Mimari Gereklilikler (PDF Referansı: Sayfa 11, 12)
1.  **Append-Only:** Bu tabloya sadece `INSERT` yapılır. Asla `UPDATE` veya `DELETE` yapılmaz.
2.  **Partitioning:** Veri `created_at` tarihine göre aylık bölümlere ayrılır.
3.  **Snapshot:** Her işlemde `balance_after` sütunu o anki son bakiyeyi tutar. Bu, geçmişi hesaplarken tüm satırları toplamaktan (Replay) kurtarır.
4.  **Esnek Referans:** `reference_id` sütunu polimorfiktir. Bazen "item_101" (eşya alımı), bazen "lesson_55" (ders ödülü) değerini alır.

### 🛠 Implementation Task

#### 1. Prisma Model Tanımı (`schema.prisma`)
Modeli tanımla. Tıpkı Faz 14'teki gibi, Partition Key (`createdAt`) Primary Key'in bir parçası olmalı.

```prisma
// --------------------------------------------------------
// MODEL: TRANSACTION HISTORY (Partitioned Ledger)
// PDF Ref: Sayfa 11-12
// --------------------------------------------------------
model TransactionHistory {
  // Global Sequence ID
  id              BigInt   @default(autoincrement())

  userId          String   @map("user_id") @db.Uuid
  // User ilişkisi tanımlamıyoruz (Performans ve Partition kısıtı)

  currency        Currency // Enum ('GEMS', etc.)
  
  // İşlem miktarı: Pozitif (Kazanım) veya Negatif (Harcama)
  amount          Int

  // İşlem sonrası cüzdan bakiyesi (Snapshot)
  balanceAfter    Int      @map("balance_after")

  // İşlem Tipi: 'STORE_PURCHASE', 'LESSON_REWARD', 'LOOT_BOX'
  // String tutuyoruz, enum yerine daha esnek olsun.
  transactionType String   @map("transaction_type") @db.VarChar(50)

  // Neye istinaden? 'item_5', 'course_1_unit_2'
  referenceId     String?  @map("reference_id") @db.VarChar(100)

  // PARTITION KEY
  createdAt       DateTime @default(now()) @map("created_at") @db.Timestamptz

  // PK: Partition Key'i içermek zorunda.
  @@id([userId, createdAt, id])
  
  // İndeksler (Sorgu: Kullanıcının son harcamaları)
  @@index([userId, createdAt(sort: Desc)])

  @@map("transaction_history")
}
```

#### 2. Manuel SQL Müdahalesi (Partitioning)
Prisma modelini migrate etmeden önce SQL dosyasını manipüle ederek tabloyu parçalara ayırıyoruz.

1.  Migration oluştur:
    ```bash
    npx prisma migrate dev --create-only --name create_partitioned_ledger
    ```
2.  SQL dosyasını aç ve içeriği değiştir:

```sql
-- 1. Ana Tabloyu Partitioned Olarak Oluştur
CREATE TABLE "transaction_history" (
    "id" BIGSERIAL NOT NULL,
    "user_id" UUID NOT NULL,
    "currency" "Currency" NOT NULL,
    "amount" INTEGER NOT NULL,
    "balance_after" INTEGER NOT NULL,
    "transaction_type" VARCHAR(50) NOT NULL,
    "reference_id" VARCHAR(100),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transaction_history_pkey" PRIMARY KEY ("user_id", "created_at", "id")
) PARTITION BY RANGE ("created_at");

-- 2. İndeksler
CREATE INDEX "transaction_history_user_id_created_at_idx" 
ON "transaction_history" ("user_id", "created_at" DESC);

-- 3. İlk Partitionlar (Bootstrap)
-- Default Partition
CREATE TABLE transaction_history_default PARTITION OF transaction_history DEFAULT;

-- Örnek: Gelecek 2 ay (Tarihleri güncel zamana göre ayarla)
CREATE TABLE transaction_history_y2025m01 PARTITION OF transaction_history
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE transaction_history_y2025m02 PARTITION OF transaction_history
    FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');
```

3.  Migration'ı uygula: `npx prisma migrate dev`

#### 3. Servis Entegrasyonu (Store Service Update)
Faz 21'de yazdığımız `StoreService` içindeki yorum satırını (Adım 5) artık gerçek kodla değiştirebiliriz.

```typescript
// store.service.ts içindeki transaction bloğuna ekle:

// ... (Önceki adımlar: Kilit, Kontrol, Düşme, Envanter)

// ADIM 5: İşlemi Logla
await tx.transactionHistory.create({
  data: {
    userId,
    currency: 'GEMS',
    amount: -item.costGems, // Harcama olduğu için negatif
    balanceAfter: currentBalance - item.costGems, // Hesaplanan son bakiye
    transactionType: 'STORE_PURCHASE',
    referenceId: `item_${itemId}`,
    createdAt: new Date(), // Partition Key
  }
});
```

### ✅ Definition of Done
1.  `transaction_history` tablosunun "Partitioned Table" olarak oluştuğu doğrulandı.
2.  Fiziksel alt tabloların (`_y2025m01` vb.) varlığı kontrol edildi.
3.  Satın alma işlemi yapıldığında log tablosuna bir satır eklendiği, `amount` değerinin negatif olduğu ve `balance_after` değerinin doğru olduğu test edildi.
4.  Kullanıcı silinse bile bu tablonun çok büyük olduğu için `ON DELETE CASCADE` yerine, yasalar gereği saklanması veya manuel arşivlenmesi gerektiği not edildi (Prisma şemasında User ilişkisi kurmadığımız için Cascade çalışmaz, bu bilinçli bir tercihtir).

---

**Devam et** dediğinde, tüm bu işlemleri (Satın Alma, Kutu Açma) NestJS tarafında daha temiz yönetmek için **Faz 23: Interactive Transactions Best Practices** ve **Deadlock Koruması** konusuna değineceğiz. Sonra da oyunlaştırmaya (Gamification) geçeceğiz.