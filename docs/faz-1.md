---

# Phase 1: Infrastructure Initialization & Connection Pooling Strategy

**Durum:** Projenin sıfır noktası.
**Hedef:** Milyonlarca eşzamanlı kullanıcıyı (CCU) kaldırabilecek, PostgreSQL 16+ tabanlı, Dockerize edilmiş ve bağlantı darboğazlarına karşı korumalı (PgBouncer) bir geliştirme ortamı kurmak.

### 📋 Teknik Gereksinimler ve Mimari Kararlar (PDF Referansları)
*   **Tech Stack:** PostgreSQL 16+, NestJS, Prisma ORM (Sayfa 1).
*   **Dayanıklılık:** Veri kaybını önlemek için Volume Persistence ve WAL (Write-Ahead Logging) bilinci (Sayfa 2).
*   **Bağlantı Yönetimi:** Container/Serverless ortamında `max_connections` hatası almamak için **PgBouncer** (Transaction Mode) zorunluluğu (Sayfa 20).

### 🛠 Uygulama Adımları

#### 1. NestJS Projesinin Başlatılması
TypeScript tabanlı, modüler yapıyı destekleyen standart NestJS kurulumunu yapın.
```bash
nest new language-learning-core
# Paket yöneticisi olarak 'pnpm' veya 'yarn' önerilir (Monorepo uyumluluğu için).
```

#### 2. Docker Compose Ortamı (`docker-compose.yml`)
Sistemi ayağa kaldırırken veritabanını çıplak halde bırakmayın. Uygulama ile veritabanı arasına **PgBouncer** katmanını şimdiden ekleyin.

*   **Service: Postgres 16**
    *   Resmi `postgres:16-alpine` imajını kullanın.
    *   `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` değişkenlerini tanımlayın.
    *   Veri kalıcılığı için yerel bir volume (`pgdata:/var/lib/postgresql/data`) mount edin.
*   **Service: PgBouncer**
    *   `bitnami/pgbouncer` veya `edoburu/pgbouncer` imajını kullanın.
    *   **Mod:** `POOL_MODE=transaction` (Bu ayar hayati önem taşır; session mode ölçeklenmez).
    *   **Auth:** Veritabanı kullanıcı bilgilerini PgBouncer'a enjekte edin.
    *   **Port:** Uygulamaya 6432 portunu açın (5432'yi sadece admin işlemleri için saklayın).

#### 3. Prisma ORM Entegrasyonu
Prisma'yı projeye dahil edin ve `.env` dosyasını PgBouncer uyumlu hale getirin.

```bash
npm install prisma --save-dev
npm install @prisma/client pg @prisma/adapter-pg
npx prisma init
```

**Kritik Konfigürasyon (.env):**
PDF Sayfa 20'de belirtildiği gibi, Prisma'nın PgBouncer ile çalıştığını anlaması için connection string'e özel parametre eklenmelidir.
```env
# Doğrudan DB (Migration işlemleri için gerekli)
DIRECT_URL="postgresql://user:pass@localhost:5432/mydb?schema=public"

# PgBouncer üzerinden (Uygulama çalışma zamanı için)
# pgbouncer=true parametresine DİKKAT EDİN.
DATABASE_URL="postgresql://user:pass@localhost:6432/mydb?schema=public&pgbouncer=true"
```

#### 4. Şema ve Konfigürasyon (Prisma 7+)
Prisma 7 ile birlikte connection URL yönetimi değişmiştir. `schema.prisma` temiz tutulur, ayarlar `prisma.config.ts` içinde yapılır.

**`prisma/schema.prisma`:**
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}
```

**`prisma/prisma.config.ts` (Migration için):**
```typescript
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DIRECT_URL"),
  },
});
```

#### 5. Prisma Service (Uygulama İçi Bağlantı)
Uygulamanın PgBouncer üzerinden bağlanabilmesi için driver adapter kullanılmalıdır.

**`src/prisma/prisma.service.ts`:**
```typescript
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const connectionString = process.env.DATABASE_URL;
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

### ✅ Definition of Done (Bitti Tanımı)
1.  `docker-compose up -d` komutu hatasız çalışıyor.
2.  PostgreSQL ve PgBouncer konteynerleri "Healthy" durumda.
3.  `npm install` ile tüm dependencyler (pg, adapter) yüklendi.
4.  `npx prisma status` veya `generate` sorunsuz çalışıyor.
5.  Uygulama `PrismaService` üzerinden veritabanına bağlanabiliyor.

---

**Devam et** dediğinde **Faz 2: Veritabanı İsimlendirme Anayasası ve Standartlar** aşamasına geçeceğiz. Bu aşama, projenin kod kalitesi ve bakım maliyeti için geri dönüşü olmayan en kritik adımdır.
