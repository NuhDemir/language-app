# Faz 10 Teknik İncelemesi: GIN İndeksleme Stratejisi

Bu doküman, JSONB performans optimizasyonu için GIN indeksini derinlemesine analiz eder.

---

## 📚 Bölüm 1: B-Tree vs GIN

### 1.1 B-Tree'nin Limiti

B-Tree indeksler sıralı veri için optimizedir:

```sql
-- B-Tree mükemmel çalışır:
WHERE age > 18 AND age < 65
WHERE username = 'john'
```

Ancak JSON hiyerarşik yapıdadır:

```json
{ "tokens": ["apple", "banana"], "difficulty": "hard" }
```

`WHERE content @> '{"tokens": ["apple"]}'` sorgusu B-Tree ile **Full Table Scan** yapar.

### 1.2 GIN Nasıl Çalışır?

GIN (Generalized Inverted Index) bir "ters indeks"tir:

```
Kitap Analojisi:
  Kitap İndeksi: "elma" → Sayfa 5, 12, 45
  GIN İndeksi:   "apple" → Satır 1, 5, 99
```

| Token    | Satır ID'leri |
| -------- | ------------- |
| `apple`  | 1, 5, 99      |
| `banana` | 2, 5, 88      |
| `hard`   | 1, 2, 99      |

---

## 📚 Bölüm 2: jsonb_path_ops Optimizasyonu

### 2.1 Varsayılan vs Optimized

| Operatör Sınıfı       | Desteklenen Operatörler   | Boyut               | Kullanım         |
| --------------------- | ------------------------- | ------------------- | ---------------- | ------------------------ |
| `jsonb_ops` (default) | `?`, `?                   | `, `?&`, `@>`, `<@` | Büyük            | Anahtar varlık sorguları |
| `jsonb_path_ops`      | `@>` (sadece containment) | 30-50% daha küçük   | İçerik aramaları |

### 2.2 Neden jsonb_path_ops?

Bizim sorgularımız:

```sql
WHERE content @> '{"tokens": ["apple"]}'  -- ✅ jsonb_path_ops destekler
WHERE content ? 'tokens'                   -- ❌ jsonb_path_ops desteklemez (ama buna ihtiyacımız yok)
```

---

## 📚 Bölüm 3: Write Penalty

### 3.1 Trade-off

GIN indeksler **yazma maliyetini artırır**:

- Her INSERT/UPDATE'de indeks güncellenir
- PostgreSQL `fastupdate` ile bunu "Pending List"te toplar
- Periyodik olarak ana indekse yazar

### 3.2 Karar

Content (egzersiz içeriği) nadiren güncellenir, sık okunur. GIN maliyeti kabul edilebilir.

---

## 📚 Bölüm 4: Prisma ile Sorgulama

```typescript
// Raw query ile containment sorgusu
const results = await prisma.$queryRaw`
  SELECT * FROM exercises 
  WHERE content @> '{"tokens": ["apple"]}'::jsonb
`;
```

---

**Bu doküman, Phase 10 GIN indekslemesini açıklar.**
