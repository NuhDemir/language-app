
---

# Phase 27: Weighted Randomness Strategy (Stored Procedures)

**Durum:** Şans Kutusu (Loot Box) Mekanizması.
**Hedef:** Ağırlıklı rastgele seçim (Weighted Random Search) algoritmasını, Node.js tarafında değil, PostgreSQL içinde çalışan performanslı bir **Stored Procedure (PL/pgSQL Function)** olarak uygulamak.

### 📋 Mimari Prensipler (PDF Referansı: Sayfa 16, 17)
1.  **Ağırlık Mantığı:** Olasılıkları yüzdelik (%) değil, tam sayı ağırlık (Weight) olarak tutarız.
    *   Efsanevi Kılıç: Weight 1 (Çok nadir)
    *   Elma: Weight 1000 (Çok yaygın)
2.  **Logic in DB:** Tüm olasılık tablosunu (`LootBoxRate`) çekmek yerine, sadece `box_id` gönderip kazanan `item_id`'yi geri alırız.

### 🛠 Implementation Task

#### 1. Prisma Model Tanımı (`schema.prisma`)
Kutu tanımlarını ve olasılık oranlarını tutacak tabloları ekleyin.

```prisma
// --------------------------------------------------------
// MODEL: LOOT BOX (Kutu Tanımı)
// PDF Ref: Sayfa 14
// --------------------------------------------------------
model LootBox {
  id        Int      @id @default(autoincrement())
  name      String   @db.VarChar(100)
  costGems  Int      @map("cost_gems")
  
  rates     LootBoxRate[]

  @@map("loot_boxes")
}

// --------------------------------------------------------
// MODEL: LOOT BOX RATE (Olasılık Tablosu)
// --------------------------------------------------------
model LootBoxRate {
  id        Int      @id @default(autoincrement())
  
  lootBoxId Int      @map("loot_box_id")
  lootBox   LootBox  @relation(fields: [lootBoxId], references: [id])

  // Kazanılan şey nedir? 'GEMS', 'ITEM'
  itemType  String   @map("item_type") @db.VarChar(50)
  
  // Değeri nedir? '50' (Gem ise), 'item_123' (Eşya ise)
  itemValue String   @map("item_value") @db.VarChar(100)
  
  // Çıkma Olasılığı (Ağırlık)
  weight    Int      // CHECK (weight > 0) eklenecek
  
  // UI Efekti için (Veritabanı mantığını etkilemez)
  isRare    Boolean  @default(false) @map("is_rare")

  @@map("loot_box_rates")
}
```

#### 2. Migration ve Stored Procedure (Manual SQL)
Prisma fonksiyonları (function) native desteklemez. Migration dosyasında fonksiyonu elle yazacağız.

1.  Migration oluştur:
    ```bash
    npx prisma migrate dev --create-only --name create_lootbox_procedure
    ```
2.  SQL dosyasını aç ve PDF Sayfa 17'deki algoritmayı yapıştır:

```sql
-- Tabloları oluştur
CREATE TABLE "loot_boxes" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(100) NOT NULL,
    "cost_gems" INTEGER NOT NULL
);

CREATE TABLE "loot_box_rates" (
    "id" SERIAL PRIMARY KEY,
    "loot_box_id" INTEGER NOT NULL REFERENCES "loot_boxes"("id"),
    "item_type" VARCHAR(50) NOT NULL,
    "item_value" VARCHAR(100) NOT NULL,
    "weight" INTEGER NOT NULL CHECK (weight > 0),
    "is_rare" BOOLEAN DEFAULT false
);

-- STORED PROCEDURE: pick_loot_item
-- Girdi: box_id
-- Çıktı: item_value (Kazanan eşyanın değeri/ID'si)

CREATE OR REPLACE FUNCTION pick_loot_item(p_box_id INT) 
RETURNS TEXT AS $$
DECLARE
  v_total_weight INT;
  v_random_val   INT;
  rec            RECORD;
  v_current_sum  INT := 0;
BEGIN
  -- 1. Toplam ağırlığı hesapla
  SELECT SUM(weight) INTO v_total_weight 
  FROM loot_box_rates 
  WHERE loot_box_id = p_box_id;

  IF v_total_weight IS NULL THEN
    RETURN NULL;
  END IF;

  -- 2. 1 ile Toplam arasında rastgele sayı üret
  -- floor(random() * (max - min + 1) + min)
  v_random_val := floor(random() * v_total_weight + 1)::INT;

  -- 3. Kümülatif toplam ile kazananı bul
  FOR rec IN 
    SELECT item_value, weight 
    FROM loot_box_rates 
    WHERE loot_box_id = p_box_id 
    ORDER BY id -- Deterministik sıralama için önemli
  LOOP
    v_current_sum := v_current_sum + rec.weight;
    
    IF v_current_sum >= v_random_val THEN
       RETURN rec.item_value;
    END IF;
  END LOOP;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;
```

3.  Migration'ı uygula: `npx prisma migrate dev`

#### 3. Servis Entegrasyonu (`loot-box.service.ts`)
Artık bu fonksiyonu servisten tek satırda çağırabiliriz.

```typescript
// loot-box.service.ts
async openLootBox(boxId: number, tx?: PrismaTx) {
  const db = tx || this.prisma;
  
  // DB Fonksiyonunu Çağır
  // Not: Fonksiyon TEXT döner, sayısal ID ise parse etmelisin.
  const result = await db.$queryRaw<{ pick_loot_item: string }[]>`
    SELECT pick_loot_item(${boxId})
  `;

  const winningValue = result[0]?.pick_loot_item;

  if (!winningValue) throw new Error("Loot box is empty!");

  return winningValue; // Örn: "item_55" veya "50"
}
```

### ✅ Definition of Done
1.  `loot_boxes` ve `loot_box_rates` tabloları oluşturuldu.
2.  PostgreSQL içinde `pick_loot_item` fonksiyonunun tanımlandığı (`\df` komutu ile) doğrulandı.
3.  Veritabanına test verisi (1 Kutu, 2 Eşya: Biri weight 1, diğeri weight 100) girildi.
4.  Fonksiyon 100 kez çağrıldığında sonucun ağırlıklara uygun dağıldığı (yaklaşık %1 ve %99) gözlemlendi.

---

**Devam et** dediğinde, kullanıcıyı sistemde tutan en güçlü motivasyon kaynağına, **Faz 28: Başarım Sistemi (Achievements)** ve JSONB kullanımına geçeceğiz. Her yeni başarım için yeni sütun açma hatasına düşmeyeceğiz.