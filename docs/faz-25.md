
---

# Phase 25: League System Architecture (Cohorts & Buckets)

**Durum:** Oyunlaştırma (Gamification).
**Hedef:** Rekabeti yönetilebilir küçük parçalara bölmek. Kullanıcıları "Bronz, Gümüş, Altın" gibi liglere ayırmak ve her ligi kendi içinde 50'şer kişilik gruplara (Cohort) dağıtmak.

### 📋 Mimari Prensipler (PDF Referansı: Sayfa 12, 13)
1.  **Bucketing (Kovalama) Stratejisi:**
    *   Kullanıcı Pazartesi sabahı ilk dersini yaptığında, sistem ona "Açık bir Bronz Ligi grubu" arar.
    *   Bulursa oraya ekler. Bulamazsa (veya grup 50 kişiyse) yeni bir grup yaratır.
2.  **Ayrık Veri:** Haftalık puan (`current_weekly_xp`), kullanıcının genel puanından (`total_xp`) bağımsızdır. Bu yüzden ayrı bir tabloda tutulur.
3.  **Kritik İndeks:** "Bu gruptaki kullanıcıları puana göre sırala" sorgusu, uygulamanın en çok çağrılan sorgularından biridir. İndeks `(cohort_id, current_weekly_xp DESC)` şeklinde olmalıdır.

### 🛠 Implementation Task

#### 1. Prisma Model Tanımı (`schema.prisma`)
`League`, `LeagueCohort` ve `LeagueMembership` modellerini ekleyin.

```prisma
// --------------------------------------------------------
// MODEL: LEAGUE (Lig Tanımları)
// PDF Ref: Sayfa 12
// --------------------------------------------------------
model League {
  // 1=Bronze, 2=Silver, ... 10=Diamond
  tier              Int      @id 
  
  name              String   @db.VarChar(50)
  
  // İlk kaç kişi üst lige çıkar?
  promotionThreshold Int     @map("promotion_threshold")
  
  // Son kaç kişi düşer?
  demotionThreshold  Int     @map("demotion_threshold")

  cohorts           LeagueCohort[]

  @@map("leagues")
}

// --------------------------------------------------------
// MODEL: LEAGUE COHORT (Haftalık Gruplar)
// PDF Ref: Sayfa 13
// --------------------------------------------------------
model LeagueCohort {
  id            String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  
  leagueTier    Int      @map("league_tier")
  league        League   @relation(fields: [leagueTier], references: [tier])

  // Hangi haftanın grubu? (Pazartesi tarihi)
  weekStartDate DateTime @map("week_start_date") @db.Date
  
  // Grup doldu mu? (Uygulama mantığı 50'de kapatır)
  isActive      Boolean  @default(true) @map("is_active")

  members       LeagueMembership[]

  // İndeks: Aktif grupları hızlı bulmak için
  @@index([leagueTier, weekStartDate, isActive])
  
  @@map("league_cohorts")
}

// --------------------------------------------------------
// MODEL: LEAGUE MEMBERSHIP (Kullanıcı Durumu)
// PDF Ref: Sayfa 13
// --------------------------------------------------------
model LeagueMembership {
  cohortId      String   @map("cohort_id") @db.Uuid
  cohort        LeagueCohort @relation(fields: [cohortId], references: [id], onDelete: Cascade)

  userId        String   @map("user_id") @db.Uuid
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Sadece o haftaki XP (Sıralama buna göre yapılır)
  currentWeeklyXp Int    @default(0) @map("current_weekly_xp")
  
  joinedAt      DateTime @default(now()) @map("joined_at") @db.Timestamptz

  // PK: Bir kullanıcı bir gruba 1 kere girer.
  @@id([cohortId, userId])

  // KRİTİK İNDEKS: Leaderboard Sorgusu İçin
  // "Bu gruptaki (cohortId) kullanıcıları puana göre (xp DESC) getir"
  @@index([cohortId, currentWeeklyXp(sort: Desc)], name: "idx_league_ranking")

  @@map("league_memberships")
}
```

#### 2. Migration Oluşturma
Lig tablolarını oluşturun.

```bash
npx prisma migrate dev --name create_league_system
```

#### 3. Seed Verisi (Lig Tanımları)
Liglerin boş kalmaması için `prisma/seed.ts` dosyasına tanımları ekleyin.

```typescript
// prisma/seed.ts
const leagues = [
  { tier: 1, name: 'Bronze', promotionThreshold: 5, demotionThreshold: 0 }, // Düşme yok
  { tier: 2, name: 'Silver', promotionThreshold: 5, demotionThreshold: 5 },
  { tier: 3, name: 'Gold', promotionThreshold: 5, demotionThreshold: 5 },
  // ... diğerleri
];

for (const league of leagues) {
  await prisma.league.upsert({
    where: { tier: league.tier },
    update: {},
    create: league,
  });
}
```

### 🔍 Senior Dev Analizi (Sorgu Performansı)
Leaderboard ekranı açıldığında çalışacak sorgu şudur:

```sql
-- "Benim grubumdaki ilk 50 kişiyi getir"
SELECT u.username, u.settings->>'avatar' as avatar, m.current_weekly_xp 
FROM league_memberships m
JOIN users u ON m.user_id = u.id
WHERE m.cohort_id = '...grup-id...'
ORDER BY m.current_weekly_xp DESC
LIMIT 50;
```

**Neden Hızlı?**
1.  `WHERE cohort_id` filtresi, milyonlarca satırı anında 50 satıra indirir.
2.  `ORDER BY` işlemi için veritabanı sıralama (Sort) yapmaz; çünkü `idx_league_ranking` indeksi zaten sıralıdır. İndeksten okuyup döner (Zero-Cost Sort).

### ✅ Definition of Done
1.  Lig sistemi tablolarının (`leagues`, `cohorts`, `memberships`) oluşturulduğu doğrulandı.
2.  Seed komutu ile Bronz, Gümüş liglerinin eklendiği görüldü.
3.  `idx_league_ranking` indeksinin, `current_weekly_xp` üzerinde **DESC (Azalan)** sıralamada olduğu teyit edildi. (Sıralama yönü indekste önemlidir).

---

**Devam et** dediğinde, bu liglerdeki sıralamayı etkileyen ama veritabanını yormaması gereken **Faz 26: Sıralama İndeksi Optimizasyonu (Detay)** aşamasına... Bir saniye, Faz 26'yı zaten yukarıdaki indeks adımıyla (Adım 3) kapsadık.

Bu yüzden doğrudan **Faz 27: Loot Box Mantığı (Stored Procedure)** aşamasına geçeceğiz. Rastgele sayı üretme işini neden Node.js'e değil de veritabanına yaptıracağımızı göreceğiz.