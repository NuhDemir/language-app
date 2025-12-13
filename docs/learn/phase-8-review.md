# Faz 8 Teknik İncelemesi: Hibrit Egzersiz Modeli

Bu doküman, Exercise modelinin hibrit yapısını (Relational + JSONB) derinlemesine analiz eder.

---

## 📚 Bölüm 1: Hibrit Veri Modeli

### 1.1 Problem: Polimorfik İçerik

Farklı egzersiz türleri farklı veri yapıları gerektirir:

| Tip           | İçerik Yapısı                                        |
| ------------- | ---------------------------------------------------- |
| `translate`   | `{ prompt: "Kedi", correct_answers: ["Cat"] }`       |
| `match_pairs` | `{ pairs: [{en: "cat", tr: "kedi"}, ...] }`          |
| `listen_tap`  | `{ audio_url: "...", words: [...] }`                 |
| `speak`       | `{ prompt: "Say: Hello", expected_phrase: "Hello" }` |

### 1.2 Çözüm: Hibrit Yaklaşım

```prisma
model Exercise {
  // RELATIONAL: Sorgulanabilir alanlar
  type            String @db.VarChar(50)
  difficultyScore Int    @db.SmallInt

  // JSONB: Polimorfik içerik
  content         Json
  mediaMetadata   Json   @default("{}")
}
```

**Avantajlar:**

1.  **Filtreleme:** `WHERE type = 'speak'` SQL optimizasyonu kullanır
2.  **Esneklik:** Yeni tip eklemek migration gerektirmez
3.  **İndeksleme:** `type` ve `levelId` sütunlarına index konulabilir

---

## 📚 Bölüm 2: JSONB Content Stratejisi

### 2.1 Polymorphism Pattern

`type` sütunu, `content` alanının şemasını belirler:

```typescript
// Application-side type guards
if (exercise.type === "translate") {
  const content = exercise.content as TranslateContent;
  console.log(content.prompt); // TypeScript knows the shape
}
```

### 2.2 Risk: Schema Validation

> **⚠️ UYARI:** Veritabanı JSONB içeriğini validate etmez!

Geçersiz veri örneği:

```json
{ "promt": "Kedi" } // typo: "promt" instead of "prompt"
```

Bu veri veritabanına girer ama mobil uygulama çöker.

**Çözüm (Faz 9):** Zod ile runtime validation.

---

## 📚 Bölüm 3: Index Stratejisi

```prisma
@@index([levelId])  // FK performansı: "Bu level'ın egzersizleri"
@@index([type])     // Type filtresi: "Tüm speaking soruları"
```

**Gelecek (Faz 10):** GIN Index ile JSONB içi arama:

```sql
CREATE INDEX idx_gin ON exercises USING GIN (content);
-- Artık: WHERE content @> '{"difficulty": "hard"}' hızlı
```

---

## 📚 Bölüm 4: Gap Analizi

### 4.1 Mevcut Eksiklikler

| #   | Eksik                           | Öncelik     |
| --- | ------------------------------- | ----------- |
| 1   | Exercise modeli yok             | 🔴 Blocker  |
| 2   | Level'da exercises ilişkisi yok | 🔴 Blocker  |
| 3   | JSONB validation yok            | 🟠 Faz 9'da |

---

**Bu doküman, Phase 8 hibrit modelini açıklar.**
