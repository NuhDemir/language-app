# Faz 9 Teknik İncelemesi: JSONB Veri Doğrulama (Zod)

Bu doküman, Runtime validation ile şemasız veritabanının nasıl güvenli hale getirildiğini açıklar.

---

## 📚 Bölüm 1: Problem - Schemaless Tehlikesi

### 1.1 JSONB'nin Karanlık Yüzü

Veritabanı JSONB içeriğini **doğrulamaz**:

```sql
-- Bu geçerli SQL:
INSERT INTO exercises (content) VALUES ('{"typo_prompt": "Kedi"}');
-- "prompt" yerine "typo_prompt" yazılmış ama veritabanı umursamaz
```

### 1.2 Sonuç: Mobil Uygulama Çöker

```typescript
// Mobile kod:
const prompt = exercise.content.prompt; // undefined!
console.log(prompt.toUpperCase()); // 💥 Cannot read property 'toUpperCase' of undefined
```

---

## 📚 Bölüm 2: Çözüm - Zod ile Runtime Validation

### 2.1 Discriminated Union Pattern

`type` alanı, `content` yapısını belirler:

```typescript
const ExerciseContentSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("translate"), content: TranslateContentSchema }),
  z.object({ type: z.literal("match_pairs"), content: MatchContentSchema }),
]);
```

**Akış:**

1. `type: 'translate'` → `TranslateContentSchema` kullanılır
2. `type: 'match_pairs'` → `MatchContentSchema` kullanılır
3. Bilinmeyen tip → Zod hata fırlatır

### 2.2 Type Inference

```typescript
export type ExerciseContent = z.infer<typeof ExerciseContentSchema>;
// TypeScript artık content yapısını biliyor!
```

---

## 📚 Bölüm 3: NestJS Entegrasyonu

### 3.1 Service Layer Validation

```typescript
async createExercise(dto: CreateExerciseDto) {
  const result = ExerciseContentSchema.safeParse({
    type: dto.type,
    content: dto.content,
  });

  if (!result.success) {
    throw new BadRequestException(result.error.format());
  }

  return this.prisma.exercise.create({ data: dto });
}
```

### 3.2 Neden class-validator Yetersiz?

| Özellik             | class-validator | Zod   |
| ------------------- | --------------- | ----- |
| Nested JSON         | Zayıf           | Güçlü |
| Discriminated Union | Yok             | Var   |
| Type Inference      | Yok             | Var   |
| Composable          | Sınırlı         | Tam   |

---

## 📚 Bölüm 4: Gap Analizi

| #   | Eksik                        | Öncelik    |
| --- | ---------------------------- | ---------- |
| 1   | Zod paketi yok               | 🔴 Blocker |
| 2   | Content schema tanımlı değil | 🔴 Blocker |
| 3   | ExercisesModule yok          | 🟠 Gerekli |

---

**Bu doküman, Phase 9 Zod validasyonunu açıklar.**
