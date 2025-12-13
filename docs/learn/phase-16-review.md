# Faz 16 Teknik İncelemesi: SRS Algoritma Altyapısı

Bu doküman, Aralıklı Tekrar Sistemi (Spaced Repetition System) altyapısını açıklar.

---

## 📚 Bölüm 1: SRS Nedir?

### 1.1 Unutma Eğrisi (Forgetting Curve)

```
Bellek
100% ───────────────────────────────────
      ╲
       ╲  Tekrar 1
        ╲────────────────────
         ╲
          ╲  Tekrar 2
           ╲──────────────────────────
            ╲
Zaman ──────────────────────────────────►
```

Her tekrar, unutmayı yavaşlatır.

### 1.2 Algoritmalar

| Algoritma | Özellik                         |
| --------- | ------------------------------- |
| SM-2      | Klasik, basit                   |
| FSRS      | Modern, makine öğrenimi tabanlı |

---

## 📚 Bölüm 2: Veri Modeli

### 2.1 Composite Primary Key

```prisma
@@id([userId, courseId, wordToken])
```

Neden ayrı `id` kullanmıyoruz?

- Bir kullanıcı + kurs + kelime = benzersiz kayıt
- Fazladan sütun gereksiz

### 2.2 Kritik Alanlar

| Alan             | Tip      | Açıklama                  |
| ---------------- | -------- | ------------------------- |
| `stability`      | Float    | Hafıza kararlılığı (gün)  |
| `difficulty`     | Float    | Kelime zorluğu (0-10)     |
| `next_review_at` | DateTime | Bir sonraki tekrar zamanı |

### 2.3 Neden Float?

```typescript
// ❌ Veri kaybı:
difficulty: 2; // Yuvarlama hatası

// ✅ Hassasiyet:
difficulty: 2.34; // FSRS hesaplaması
```

---

## 📚 Bölüm 3: Kritik Sorgu

```sql
SELECT * FROM user_vocabulary_progress
WHERE user_id = $1
  AND next_review_at <= NOW()
ORDER BY next_review_at ASC
LIMIT 20;
```

Bu sorgu Faz 17'de Partial Index ile optimize edilecek.

---

**Bu doküman, Phase 16 SRS altyapısını açıklar.**
