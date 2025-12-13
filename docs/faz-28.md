
---

# Phase 28: Scalable Achievement System (JSONB Tiers)

**Durum:** Oyunlaştırma ve Tutundurma (Retention).
**Hedef:** Başarımların kural setlerini (Hedef: 100 XP, Ödül: 50 Gem) JSONB formatında esnek bir yapıda tutmak, ancak kullanıcı ilerlemesini (`user_achievements`) ilişkisel ve sorgulanabilir kılmak.

### 📋 Mimari Prensipler (PDF Referansı: Sayfa 13, 14)
1.  **Statik Tanımlar (Achievements):**
    *   `code`: Kod tarafında hard-coded referans verilecek anahtar (örn: `wildfire`, `sage`).
    *   `tiers` (JSONB): Seviye kuralları burada durur. Şema değişikliği gerektirmeden yeni seviyeler eklenebilir.
2.  **Dinamik İlerleme (User Achievements):**
    *   Bu tablo sık güncellenir.
    *   `completed_tier`: Kullanıcının hangi seviyeyi bitirdiğini tutar.
    *   `current_progress`: Anlık ilerleme sayacı (örn: 53/100).

### 🛠 Implementation Task

#### 1. Prisma Model Tanımı (`schema.prisma`)
Başarım modellerini ekleyin.

```prisma
// --------------------------------------------------------
// MODEL: ACHIEVEMENT (Başarım Tanımı)
// PDF Ref: Sayfa 13-14
// --------------------------------------------------------
model Achievement {
  id          Int      @id @default(autoincrement())
  
  // Kod tarafında kullanılacak sabit anahtar (Slug)
  // Örn: 'wildfire' (Seri yapma başarımı)
  code        String   @unique @db.VarChar(50)
  
  name        String   @db.VarChar(100)
  description String?  @db.Text
  
  // SEVİYE KURALLARI (JSONB)
  // Örnek Yapı:
  // {
  //   "1": { "goal": 10, "reward_gems": 5 },
  //   "2": { "goal": 50, "reward_gems": 20 },
  //   "3": { "goal": 100, "reward_gems": 50 }
  // }
  tiers       Json     
  
  createdAt   DateTime @default(now()) @map("created_at")

  // İlişkiler
  userProgress UserAchievement[]

  @@map("achievements")
}

// --------------------------------------------------------
// MODEL: USER ACHIEVEMENT (İlerleme Durumu)
// --------------------------------------------------------
model UserAchievement {
  userId        String      @map("user_id") @db.Uuid
  user          User        @relation(fields: [userId], references: [id], onDelete: Cascade)

  achievementId Int         @map("achievement_id")
  achievement   Achievement @relation(fields: [achievementId], references: [id], onDelete: Cascade)

  // Anlık ilerleme (Sayaç)
  currentProgress Int       @default(0) @map("current_progress")
  
  // Tamamlanan son seviye (0 = Hiçbiri)
  completedTier   Int       @default(0) @map("completed_tier")
  
  updatedAt     DateTime    @default(now()) @updatedAt @map("updated_at") @db.Timestamptz

  // PK: Bir kullanıcı bir başarımı sadece bir kez takip eder.
  @@id([userId, achievementId])

  @@map("user_achievements")
}
```

#### 2. Migration Oluşturma
Tabloları oluşturun.

```bash
npx prisma migrate dev --name create_achievements
```

#### 3. Seed Verisi (Örnek Başarım)
Sisteme klasik "Wildfire" (Seri Ateşi) başarımını ekleyin.

```typescript
// prisma/seed.ts
await prisma.achievement.upsert({
  where: { code: 'wildfire' },
  update: {},
  create: {
    code: 'wildfire',
    name: 'Wildfire',
    description: 'Reach a streak of N days',
    tiers: {
      "1": { "goal": 3, "reward_gems": 5 },
      "2": { "goal": 7, "reward_gems": 10 },
      "3": { "goal": 14, "reward_gems": 20 },
      "4": { "goal": 30, "reward_gems": 50 }
    }
  }
});
```

### 🔍 Senior Dev İpucu: Tier Logic (Uygulama Tarafı)
Başarım sistemlerinde en büyük karmaşa, "Ödül verdim mi?" kontrolüdür.

*   `UserAchievement` tablosunda `completed_tier: 2` yazıyorsa, kullanıcı 1. ve 2. seviye ödüllerini **almış demektir**.
*   Eğer ilerleme (`current_progress`) 3. seviyenin hedefini geçerse, uygulama ödülü verir ve `completed_tier`'i 3 yapar.
*   Bu sayede ayrı bir "RewardClaimed" tablosuna gerek kalmaz.

### ✅ Definition of Done
1.  `achievements` tablosu `tiers` JSONB sütunu ile oluşturuldu.
2.  `user_achievements` tablosu oluşturuldu.
3.  Seed verisi olarak 'wildfire' başarımı eklendi.
4.  `current_progress` alanının sık güncelleneceği (Write-Heavy) not edildi.

---

**Devam et** dediğinde, projenin **Faz 29: Covering Indexes (Dashboard Optimizasyonu)** aşamasına geçeceğiz. Bu, kullanıcı uygulamayı her açtığında (Dashboard Load) veritabanına binen yükü %50 azaltacak "sihirli" dokunuştur.