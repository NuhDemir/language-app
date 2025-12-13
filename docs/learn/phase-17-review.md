# Faz 17 Teknik İncelemesi: SRS Sorgu Optimizasyonu

Bu doküman, Composite ve Covering Index stratejisini açıklar.

---

## 📚 Bölüm 1: Sorgu Deseni Analizi

### 1.1 Kritik Sorgu

```sql
SELECT word_token, stability, difficulty
FROM user_vocabulary_progress
WHERE user_id = $1
  AND course_id = $2
  AND next_review_at <= NOW()
ORDER BY next_review_at ASC
LIMIT 10;
```

Bu sorgu her SRS seansında çalışır.

### 1.2 Index Olmadan

```
Seq Scan on user_vocabulary_progress
  Filter: (user_id = '...' AND course_id = 1 AND next_review_at <= NOW())
  Rows Removed: 999990
  Execution Time: 2500ms
```

10M satırda **dakikalar** sürer!

---

## 📚 Bölüm 2: Composite Index

### 2.1 Sıralama Kuralı

```sql
-- ✅ Doğru sıralama:
(user_id, course_id, next_review_at)
-- 1. Eşitlik (=) sütunları başa
-- 2. Aralık (<, >) sütunları sona

-- ❌ Yanlış:
(next_review_at, user_id, course_id)
-- Range sütunu başta olursa, index skip edilir
```

### 2.2 Index Scan

```
Index Scan using idx_srs_fetch_queue
  Index Cond: (user_id = '...' AND course_id = 1)
  Filter: (next_review_at <= NOW())
  Execution Time: 0.5ms
```

---

## 📚 Bölüm 3: Covering Index (INCLUDE)

### 3.1 Heap Fetch Problemi

Normal index:

1. Index'ten satır ID'lerini bul
2. Tabloya (Heap) git, sütunları oku ← **Yavaş**

### 3.2 INCLUDE Çözümü

```sql
CREATE INDEX idx_srs_fetch_queue
ON user_vocabulary_progress (user_id, course_id, next_review_at)
INCLUDE (word_token, stability, difficulty);
```

Şimdi:

1. Index'ten doğrudan veri oku
2. Tabloya gitme ← **Index Only Scan**

**Heap Fetches: 0** = Mükemmel performans!

---

**Bu doküman, Phase 17 SRS indekslemesini açıklar.**
