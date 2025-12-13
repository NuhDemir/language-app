# Faz 4 Teknik İncelemesi: Kullanıcı Çekirdeği (User Core)

Bu doküman, bir Junior Backend Developer'ı "Mid-Level" seviyesine taşımak hedefiyle, Faz 4'te uygulanan User modelinin "neden" ve "nasıl" tasarlandığını derinlemesine analiz eder.

---

## 📚 Bölüm 1: UUID vs Serial ID - Kritik Bir Mimari Karar

### 1.1 Problem: Serial ID'nin Zayıf Noktaları

Çoğu tutorial `@id @default(autoincrement())` kullanır. Bu basit görünür ama üretimde ciddi problemler yaratır:

| Problem                    | Açıklama                                                                                                 | Etki                 |
| -------------------------- | -------------------------------------------------------------------------------------------------------- | -------------------- |
| **ID Tahminlenebilirliği** | `user/1`, `user/2`... Saldırgan tüm kullanıcıları tarayabilir (IDOR - Insecure Direct Object Reference). | 🔴 Güvenlik          |
| **Sharding Uyumsuzluğu**   | 2 farklı veritabanı sunucusu aynı `id = 1`'i üretebilir. Birleştirmede çakışma kaçınılmaz.               | 🔴 Ölçeklenebilirlik |
| **Veri Sızıntısı**         | `orders/5000` görülürse rakip firmanın satın aldığı sipariş sayısı tahmin edilebilir.                    | 🟠 İş Zekası         |

### 1.2 Çözüm: UUID v4

```prisma
// schema.prisma
id String @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
```

**Kod Analizi:**

- `@id`: Bu alan Primary Key.
- `@default(dbgenerated("gen_random_uuid()"))`: ID üretimi PostgreSQL tarafında yapılır, NestJS tarafında değil. Bu, veritabanı seviyesinde garantili atomik işlem sağlar.
- `@db.Uuid`: PostgreSQL'in native UUID tipi kullanılır (128-bit). String olarak tutmaktan daha verimlidir.

**Trade-off:**

> UUID'ler 36 karakterdir (`550e8400-e29b-41d4-a716-446655440000`), integer'a göre daha fazla disk alanı ve indeks boyutu harcar. Ancak güvenlik ve ölçeklenebilirlik kazanımları buna değer.

---

## 📚 Bölüm 2: Denormalization - Performans Uğruna Saflıktan Vazgeçmek

### 2.1 Normal Form Nedir?

Veritabanı tasarımında "3. Normal Form (3NF)", veri tekrarını minimize etmeyi hedefler:

- Her bilgi **tek** bir yerde tutulur.
- Güncellemeler atomiktir.

**Örnek (Normalize):**

```
users: id, username, email
xp_transactions: id, user_id, amount, created_at

-- Toplam XP hesaplamak için:
SELECT user_id, SUM(amount) FROM xp_transactions GROUP BY user_id;
```

**Problem:** 10 milyon kullanıcı, her biri ortalama 500 XP işlemi = 5 milyar satır taranıyor. Bu sorgu **dakikalar** sürer.

### 2.2 Denormalization Stratejisi

```prisma
// schema.prisma - User modeli
totalXp    BigInt   @default(0) @map("total_xp")
streakDays Int      @default(0) @map("streak_days")
```

**Kod Analizi:**

- `totalXp`: Her XP kazanıldığında bu sayaç artırılır. Leaderboard hesaplaması için `SUM()` yerine direkt bu alan okunur.
- `@default(0)`: Yeni kullanıcı 0 XP ile başlar.
- `BigInt`: 9,223,372,036,854,775,807'e kadar XP destekler (Long-term thinking).

**Trade-off:**

> XP eklerken artık 2 işlem yapılmalı: (1) `xp_transactions` tablosuna INSERT, (2) `users.total_xp` alanını UPDATE. Bu, kod karmaşıklığını artırır ama okuma performansını **1000x** iyileştirir.

### 2.3 Streak Mekanizması

```prisma
streakDays    Int       @default(0) @map("streak_days")
lastActivity  DateTime? @map("last_activity_date") @db.Date
```

