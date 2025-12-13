# Faz 5 Teknik İncelemesi: JSONB Profil Ayarları Stratejisi

Bu doküman, JSONB kullanarak kullanıcı ayarlarını yönetmenin "neden" ve "nasıl" yapıldığını derinlemesine analiz eder.

---

## 📚 Bölüm 1: JSONB vs Klasik İlişkisel Tablo

### 1.1 Problem: Settings Tablosu Anti-Pattern'ı

Klasik yaklaşım, her ayar için ayrı bir satır kullanır:

```sql
CREATE TABLE user_settings (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    setting_key VARCHAR(50),
    setting_value TEXT
);

-- Örnek Veri:
INSERT INTO user_settings VALUES
    (1, 'abc-123', 'daily_goal', '50'),
    (2, 'abc-123', 'sound_effects', 'true'),
    (3, 'abc-123', 'notifications', 'true');
```

**Problemler:**

| Problem               | Açıklama                                            |
| --------------------- | --------------------------------------------------- |
| **Tip Güvenliği Yok** | `setting_value` hep TEXT. `50` sayı mı string mi?   |
| **N+1 Sorgu Riski**   | Kullanıcı + 10 ayar = 11 satır okunmalı.            |
| **Şema Patlaması**    | 1M kullanıcı × 10 ayar = 10M satır.                 |
| **JOIN Maliyeti**     | Her Liste görünümünde `user_settings` JOIN gerekir. |

### 1.2 Çözüm: JSONB Sütunu

```prisma
// schema.prisma
settings Json @default("{\"daily_goal\": 50, \"sound_effects\": true, \"notifications\": true}")
```

**Avantajlar:**

1. **Tek Okuma:** Tüm ayarlar tek bir sütunda, tek bir sorguda gelir.
2. **Şemasız Esneklik:** Yeni ayar eklemek `ALTER TABLE` gerektirmez.
3. **Tip Koruması (Uygulama Tarafı):** TypeScript interface ile derleme zamanında hata yakalanır.
4. **İndekslenebilir:** PostgreSQL GIN Index ile JSONB içinde arama yapılabilir.

---

## 📚 Bölüm 2: Varsayılan Değer Stratejisi

### 2.1 Neden Veritabanı Seviyesinde Default?

```prisma
@default("{\"daily_goal\": 50, \"sound_effects\": true, \"notifications\": true}")
```

**Senior Developer Bakış Açısı:**

> Uygulama seviyesinde default değer koymak tehlikelidir. Eğer uygulama kodu hatalıysa veya farklı bir mikroservis direkt SQL ile veri eklerse, `settings` sütunu `NULL` kalabilir. Bu, runtime'da `Cannot read property 'daily_goal' of null` hatası demektir.
>
> Veritabanı seviyesinde default değer, **katmandan bağımsız** garantidir. Hangi yoldan veri gelirse gelsin, `settings` asla `NULL` olmaz.

### 2.2 Escaped JSON Syntax

Prisma schema'da JSON string olarak yazılır ve escape karakterleri gerektirir:

```
Orijinal JSON:  {"daily_goal": 50, "sound_effects": true}
Escaped:        "{\"daily_goal\": 50, \"sound_effects\": true}"
```

Bu, Prisma'nın string literal olarak yorumlaması içindir. PostgreSQL tarafında bu değer gerçek JSONB olarak saklanır.

---

## 📚 Bölüm 3: TypeScript Type Safety

### 3.1 Interface Tanımı

```typescript
// src/common/interfaces/user-settings.interface.ts
export interface UserSettings {
  daily_goal: number;
  sound_effects: boolean;
  notifications: boolean;
  dark_mode?: boolean; // Opsiyonel - migration gerektirmez!
}
```

**Trade-off Analizi:**

| Yaklaşım         | Avantaj                          | Dezavantaj                               |
| ---------------- | -------------------------------- | ---------------------------------------- |
| `any` kullanmak  | Hızlı geliştirme                 | Runtime hataları, otomatik tamamlama yok |
| Strict interface | Derleme zamanı hata, IDE desteği | Interface güncel tutulmalı               |

### 3.2 Runtime Validation (Gelecek İyileştirme)

Prisma JSONB'yi validate etmez. Kritik uygulamalarda `class-validator` veya `zod` ile runtime validation yapılmalıdır:

```typescript
// DTO seviyesinde validation
class UpdateSettingsDto {
  @IsNumber()
  @Min(10)
  @Max(500)
  daily_goal: number;

  @IsBoolean()
  sound_effects: boolean;
}
```

---

## 📚 Bölüm 4: Gap Analizi

### 4.1 Mevcut Durum

Phase 4'te `settings` sütunu oluşturuldu ancak:

- `notifications` key eksikti (faz-5.md'de belirtilen)
- Interface ile schema senkronizasyonu gevşek

### 4.2 Teknik Borçlar

| #   | Eksik                             | Etki                                 | Öncelik             |
| --- | --------------------------------- | ------------------------------------ | ------------------- |
| 1   | Settings runtime validation yok   | Geçersiz JSON kabul edilir           | 🟡 Orta             |
| 2   | GIN Index yok                     | JSONB içi arama yavaş olacak         | 🟢 Düşük (şimdilik) |
| 3   | Settings migration stratejisi yok | Eski kullanıcılara yeni key eklenmez | 🟡 Orta             |

### 4.3 Öncelikli Düzeltmeler

1. **`notifications` key eklenmesi** - Schema default güncellenmeli
2. **Interface senkronizasyonu** - `DEFAULT_USER_SETTINGS` güncel olmalı
3. **Dokümantasyon** - JSONB stratejisi net olmalı

---

**Bu doküman, Phase 5 JSONB stratejisini açıklar. Mevcut kod Phase 4'te büyük ölçüde tamamlandı, sadece minor alignment gerekiyor.**
