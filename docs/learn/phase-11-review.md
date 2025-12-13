# Faz 11 Teknik İncelemesi: Medya Metadata Stratejisi

Bu doküman, CDN-uyumlu medya referans yönetimini derinlemesine analiz eder.

---

## 📚 Bölüm 1: NO BLOBs Prensibi

### 1.1 Anti-Pattern: Binary Veritabanında

```sql
-- ❌ YANLIŞ: Veritabanını öldürür
CREATE TABLE assets (
  id SERIAL PRIMARY KEY,
  audio_data BYTEA  -- 5MB ses dosyası × 100k egzersiz = 500GB veritabanı
);
```

### 1.2 Doğru: URL Referansları

```json
{
  "main_audio": {
    "url": "https://cdn.app.com/audio/123.mp3",
    "duration_ms": 3500,
    "format": "mp3"
  }
}
```

**Avantajlar:**

- Veritabanı hafif kalır
- CDN cache'lenebilir
- Format değişikliği migration gerektirmez

---

## 📚 Bölüm 2: Metadata Ayrımı

### 2.1 Neden İki JSONB Sütunu?

| Sütun            | İçerik                          | Kullanım      |
| ---------------- | ------------------------------- | ------------- |
| `content`        | Soru metni, cevaplar, tokenlar  | API response  |
| `media_metadata` | Audio URL, duration, image size | Preload/cache |

### 2.2 Preload Senaryosu

```typescript
// Oyun yükleme ekranı - sadece media URL'leri al
const mediaUrls = await prisma.$queryRaw`
  SELECT media_metadata->'main_audio'->>'url' as audio_url
  FROM exercises
  WHERE level_id = ${levelId}
`;
// Bu sorgu content sütununu yüklemez = daha hızlı
```

---

## 📚 Bölüm 3: Format Agnostik Yapı

```typescript
format: z.enum(["mp3", "aac", "webm"]);
```

Yeni format eklemek:

1. Zod enum'a ekle
2. Deployment yap

Migration, ALTER TABLE, downtime **YOK**.

---

## 📚 Bölüm 4: Gap Analizi

| #   | Eksik                         | Öncelik   |
| --- | ----------------------------- | --------- |
| 1   | Media metadata validation yok | 🟠 Yüksek |
| 2   | Maintenance queries yok       | 🟡 Orta   |

---

**Bu doküman, Phase 11 media stratejisini açıklar.**
