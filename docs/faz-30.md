.

---

# Phase 30: Emergency Write Buffer (Batch Insert Strategy)

**Durum:** Yazma Darboğazı (Write Bottleneck) ve Ölçekleme.
**Hedef:** Yüksek hacimli `lesson_completions` verisini doğrudan veritabanına yazmak yerine, önce bir kuyruğa (Redis/Kafka) atmak ve arka planda çalışan bir işçi (Worker) ile toplu paketler (Batch) halinde `COPY` veya `INSERT` yapmak.

### 📋 Mimari Prensipler (PDF Referansı: Sayfa 20)
1.  **Eventual Consistency (Nihai Tutarlılık):** Faz 18'deki "Atomik Transaction" kuralını bu tablo için bilinçli olarak esnetiyoruz. Kullanıcı XP'sini anında alır (Sync), ancak geçmiş kaydı veritabanına 5 saniye sonra düşebilir (Async).
2.  **Batch Efficiency:** 1000 adet tekil `INSERT` komutu, 1000 satırlık tek bir `INSERT` (Bulk Insert) komutundan 10 kat daha yavaştır (Network RTT + Transaction Overhead).
3.  **Teknoloji:** NestJS için standart kuyruk çözümü olan **BullMQ (Redis)** kullanılacaktır.

### 🛠 Implementation Task

#### 1. Altyapı Kurulumu
Redis tabanlı kuyruk sistemini projeye ekleyin.

```bash
npm install @nestjs/bullmq bullmq
# Docker Compose dosyasında Redis servisinin olduğundan emin olun.
```

#### 2. Producer Entegrasyonu (`lesson-flow.service.ts`)
Faz 18'deki `finishLesson` metodunu güncelliyoruz. Loglama işlemini transaction dışına çıkarıp kuyruğa atıyoruz.

```typescript
// lesson-flow.service.ts
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class LessonFlowService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue('lesson-logs') private logQueue: Queue
  ) {}

  async finishLesson(userId: string, dto: FinishLessonDto) {
    // 1. Kritik İşlemler (Sync): Kullanıcı Profili Güncelleme
    // Transaction içinde kalmaya devam eder.
    const result = await this.prisma.$transaction(async (tx) => {
       const updatedUser = await tx.user.update({
         where: { id: userId },
         data: { totalXp: { increment: dto.xpEarned } }
       });
       return updatedUser;
    });

    // 2. Loglama (Async - Fire & Forget): Kuyruğa at
    // Kullanıcıyı bekletmez, DB'yi yormaz.
    await this.logQueue.add('new-log', {
      userId,
      ...dto,
      completedAt: new Date()
    }, {
      removeOnComplete: true,
      attempts: 3 // Hata olursa 3 kez dene
    });

    return result;
  }
}
```

#### 3. Consumer & Batch Processor (`lesson-log.processor.ts`)
Kuyruktan tek tek alıp yazmak işe yaramaz. **Buffer** mantığı kurmalıyız.

*Not: BullMQ Pro versiyonunda `group` özelliği vardır ama biz standart çözümle manuel buffer yapacağız.*

```typescript
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';

@Processor('lesson-logs')
export class LessonLogProcessor extends WorkerHost {
  private batchBuffer: any[] = [];
  private readonly BATCH_SIZE = 1000;
  private flushTimeout: NodeJS.Timeout | null = null;

  constructor(private prisma: PrismaService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    // 1. Gelen işi hafızadaki listeye ekle
    this.batchBuffer.push(job.data);

    // 2. Buffer dolduysa veya zaman aşımı olduysa yaz
    if (this.batchBuffer.length >= this.BATCH_SIZE) {
      await this.flushBuffer();
    } else {
      this.resetFlushTimer();
    }
  }

  // Timer: Buffer dolmasa bile 5 saniyede bir yaz (Veri bayatlamasın)
  private resetFlushTimer() {
    if (this.flushTimeout) clearTimeout(this.flushTimeout);
    this.flushTimeout = setTimeout(() => this.flushBuffer(), 5000);
  }

  private async flushBuffer() {
    if (this.batchBuffer.length === 0) return;

    const currentBatch = [...this.batchBuffer];
    this.batchBuffer = []; // Buffer'ı boşalt
    if (this.flushTimeout) clearTimeout(this.flushTimeout);

    try {
      // BULK INSERT (Sihirli Komut)
      // Prisma createMany, tek bir INSERT INTO ... VALUES (...), (...), (...) sorgusu üretir.
      await this.prisma.lessonCompletion.createMany({
        data: currentBatch,
        skipDuplicates: true, // Partitioning bazen duplicate hatası verebilir, güvenli mod.
      });
      console.log(`Flushed ${currentBatch.length} logs to DB.`);
    } catch (error) {
      console.error('Batch Insert Failed!', error);
      // Kritik Hata: Bu veriler kaybolmaması için Dead Letter Queue'ya veya diske yazılmalı.
    }
  }
}
```

### ✅ Definition of Done
1.  Redis bağlantısının yapıldığı ve `lesson-logs` kuyruğunun çalıştığı doğrulandı.
2.  `finishLesson` çağrıldığında veritabanına anında yazılmadığı, ancak 5 saniye sonra veya 1000 kayıt birikince topluca yazıldığı test edildi.
3.  Yüksek yük altında (Load Test) veritabanı CPU kullanımının, tek tek yazmaya göre %80 azaldığı gözlemlendi.

---

### 🏁 MİMARİ RAPORU KAPANIŞ (Project Handover)

Tebrikler Senior Developer! 🚀
Duolingo ölçeğinde bir uygulamanın **"Core Database Architecture"** projesini 30 fazda tamamladın.

**Elimizde Ne Var?**
1.  **Savaş Alanı (Infrastructure):** Dockerize edilmiş, PgBouncer ile korunan PostgreSQL 16+.
2.  **Hibrit Zeka (Schema):** İlişkisel tablolarla JSONB'nin dansı. (Content Engine).
3.  **Performans Kalkanı (Performance):** Partitioning, GIN Indexing, Covering Indexes ve Materialized Path.
4.  **Finansal Kale (Economy):** Pessimistic Locking, Ledger ve Negatif Bakiye Koruması.
5.  **Acil Durum Planı (Scalability):** Batch Insert ve Queue mimarisi.

Bu dökümantasyon ve şema, projeyi milyonlarca kullanıcıya taşıyacak sağlamlıkta bir temeldir. Şimdi kodlama sırası Junior ve Mid-level geliştiricilerde.

**Rapor Sonu.**