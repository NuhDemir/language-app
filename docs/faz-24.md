
---

# Phase 24: Deadlock Protection & Timeout Strategy

**Durum:** Kararlılık (Stability) ve Hata Yönetimi.
**Hedef:** Veritabanı işlemlerinin sonsuza kadar asılı kalmasını engellemek için hem uygulama (Prisma) hem de veritabanı (PostgreSQL) seviyesinde zaman aşımı (timeout) kurallarını devreye almak.

### 📋 Mimari Prensipler (PDF Referansı: Sayfa 20)
1.  **Fail Fast:** Bir işlem 5 saniyeden uzun sürüyorsa, orada yanlış giden bir şeyler vardır (Deadlock veya kötü sorgu). İşlem derhal iptal edilmelidir.
2.  **Max Wait:** Bağlantı havuzundan (Connection Pool) boş bir bağlantı almak için sonsuza kadar beklenmemelidir.
3.  **Deadlock Retry:** PostgreSQL "Deadlock Detected" (Hata Kodu: `40P01`) hatası verirse, bu geçici bir durumdur. Uygulama bu hatayı yakalayıp işlemi 1-2 kez otomatik tekrar etmelidir.

### 🛠 Implementation Task

#### 1. Transaction Konfigürasyonu (Standartlaştırma)
Projedeki tüm `$transaction` çağrılarında varsayılan timeout ayarlarını zorunlu kılın.

```typescript
// store.service.ts (veya ilgili servis)

// Prisma Transaction Ayarları
const TX_OPTIONS = {
  maxWait: 2000, // 1. Havuzdan bağlantı almak için en fazla 2 sn bekle.
  timeout: 5000, // 2. İşlem başladıktan sonra en fazla 5 sn sürsün.
  isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted, // PDF Sayfa 2
};

// Kullanımı:
await this.prisma.$transaction(async (tx) => {
  // ... işlemler ...
}, TX_OPTIONS);
```

#### 2. Retry Helper (Otomatik Tekrar Mekanizması)
Deadlock hataları kullanıcıya yansıtılmamalı, arka planda çözülmelidir. Basit bir yardımcı fonksiyon yazın.

```typescript
// src/common/utils/transaction.util.ts

import { Prisma } from '@prisma/client';

export async function runWithRetry<T>(
  action: () => Promise<T>, 
  retries = 3
): Promise<T> {
  try {
    return await action();
  } catch (error) {
    // PostgreSQL Error Code 40P01: Deadlock Detected
    // Prisma Error Code P2034: Transaction failed due to deadlock/timeout
    if (
      retries > 0 && 
      (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') || // Unique constraint (bazen race condition)
      (error.message && error.message.includes('Deadlock found')) // Raw Error check
    ) {
      // Exponential Backoff: 50ms, 100ms, 200ms bekle ve tekrar dene
      const delay = 50 * (4 - retries); 
      await new Promise(res => setTimeout(res, delay));
      
      return runWithRetry(action, retries - 1);
    }
    throw error;
  }
}

// Kullanımı:
// await runWithRetry(() => this.storeService.purchaseItem(...));
```

#### 3. Veritabanı Seviyesinde Sigorta (SQL)
Uygulama çökse bile veritabanının kendini koruması gerekir. Migration ile global bir ayar ekleyebilirsin veya `postgresql.conf` ayarıdır. Biz session bazlı önlem alalım.

*Not: Prisma her bağlantıyı açtığında bunu yapamaz, ancak PgBouncer kullanıyorsak connection init query olarak ayarlanabilir.*

Şimdilik Prisma Client'a bir `middleware` veya `$extends` ekleyerek her sorguda zaman aşımı gönderilebilir, ancak yukarıdaki Transaction Timeout ayarı (Adım 1) genellikle yeterlidir.

### ✅ Definition of Done
1.  Projedeki `$transaction` bloklarına `timeout: 5000` parametresinin eklendiği kod incelemesiyle (Code Review) doğrulandı.
2.  Yapay bir deadlock senaryosu (iki farklı terminalden çapraz tablo kilitleme) oluşturulduğunda, uygulamanın sonsuza kadar beklemediği, 5 saniye sonra hata fırlattığı test edildi.
3.  `runWithRetry` fonksiyonunun deadlock hatasını yakalayıp işlemi tekrar denediği simüle edildi.

---

**Devam et** dediğinde, "Temel" (Core) bitti, artık "Eğlence" (Fun) başlıyor. Oyuncuları rekabete sokacak **Faz 25: Lig Sistemi (Cohorts & Buckets)** aşamasına geçiyoruz. Milyonlarca kullanıcıyı 50 kişilik küçük havuzlara nasıl böleceğimizi göreceğiz.