**Neden `Date` tipi `DateTime` değil?**
Streak, gün bazlı hesaplanır. `2024-01-15 23:59` ve `2024-01-16 00:01` arasındaki fark 2 dakika olsa bile, bunlar **farklı günlerdir**. `@db.Date` sadece tarih kısmını tutar, saat karmaşıklığını ortadan kaldırır.

---

## 📚 Bölüm 3: JSONB - Şemasız Esneklik

### 3.1 Problem: Ayarlar Tablosu Patlaması

Klasik yaklaşım:

```
user_settings:
  - user_id (FK)
  - setting_key (VARCHAR)
  - setting_value (VARCHAR)
```

10 ayar = 10 satır per user. 1M user = 10M satır. Ayrıca `setting_value` hep string, tip güvenliği yok.

### 3.2 JSONB Çözümü

```prisma
settings Json @default("{\"daily_goal\": 50, \"sound_effects\": true}")
```

**Avantajlar:**

1.  **Şemasız:** Yeni ayar eklemek migration gerektirmez. `dark_mode` eklemek = JSON'a key eklemek.
2.  **Tek Okuma:** Tüm ayarlar tek sorguda gelir.
3.  **Indekslenebilir:** PostgreSQL JSONB'de `@>` operatörüyle özel indeksler oluşturabilir.

**TypeScript Tarafında Tip Güvenliği:**

```typescript
// src/common/interfaces/user-settings.interface.ts
export interface UserSettings {
  daily_goal: number;
  sound_effects: boolean;
  dark_mode?: boolean; // Opsiyonel, migration gerektirmez!
}
```

---

## 📚 Bölüm 4: Request Lifecycle - User Endpoint Örneği

Bir `POST /users` isteği geldiğinde akış:

```
[HTTP Request: POST /users]
      │
      ▼
┌─────────────────────┐
│ 1. ValidationPipe   │  ── CreateUserDto doğrulanır
└─────────────────────┘     (email format, username length)
      │
      ▼
┌─────────────────────┐
│ 2. UsersController  │  ── Route handler: create(dto)
└─────────────────────┘
      │
      ▼
┌─────────────────────┐
│ 3. UsersService     │  ── İş mantığı: password hash, DB save
└─────────────────────┘
      │
      ▼
┌─────────────────────┐
│ 4. PrismaService    │  ── prisma.user.create()
└─────────────────────┘
      │
      ▼
┌─────────────────────┐
│ 5. PostgreSQL       │  ── INSERT INTO users (...)
└─────────────────────┘
```

---

## 📚 Bölüm 5: Gap Analizi (Teknik Borç Raporu)

### 5.1 Mevcut Eksiklikler

| #   | Eksik                                 | Etki                                           | Öncelik   |
| --- | ------------------------------------- | ---------------------------------------------- | --------- |
| 1   | `UsersModule` yok                     | User CRUD işlemleri yapılamaz.                 | 🔴 Yüksek |
| 2   | Password hashing yok                  | Şifreler plain-text saklanır.                  | 🔴 Kritik |
| 3   | DTO validation yok                    | Geçersiz email/username kabul edilir.          | 🟠 Yüksek |
| 4   | Unique constraint hatası yönetimi yok | Duplicate email hata mesajı çirkin.            | 🟡 Orta   |
| 5   | HealthCheck endpoint yok              | Kubernetes liveness/readiness probes çalışmaz. | 🟡 Orta   |

### 5.2 Öncelikli Refactoring Planı

| Sıra | Madde                                 | Açıklama                             |
| ---- | ------------------------------------- | ------------------------------------ |
| 1    | `User` model eklenmesi                | Schema migration ile Users tablosu.  |
| 2    | `UserSettings` interface              | JSONB tip güvenliği.                 |
| 3    | `src/common/interfaces` klasör yapısı | Interface'ler için FSD uyumlu konum. |

---

**Bu doküman, Phase 4 implementasyonu için gerekli teknik altyapıyı açıklar. Onay sonrası implementasyona geçilecektir.**
