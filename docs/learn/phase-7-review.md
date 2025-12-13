# Faz 7 Teknik İncelemesi: Hiyerarşik Yapı (Units & Levels)

Bu doküman, müfredat ağacının (Curriculum Tree) "neden" ve "nasıl" tasarlandığını derinlemesine analiz eder.

---

## 📚 Bölüm 1: Hiyerarşik Veri Modelleme

### 1.1 Yapı: Course → Unit → Level

```
Course: "Türkçe Konuşanlar İçin İngilizce"
├── Unit 1: "Temel Selamlaşmalar"
│   ├── Level 1 (5 ders)
│   ├── Level 2 (5 ders)
│   └── Level 3 (5 ders)
├── Unit 2: "Yiyecek ve İçecekler"
│   ├── Level 1 (5 ders)
│   └── Level 2 (5 ders)
└── Unit 3: "Seyahat"
    └── ...
```

### 1.2 Neden "Strict Relational"?

| Alternatif                    | Avantaj                   | Dezavantaj          |
| ----------------------------- | ------------------------- | ------------------- |
| Single Table (Adjacency List) | Basit                     | Deep query karmaşık |
| Nested Sets                   | Hızlı okuma               | Yazma karmaşık      |
| **Ayrı Tablolar**             | Tip güvenliği, net ilişki | Daha fazla JOIN     |

**Karar:** Müfredat yapısı nadiren değişir, sık sorgulanır. Ayrı tablolar en okunabilir ve bakımı kolay yaklaşımdır.

---

## 📚 Bölüm 2: Order Index ve Unique Constraint

### 2.1 Problem: Sıralama Garantisi

Kullanıcı Unit 1'i Unit 2'den önce görmeli. Veritabanı sırası garanti değil. `ORDER BY id` doğru sıra vermez (id üretim sırasına bağlı).

### 2.2 Çözüm: Explicit Order Index

```prisma
model Unit {
  orderIndex Int @map("order_index")

  // Aynı kursta aynı sıra numarası olamaz
  @@unique([courseId, orderIndex], name: "uq_unit_order")
}
```

**Kod Analizi:**

- `orderIndex`: Manuel olarak atanan sıra numarası (1, 2, 3...).
- `@@unique`: Composite unique constraint. Aynı `courseId` için duplicate `orderIndex` engellenr.

### 2.3 Trade-off: Reorder Maliyeti

Sıra değiştirmek için birden fazla UPDATE gerekir:

```sql
-- Unit 3'ü 1. sıraya taşımak için:
UPDATE units SET order_index = order_index + 1 WHERE course_id = 1 AND order_index >= 1;
UPDATE units SET order_index = 1 WHERE id = 3;
```

Bu karmaşıklık kabul edilebilir çünkü reorder **nadiren** yapılır.

---

## 📚 Bölüm 3: Cascade Delete

### 3.1 Problem: Orphan Data

Kurs silindiğinde üniteleri ne olacak? Manuel silme unutulursa "yetim veri" (orphan data) oluşur.

### 3.2 Çözüm: onDelete Cascade

```prisma
model Unit {
  course Course @relation(fields: [courseId], references: [id], onDelete: Cascade)
}

model Level {
  unit Unit @relation(fields: [unitId], references: [id], onDelete: Cascade)
}
```

**Davranış:**

1. Course silindiğinde → tüm Unit'ler otomatik silinir
2. Unit silindiğinde → tüm Level'lar otomatik silinir

**Trade-off:**

> Cascade silme tehlikelidir. Yanlışlıkla parent silinirse tüm çocuklar kaybolur. Soft delete (is_deleted flag) daha güvenli olabilir ama Content Management için hard delete kabul edilebilir.

---

## 📚 Bölüm 4: JSONB Guidebook Content

### 4.1 Neden JSONB?

Ünite rehberleri zengin içerik olabilir:

```json
{
  "sections": [
    { "header": "Fiiller", "body": "..." },
    { "header": "Zamirler", "body": "..." }
  ]
}
```

Bu yapıyı ilişkisel tabloda modellemek:

- `guidebook_sections` tablosu gerekir
- Her section için ayrı kayıt
- JOIN maliyeti

JSONB ile tek sütunda, tek sorguda tüm içerik gelir.

---

## 📚 Bölüm 5: Gap Analizi

### 5.1 Mevcut Eksiklikler

| #   | Eksik                        | Etki                       | Öncelik    |
| --- | ---------------------------- | -------------------------- | ---------- |
| 1   | Unit/Level modelleri yok     | Müfredat tanımlanamaz      | 🔴 Blocker |
| 2   | Course'ta units ilişkisi yok | Prisma generate hata verir | 🔴 Blocker |

### 5.2 Öncelikli Düzeltmeler

1. **Unit modeli eklenmesi**
2. **Level modeli eklenmesi**
3. **Course modeli güncellenmesi** (units relation)

---

**Bu doküman, Phase 7 hiyerarşik yapıyı açıklar.**
