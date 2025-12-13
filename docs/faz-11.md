
---

# Phase 11: Media Metadata Strategy & CDN Integration Pattern

**Durum:** Varlık Yönetimi (Asset Management).
**Hedef:** Egzersizlere ait ses, görsel ve animasyon dosyalarının referanslarını; veritabanını şişirmeden, CDN (Content Delivery Network) uyumlu ve sorgulanabilir bir yapıda saklamak.

### 📋 Mimari Prensipler ve Yasaklar
1.  **NO BLOBs:** Veritabanına asla `bytea` veya `binary` olarak resim/ses dosyası gömülmeyecektir. Bu, veritabanını öldürür. Sadece referanslar (URL veya Object Key) saklanır.
2.  **Metadata Ayrımı:** Egzersizin metin içeriği (`content` sütunu) ile medya bilgileri (`media_metadata` sütunu) birbirinden ayrılmalıdır. Bu, frontend'in sadece medyayı preload etmesi gerektiği durumlarda (örn: oyun yükleme ekranı) performansı artırır.
3.  **Format Agnostik Yapı:** Bugün MP3 kullanıyoruz, yarın AAC veya WebM'e geçebiliriz. Veritabanı şeması buna `ALTER TABLE` yapmadan uyum sağlamalıdır.

### 🛠 Implementation Task

#### 1. Zod Metadata Şemaları (`src/exercises/schemas/media.schema.ts`)
Tıpkı içerik payload'u gibi, medya metadata alanı da tip güvenliğine sahip olmalıdır.

```typescript
import { z } from 'zod';

// Ses Dosyası Metadata Şeması
export const AudioMetadataSchema = z.object({
  url: z.string().url(), // CDN linki (https://cdn.app.com/audio/123.mp3)
  duration_ms: z.number().int().positive(), // Süre (UI progress bar için şart)
  format: z.enum(['mp3', 'aac', 'webm']),
  size_bytes: z.number().int().optional(), // Preload optimizasyonu için
});

// Görsel Dosyası Metadata Şeması
export const ImageMetadataSchema = z.object({
  url: z.string().url(),
  width: z.number().int(),
  height: z.number().int(),
  alt_text: z.string().optional(), // Erişilebilirlik (A11y)
});

// Ana Metadata Şeması (Loose Structure)
// Egzersiz tipine göre opsiyonel alanlar içerir.
export const MediaMetadataSchema = z.object({
  main_audio: AudioMetadataSchema.optional(),
  slow_audio: AudioMetadataSchema.optional(), // Yeni başlayanlar için yavaş okuma
  intro_image: ImageMetadataSchema.optional(),
  reward_animation_lottie: z.string().url().optional(), // Lottie JSON URL'i
});

export type MediaMetadata = z.infer<typeof MediaMetadataSchema>;
```

#### 2. DB Maintenance & Analysis Query (SQL)
Veritabanı yöneticisi olarak, sistemdeki medya dağılımını izleyebilmelisin. JSONB sayesinde, "Sistemde kaç tane .wav dosyası kalmış?" gibi sorulara SQL ile cevap verebiliriz.

Aşağıdaki sorguyu projenin `queries/maintenance.sql` dosyasına kaydet:

```sql
-- BAKIM SORGUSU: Eski formatları bulma
-- media_metadata içindeki 'main_audio' objesinin 'format' alanını kontrol eder.

SELECT id, type, media_metadata->'main_audio'->>'url' as audio_url
FROM exercises
WHERE media_metadata @> '{"main_audio": {"format": "wav"}}';

-- ANALİZ SORGUSU: Ortalama ses dosyası süresi
-- duration_ms alanını integer'a cast edip ortalama alır.

SELECT AVG((media_metadata->'main_audio'->>'duration_ms')::int) as avg_duration
FROM exercises
WHERE media_metadata->'main_audio' IS NOT NULL;
```

#### 3. Uygulama Entegrasyonu (Service Layer)
Egzersiz oluşturulurken medya metadata'sının da doğrulanmasını sağla.

```typescript
// exercises.service.ts güncellemesi

async createExercise(data: CreateExerciseDto) {
  // 1. Content Validasyonu (Faz 9'da yapıldı)
  // ...

  // 2. Media Validasyonu
  const mediaResult = MediaMetadataSchema.safeParse(data.media_metadata);
  if (!mediaResult.success) {
     // Loglayabilir veya hata fırlatabilirsin.
     // Medya hataları bazen tolere edilebilir (soft fail), kararı iş mantığı verir.
     console.warn(`Exercise ${data.type} has invalid media metadata`);
  }

  // 3. DB Insert
  return this.prisma.exercise.create({
    data: {
      // ...
      mediaMetadata: data.media_metadata ?? {}, // Null yerine boş obje
    }
  });
}
```

### ✅ Definition of Done
1.  `MediaMetadataSchema` tanımlandı ve proje koduna eklendi.
2.  Veritabanında `media_metadata` sütununun boş (`null`) değil, en azından boş bir JSON objesi (`{}`) olarak saklandığı doğrulandı.
3.  Bir SQL sorgusu ile JSON içindeki `duration_ms` veya `format` alanlarına erişilebildiği test edildi.

---

**Devam et** dediğinde, veritabanı tasarımından uygulama performansına geçiş yapacağımız çok kritik bir faza geliyoruz: **Faz 12: N+1 Problemi ve JSON Build Object**. ORM'lerin en büyük tuzağını PostgreSQL'in gücüyle nasıl aşacağımızı göreceğiz.