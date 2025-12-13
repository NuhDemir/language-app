
---

# Phase 18: Transactional Lesson Completion (ACID Compliance)

**Durum:** Uygulama Katmanı (Veri Tutarlılığı).
**Hedef:** Ders tamamlama işlemini, `LessonCompletion` tablosuna yazma ve `User` tablosundaki sayaçları (XP, Streak) güncelleme adımlarını içeren **Atomik** bir Transaction bloğu içinde gerçekleştirmek.

### 📋 Mimari Prensipler (PDF Referansı: Sayfa 1 ve 16)
1.  **Atomicity (Atomiklik):** İşlem sırasında bir hata oluşursa (örneğin veritabanı bağlantısı koparsa), atılan log kaydı geri alınmalı (Rollback), kullanıcıya "yarım XP" verilmemelidir.
2.  **No Hidden Logic:** Stored Procedure veya Trigger yerine, tüm mantık NestJS servisi içinde, kod tabanında (Codebase) görünür olmalıdır.
3.  **Client Isolation:** Prisma'nın Interactive Transactions özelliği (`$transaction`) kullanılmalıdır.

### 🛠 Implementation Task

#### 1. Servis Metodu (`lesson-flow.service.ts`)
Aşağıdaki metodu oluşturun. `tx` (Transaction Client) kullanımına dikkat edin. Eğer `this.prisma` kullanırsanız transaction dışına çıkarsınız.

```typescript
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FinishLessonDto } from './dtos/finish-lesson.dto';

@Injectable()
export class LessonFlowService {
  constructor(private prisma: PrismaService) {}

  async finishLesson(userId: string, dto: FinishLessonDto) {
    // Interactive Transaction Başlangıcı
    return this.prisma.$transaction(async (tx) => {
      
      // ADIM 1: Tamamlama Logunu Yaz (Partitioned Table'a gider)
      // Postgres, tarihi kontrol edip doğru partition'a yönlendirir.
      const completionLog = await tx.lessonCompletion.create({
        data: {
          userId,
          courseId: dto.courseId,
          unitId: dto.unitId,
          levelId: dto.levelId,
          xpEarned: dto.xpEarned,
          durationSeconds: dto.durationSeconds,
          accuracyPercentage: dto.accuracyPercentage,
          completedAt: new Date(), // Partition Key
        },
      });

      // ADIM 2: Kullanıcı Profilini Güncelle (Denormalize Sayaçlar)
      // Atomic Increment kullanıyoruz. Race Condition'ı azaltır.
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          totalXp: { increment: dto.xpEarned }, // total_xp = total_xp + yeni_xp
          lastActivityDate: new Date(),
          // Basit Streak Mantığı (Gelişmişi ayrı serviste olabilir)
          // Eğer dün girdiyse streak artır, girmediyse sıfırla gibi mantıklar buraya.
        },
      });

      // ADIM 3: Kurs Kaydını Güncelle (İlerleme Durumu)
      // JSONB içindeki veriyi güncellemek biraz daha manuel işlem gerektirebilir.
      // Şimdilik sadece active olduğunu teyit edelim.
      await tx.enrollment.updateMany({
        where: { userId, courseId: dto.courseId },
        data: { 
           // last_unit_id gibi veriler burada jsonb_set ile veya kod tarafında merge edilerek güncellenir.
        }
      });

      return {
        newTotalXp: updatedUser.totalXp,
        lessonLogId: completionLog.id.toString(), // BigInt serialization'a dikkat
      };
    }, {
      // Transaction Ayarları
      maxWait: 5000, // Havuzdan bağlantı almak için bekleme süresi
      timeout: 10000, // İşlemin bitmesi için maksimum süre
    });
  }
}
```

#### 2. DTO Tanımı (`finish-lesson.dto.ts`)
Veri transfer objesini tanımlayın.

```typescript
export class FinishLessonDto {
  courseId: bigint;
  unitId: bigint;
  levelId: bigint;
  xpEarned: number;
  durationSeconds: number;
  accuracyPercentage: number;
}
```

### 🔍 Senior Dev Test Senaryosu (Rollback Testi)
Bu kodun çalıştığını nasıl kanıtlarsın? Hata simülasyonu ile.

1.  Koda geçici olarak `throw new Error("Simulated Crash")` satırını, Adım 1'den sonra ama Adım 2'den önce ekle.
2.  Metodu çağır.
3.  Hata fırlatılacak.
4.  Veritabanını kontrol et:
    *   `lesson_completions` tablosuna **kayıt atılmamış** olmalı.
    *   Eğer `tx` yerine `this.prisma` kullansaydın, kayıt atılırdı ama hata dönerdi (Tutarsızlık).

### ✅ Definition of Done
1.  `finishLesson` metodu, tek bir `prisma.$transaction` bloğu içinde yazıldı.
2.  Ders tamamlandığında hem `users` tablosundaki `total_xp`'nin arttığı hem de `lesson_completions` tablosuna satır eklendiği doğrulandı.
3.  Adım 2'de bir hata oluşursa, Adım 1'de atılan kaydın geri alındığı (Rollback) test edildi.
4.  Partitioned Table (`lesson_completions`) insert işleminde sorun çıkarmadı (Faz 15 düzgün yapıldıysa çalışır).

---

**Devam et** dediğinde, **Ekonomi ve Güvenlik** bloğuna geçiyoruz. İlk adım: Paranın saklandığı yer. **Faz 19: Cüzdan Mimarisi ve Negatif Bakiye Koruması**. Veritabanı seviyesinde "borçlanmayı" engelleyeceğiz.