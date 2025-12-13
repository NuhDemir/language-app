
---

# Phase 21: Pessimistic Locking & Purchase Logic (Double-Spend Protection)

**Durum:** Eşzamanlılık Kontrolü (Concurrency Control).
**Hedef:** Satın alma işlemlerinde `SELECT ... FOR UPDATE` SQL komutunu kullanarak, cüzdan bakiyesini işlem süresince kilitlemek ve tutarsızlıkları %100 engellemek.

### 📋 Mimari Prensipler (PDF Referansı: Sayfa 2, 18, 19)
1.  **Race Condition Senaryosu:**
    *   Kullanıcı Bakiyesi: 100. Eşya Fiyatı: 100.
    *   İstek A gelir -> Bakiyeyi okur (100) -> Yeterli -> Satın Alır (0).
    *   İstek B (milisaniye sonra) gelir -> Bakiyeyi okur (hala 100 görünür çünkü A commit etmedi) -> Yeterli -> Satın Alır (-100 veya 0).
    *   Sonuç: Kullanıcı bedavaya eşya aldı veya bakiye bozuldu.
2.  **Native Database Lock:** Prisma'nın standart `findUnique` metodu kilitleme yapmaz. Bu yüzden **Raw SQL** kullanmak zorundayız.
3.  **Scope:** Kilitleme sadece Transaction (`$transaction`) içinde geçerlidir.

### 🛠 Implementation Task

#### 1. Servis Metodu (`store.service.ts`)
Aşağıdaki metot, PDF Sayfa 19'daki örneğin NestJS/Prisma ile birebir uygulanmış halidir.

```typescript
import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Currency } from '@prisma/client'; // Prisma Enum

@Injectable()
export class StoreService {
  constructor(private prisma: PrismaService) {}

  async purchaseItem(userId: string, itemId: number) {
    // Interactive Transaction
    return this.prisma.$transaction(async (tx) => {
      
      // ADIM 0: Eşya bilgilerini ve fiyatını çek (Kilitlemeye gerek yok, statik veri)
      const item = await tx.item.findUnique({ where: { id: itemId } });
      if (!item) throw new BadRequestException('Item not found');

      // ADIM 1: Cüzdanı Kilitle (PESSIMISTIC LOCK)
      // Prisma'da native FOR UPDATE olmadığı için $queryRaw kullanıyoruz.
      // SQL Injection'a karşı parametre kullanımına dikkat ($1, $2).
      const walletResults = await tx.$queryRaw<Array<{ balance: number }>>`
        SELECT balance 
        FROM user_wallets 
        WHERE user_id = ${userId}::uuid 
          AND currency = ${'GEMS'}::"Currency"
        FOR UPDATE
      `;

      // Cüzdan yoksa veya boş döndüyse
      if (walletResults.length === 0) {
        throw new BadRequestException('Wallet not found');
      }

      const currentBalance = walletResults[0].balance;

      // ADIM 2: Bakiye Kontrolü (Node.js tarafında)
      if (currentBalance < item.costGems) {
        throw new BadRequestException('Insufficient funds');
      }

      // ADIM 3: Parayı Düş (Update)
      // Zaten kilitli olduğu için decrement güvenlidir.
      await tx.userWallet.update({
        where: { userId_currency: { userId, currency: 'GEMS' } },
        data: { balance: { decrement: item.costGems } },
      });

      // ADIM 4: Envantere Ekle (Upsert)
      // Varsa miktar artır, yoksa oluştur.
      await tx.userInventory.upsert({
        where: { uq_user_item: { userId, itemId } },
        create: {
          userId,
          itemId,
          quantity: 1
        },
        update: {
          quantity: { increment: 1 }
        }
      });

      // ADIM 5: Loglama (Faz 22'de detaylandırılacak)
      // await tx.transactionHistory.create(...)

      return { success: true, remainingBalance: currentBalance - item.costGems };
    });
  }
}
```

### 🔍 Senior Dev Test Senaryosu (Concurrency Test)
Bu kodun çalıştığını (veya kilidin işe yaradığını) test etmek için kafanda şu senaryoyu canlandır:

1.  Transaction başladığında `FOR UPDATE` satırı çalışır.
2.  Veritabanı o satıra bir "Row-Level Lock" koyar.
3.  Aynı anda gelen ikinci bir istek, aynı satır için `FOR UPDATE` çalıştırmak ister.
4.  **Sonuç:** İkinci istek, birinci istek `COMMIT` veya `ROLLBACK` yapana kadar **bekletilir (Wait)**.
5.  Birinci istek parayı düşüp çıkar.
6.  İkinci istek kilidi alır, güncel bakiyeyi (azalmış hali) okur ve "Yetersiz Bakiye" hatası verir.
7.  Sistem tutarlıdır.

### ✅ Definition of Done
1.  `purchaseItem` metodu yazıldı.
2.  `$queryRaw` içinde `FOR UPDATE` komutunun geçtiği doğrulandı.
3.  Prisma Transaction (`tx`) nesnesinin tüm işlemlerde kullanıldığı teyit edildi (Eğer `this.prisma` kullanılırsa kilit işe yaramaz).
4.  Yetersiz bakiye durumunda işlemin iptal edildiği (Throw Error) görüldü.

---

**Devam et** dediğinde, "Kim ne zaman ne harcadı?" sorusunun cevabı olan ve yine Partitioning gerektiren **Faz 22: İşlem Defteri (Ledger)** aşamasına geçeceğiz. Muhasebe kaydı olmadan ekonomi yönetilmez.