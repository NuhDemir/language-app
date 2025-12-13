
---

# Phase 9: JSONB Data Validation (Zod & Polymorphism)

**Durum:** Uygulama Katmanı (Application Layer).
**Hedef:** `exercises.content` sütununa yazılacak verinin, egzersiz tipine (`type`) uygunluğunu **Runtime (Çalışma Zamanı)** anında garanti altına almak. Veritabanında "şemasız" (schemaless) çalışıyoruz diye, kod tarafında "tip güvenliğinden" (type safety) vazgeçemeyiz.

### 📋 Mimari Prensipler
1.  **Schema-First Validation:** Veritabanına `INSERT` veya `UPDATE` yapmadan önce veri bir validasyon süzgecinden geçmelidir.
2.  **Ayırt Edici Birleşimler (Discriminated Unions):** `type` alanı, `content` JSON yapısının hangi kurallara uyacağını belirler.
    *   `type: 'translate'` -> `content` içinde `prompt` (string) ve `tokens` (array) zorunludur.
    *   `type: 'match'` -> `content` içinde `pairs` (array) zorunludur.
3.  **Kütüphane:** Karmaşık JSON yapılarını ve TypeScript entegrasyonunu en iyi yöneten **Zod** kütüphanesi kullanılacaktır.

### 🛠 Implementation Task

#### 1. Bağımlılıkların Kurulumu
Projeye Zod kütüphanesini ekleyin. `class-validator` karmaşık JSON validasyonlarında yetersiz kalabilir.

```bash
npm install zod
```

#### 2. Şema Tanımı (`src/exercises/schemas/content.schema.ts`)
Aşağıdaki Zod şemalarını oluşturun. Bu şemalar, frontend ve backend arasındaki "Kontrat" niteliğindedir.

```typescript
import { z } from 'zod';

// 1. Tip: Çeviri Sorusu
export const TranslateContentSchema = z.object({
  prompt: z.string().min(1),
  correct_answers: z.array(z.string()),
  tokens: z.array(z.string()), // Kullanıcının seçeceği kelime baloncukları
});

// 2. Tip: Eşleştirme Sorusu
export const MatchContentSchema = z.object({
  pairs: z.array(
    z.object({
      term: z.string(),   // Örn: "Cat"
      definition: z.string(), // Örn: "Kedi"
      image_url: z.string().optional()
    })
  ).min(2), // En az 2 çift olmalı
});

// 3. Tip: Dinleme Sorusu
export const ListenContentSchema = z.object({
  audio_url: z.string().url(),
  transcription: z.string(),
  slow_audio_url: z.string().url().optional(),
});

// ANA ŞEMA: Discriminated Union
// Egzersizin 'type' alanına bakarak hangi şemayı kullanacağına karar verir.
// Not: Veritabanındaki 'type' alanı ile buradaki validasyon eşleşmelidir.
export const ExerciseContentSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('translate'), content: TranslateContentSchema }),
  z.object({ type: z.literal('match_pairs'), content: MatchContentSchema }),
  z.object({ type: z.literal('listen_tap'), content: ListenContentSchema }),
]);

// TypeScript Tip Çıkarımı (Type Inference)
export type ExerciseContent = z.infer<typeof ExerciseContentSchema>;
```

#### 3. Servis Entegrasyonu Örneği (`exercises.service.ts`)
Veritabanına kayıt atmadan önce bu şemayı kullanan bir `validateAndParse` fonksiyonu yazın.

```typescript
// Örnek Kullanım Senaryosu
import { ExerciseContentSchema } from './schemas/content.schema';

async createExercise(data: CreateExerciseDto) {
  // 1. Gelen ham veriyi (type ve content) birleştir.
  const payload = {
    type: data.type,
    content: data.content // Frontend'den gelen 'any' veya 'JSON'
  };

  // 2. Validasyon (Hata varsa fırlatır ve işlem durur)
  // safeParse kullanırsanız hatayı kendiniz yönetebilirsiniz.
  const validationResult = ExerciseContentSchema.safeParse(payload);

  if (!validationResult.success) {
    throw new BadRequestException(`Invalid content for exercise type ${data.type}: ${validationResult.error}`);
  }

  // 3. Veri temiz (Sanitized). Artık veritabanına güvenle yazabiliriz.
  return this.prisma.exercise.create({
    data: {
      type: data.type,
      difficultyScore: data.difficultyScore,
      content: data.content as any, // Prisma Json tipine cast edilir
      levelId: data.levelId
    }
  });
}
```

### ✅ Definition of Done
1.  `TranslateContentSchema`, `MatchContentSchema` gibi alt şemalar tanımlandı.
2.  `type: 'translate'` gönderip, içeriğe `match` formatı (pairs) verildiğinde validasyonun hata fırlattığı test edildi (Unit Test).
3.  Geçerli veri gönderildiğinde Zod'un veriyi olduğu gibi geçirdiği doğrulandı.
4.  Bu validasyon katmanı, Controller veya Service içine entegre edildi.

---

**Devam et** dediğinde, veritabanı tarafına geri dönüp performansı uçuracak olan **Faz 10: JSONB GIN İndeksleme** aşamasına geçeceğiz. "İçinde 'elma' geçen soruları bul" sorgusunu milisaniyeler içinde yapmanın sırrı orada.