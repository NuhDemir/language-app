
---

# Phase 15: Partition Automation & Lifecycle Management

**Durum:** Partition Yönetimi (Operasyonel Hazırlık).
**Hedef:** `lesson_completions` tablosunun çalışabilmesi için başlangıç partition'larını (çocuk tablolar) oluşturmak ve gelecekte sistemin durmaması için (yeni ay geldiğinde tablo yok hatası almamak için) bir otomasyon stratejisi kurmak.

### 📋 Operasyonel Kritikler (PDF Referansı: Sayfa 9 ve 16)
1.  **Mantık:** PostgreSQL'de veri ana tabloya (`lesson_completions`) yazılır, ancak veritabanı motoru bu veriyi arka planda sessizce `lesson_completions_y2024m01` gibi alt tablolara yönlendirir.
2.  **Zaman Aralığı:** Partitionlar genelde **Aylık** oluşturulur.
    *   *Kural:* Başlangıç tarihi dahildir (Inclusive), bitiş tarihi hariçtir (Exclusive).
    *   Örn: `FROM ('2024-01-01') TO ('2024-02-01')`.
3.  **Otomasyon:** Eğer 31 Ocak gece yarısı 00:00'da Şubat partition'ı hazır değilse, sistem çöker (Insert'ler patlar). Bu yüzden **pg_cron**, **pg_partman** veya uygulama tabanlı bir **Cron Job** şarttır.

### 🛠 Implementation Task

#### 1. Manuel SQL Başlangıcı (Bootstrap)
Sistemin hemen çalışabilmesi için "Geçen Ay", "Bu Ay" ve "Gelecek Ay" tablolarını manuel oluşturacak bir migration hazırlayın.

1.  Yeni bir migration oluştur:
    ```bash
    npx prisma migrate dev --create-only --name init_partitions
    ```
2.  Migration dosyasının içine şu SQL komutlarını yaz (Tarihleri projeyi başlattığın zamana göre ayarla, örnekte 2024/2025 kullanılmıştır):

```sql
-- DEFAULT PARTITION (Güvenlik Ağı)
-- Partition aralığına girmeyen hatalı veriler buraya düşer, sistem hatası vermez.
CREATE TABLE lesson_completions_default PARTITION OF lesson_completions DEFAULT;

-- ÖRNEK: Ocak 2025 (Partition Adı: y2025m01)
CREATE TABLE lesson_completions_y2025m01 PARTITION OF lesson_completions
    FOR VALUES FROM ('2025-01-01 00:00:00') TO ('2025-02-01 00:00:00');

-- ÖRNEK: Şubat 2025
CREATE TABLE lesson_completions_y2025m02 PARTITION OF lesson_completions
    FOR VALUES FROM ('2025-02-01 00:00:00') TO ('2025-03-01 00:00:00');

-- ÖRNEK: Mart 2025
CREATE TABLE lesson_completions_y2025m03 PARTITION OF lesson_completions
    FOR VALUES FROM ('2025-03-01 00:00:00') TO ('2025-04-01 00:00:00');

-- Not: Alt tablolar ana tablonun indekslerini otomatik miras alır.
-- Ekstra CREATE INDEX yazmana gerek yok.
```

3.  Migration'ı uygula: `npx prisma migrate dev`

#### 2. Uygulama İçi Otomasyon (NestJS Cron - Senior Yaklaşımı)
DB tarafında `pg_partman` eklentisi kurmak bazen yetki gerektirir. Bir NestJS geliştiricisi olarak kontrolü ele almak daha güvenlidir.

`src/cron/partition-maintenance.service.ts` servisini oluştur.

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule'; // @nestjs/schedule paketi gerekir
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PartitionMaintenanceService {
  private readonly logger = new Logger(PartitionMaintenanceService.name);

  constructor(private readonly prisma: PrismaService) {}

  // Her ayın 15'inde gece yarısı çalışır.
  // Gelecek ayın tablosunu şimdiden oluşturur.
  @Cron('0 0 15 * *') 
  async createNextMonthPartition() {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    const year = nextMonth.getFullYear();
    const month = String(nextMonth.getMonth() + 1).padStart(2, '0'); // 01, 02...
    
    // Sonraki ay için (Tarih hesaplama mantığına dikkat)
    const nextNextMonth = new Date(nextMonth);
    nextNextMonth.setMonth(nextNextMonth.getMonth() + 1);
    
    const startStr = `${year}-${month}-01`;
    const endStr = `${nextNextMonth.getFullYear()}-${String(nextNextMonth.getMonth() + 1).padStart(2, '0')}-01`;
    
    const tableName = `lesson_completions_y${year}m${month}`;

    this.logger.log(`Checking partition: ${tableName} for range ${startStr} to ${endStr}`);

    try {
      // IF NOT EXISTS kullanarak idempotent işlem yapıyoruz.
      await this.prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "${tableName}" PARTITION OF "lesson_completions"
        FOR VALUES FROM ('${startStr} 00:00:00') TO ('${endStr} 00:00:00');
      `);
      this.logger.log(`Partition ${tableName} ensured.`);
    } catch (error) {
      this.logger.error(`Failed to create partition ${tableName}`, error);
      // Kritik hata: Admin'e mail/slack bildirimi atılmalı.
    }
  }
}
```

### ✅ Definition of Done
1.  Veritabanında `lesson_completions_default` ve en az 2 aylık (örn: `_y2025m01`, `_y2025m02`) tabloların fiziksel olarak oluştuğu görüldü.
2.  Prisma üzerinden ana tabloya (`lesson_completions`) bir veri `create` edildiğinde hata alınmadığı test edildi.
3.  Eklenen verinin, tarihi hangi aya denk geliyorsa o alt tabloya düştüğü (`SELECT * FROM lesson_completions_y2025m01`) doğrulandı.
4.  NestJS Cron Job'ı kurgulandı (veya en azından strateji not edildi).

---

**Devam et** dediğinde, kullanıcının kelime hazinesini yöneteceğimiz, hafıza algoritmalarının (SRS) çalışacağı **Faz 16: SRS (Aralıklı Tekrar) Altyapısı** aşamasına geçeceğiz. "Next Review" sorgusunu nasıl hızlandıracağımızı göreceğiz.