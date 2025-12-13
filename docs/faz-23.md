
---

# Phase 23: Interactive Transactions Pattern (The `tx` Propagation)

**Durum:** Servis Katmanı Mimarisi.
**Hedef:** Karmaşık iş mantıklarını (Business Logic) tek bir transaction bloğu içine alırken, Prisma'nın `tx` (Transaction Client) nesnesini alt metotlara güvenli bir şekilde taşıma (Propagation) desenini kurmak.

### 📋 Mimari Prensipler (PDF Referansı: Sayfa 18, 19)
1.  **Dependency Injection Tuzağı:** Servisler genelde `PrismaService`'i (`this.prisma`) kullanır. Ancak bir transaction başladığında, o blok içindeki tüm sorgular `tx` üzerinden gitmelidir.
2.  **Propagation (Taşıma):** Eğer `UserService.updateXP` metodunu transaction içinden çağıracaksanız, bu metoda opsiyonel olarak `tx` parametresi geçebilmelisiniz.
3.  **Kural:** Transaction bloğu içinde asla harici API isteği (HTTP Request) atılmaz, dosya işlemi yapılmaz. Sadece DB işlemleri yapılır.

### 🛠 Implementation Task

#### 1. Repository Pattern Güncellemesi (Transaction Desteği)
Repository'lerinizi hem normal hem de transaction içinde çalışabilir hale getirin.

```typescript
// src/common/prisma.types.ts
import { Prisma, PrismaClient } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';

// Prisma Transaction Client Tipi (Type helper)
export type PrismaTx = Omit<
  PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;
```

#### 2. Servis Metodu Refactoring (Örnek: Inventory Service)
`InventoryService`'i, başka bir servis (örn: `LootBoxService`) tarafından transaction içinde çağrılabilir hale getirin.

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaTx } from '../common/prisma.types';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  // tx parametresi opsiyoneldir.
  // Verilirse onu kullanır (Transaction modu), verilmezse this.prisma (Normal mod).
  async addItemToUser(
    userId: string, 
    itemId: number, 
    quantity: number, 
    tx?: PrismaTx
  ) {
    const db = tx || this.prisma; // Context Switch

    return db.userInventory.upsert({
      where: { uq_user_item: { userId, itemId } },
      create: { userId, itemId, quantity },
      update: { quantity: { increment: quantity } },
    });
  }
}
```

#### 3. Ana Akış (Orchestrator)
Şimdi bu yapıyı `LootBoxService` içinde kullanalım.

```typescript
// loot-box.service.ts
async openBox(userId: string, boxId: number) {
  return this.prisma.$transaction(async (tx) => {
    // 1. Kutuyu açma mantığı (Stored Procedure çağrısı - Faz 27'de gelecek)
    // const rewardItemId = ...
    
    // 2. Envantere ekle (InventoryService'i tx ile çağırıyoruz)
    // Eğer tx vermeseydik, bu işlem transaction dışında kalırdı!
    await this.inventoryService.addItemToUser(userId, rewardItemId, 1, tx);

    // 3. Logla (TransactionService'i tx ile çağırıyoruz)
    await this.ledgerService.logTransaction(..., tx);
    
    return { rewardItemId };
  });
}
```

### ✅ Definition of Done
1.  `PrismaTx` tipi tanımlandı.
2.  Kritik servis metodlarına (envanter ekleme, bakiye güncelleme) opsiyonel `tx` parametresi eklendi.
3.  Transaction bloğu içinde `this.prisma` yerine `tx` nesnesinin kullanıldığı (veya alt servislere paslandığı) kod incelemesiyle doğrulandı.
4.  Bu yapı sayesinde "Nested Transactions" hatalarından kaçınıldığı anlaşıldı.

---

**Devam et** dediğinde, bu transaction bloklarının veritabanını kilitleyip sistemi dondurmasını engelleyeceğimiz **Faz 24: Deadlock Koruması ve Timeout Stratejisi** aşamasına geçeceğiz. "5 saniye kuralını" uygulayacağız.