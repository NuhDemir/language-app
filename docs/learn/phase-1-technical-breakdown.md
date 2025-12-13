# Faz 1 Teknik İncelemesi: Altyapı ve Veritabanı Mimarisi

Bu doküman, Faz 1'de kurulan altyapının "neden" ve "nasıl" yapıldığını, teknik detaylara girmeden ancak mühendislik kararlarını açıklayarak anlatır.

## 🏗️ Büyük Resim: Neyi Amaçlıyoruz?

Doxa Language App, milyonlarca kullanıcıyı aynı anda kaldırmayı hedefleyen bir sistemdir. Bu yüzden klasik "Veritabanına bağlan ve veri çek" yöntemi yetersiz kalır.

Faz 1'de şu üç ana sorunu çözdük:

1.  **İzolasyon:** Geliştirme ortamı herkesin bilgisayarında aynı çalışmalı. (**Docker**)
2.  **Ölçeklenebilirlik:** Binlerce kullanıcı aynı anda bağlandığında veritabanı çökmemeli. (**PgBouncer**)
3.  **Modern ORM:** Veritabanı işlemleri tip güvenli ve performanslı olmalı. (**Prisma 7**)

---

## 🧩 Bileşenler ve Kodlar

### 1. Docker & Docker Compose

`docker-compose.yml` dosyamız, sanal bir bilgisayar ağı kurar.

- **Postgres (Veritabanı):** Verilerin saklandığı yer.
- **PgBouncer (Kapıcı):** Uygulama ile veritabanı arasındaki trafiği yöneten aracı.

**Neden PgBouncer?**
PostgreSQL, her bağlantı için işlemci gücü harcar (Process Forking). 5000 kişi aynı anda bağlanırsa sunucu kilitlenir. PgBouncer, 5000 kişiyi karşılar, bunları sıraya dizer ve veritabanına sadece 50-100 aktif bağlantı açar. Bu sayede veritabanı rahat nefes alır.

### 2. Prisma 7 Yapılandırması (Kritik Değişiklik)

Prisma 7 ile birlikte yapılandırma stratejimiz değişti. İki farklı bağlantı yolumuz var:

#### A. Migration Yolu (`prisma.config.ts`)

Veritabanı tablosu oluştururken (Migration), PgBouncer gibi bir aracı istemeyiz. Doğrudan yönetici olarak bağlanmak isteriz.

```typescript
// prisma/prisma.config.ts
export default defineConfig({
  // ...
  datasource: {
    url: env("DIRECT_URL"), // Doğrudan Port 5432'ye gider
  },
});
```

_Bu dosya, `npx prisma migrate` komutunu çalıştırdığınızda devreye girer._

#### B. Uygulama Yolu (`prisma.service.ts`)

Uygulama çalışırken (Runtime), PgBouncer üzerinden (Port 6432) geçmeliyiz.

```typescript
// src/prisma/prisma.service.ts
const connectionString = process.env.DATABASE_URL; // Port 6432 (PgBouncer)
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
super({ adapter });
```

_Burada `adapter-pg` kullanarak Prisma'ya "Sen standart yolla bağlanma, bu havuz (pool) üzerinden konuş" diyoruz._

---

## 🚀 Özet: Veri Akışı Nasıl Çalışıyor?

1.  **Kullanıcı** bir istek atar.
2.  **NestJS (Backend)** bu isteği alır.
3.  **Prisma Service**, `DATABASE_URL` (Port 6432) üzerinden **PgBouncer**'a seslenir.
4.  **PgBouncer**, sıraya bakar ve müsait bir bağlantı (`postgresql` - Port 5432) üzerinden veritabanına sorguyu iletir.
5.  Sonuç aynı yoldan geri döner.

Bu yapı, Facebook veya Instagram gibi devasa uygulamaların kullandığı mimarinin aynısıdır (küçük ölçekli hali). Artık Faz 2'ye geçmeye ve tablolarımızı isimlendirmeye hazırız.
