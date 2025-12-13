Harika. Standartlarımızı belirledik. Şimdi kod yazma zamanı. Projenin kalbi olan "İçerik Motoru"nu (Content Engine) inşa etmeye başlıyoruz.

Bir dil öğrenme uygulamasında her şey (kurslar, dersler, kullanıcı profilleri) bir dile bağlıdır. Bu yüzden **Languages** tablosu, sistemin kök (root) bağımlılığıdır.

İşte **Faz 3**.

---

# Phase 3: Language Infrastructure (Cluster A)

**Durum:** Şema Tasarımı Başlangıcı (Content Engine).
**Hedef:** ISO 639-1 standartlarına uygun, statik dil tanımlarını barındıran ve UI gereksinimlerini (bayrak, yazım yönü) destekleyen temel yapıyı kurmak.

### 📋 Teknik Gereksinimler (PDF Referansı: Sayfa 4)
*   **Küme:** Cluster A (Content Management).
*   **Veri Yapısı:** Nadir değişen, yoğun okunan (Read-Heavy) statik veri.
*   **Standart:** ISO 639-1 (2 karakterli dil kodları: 'en', 'tr', 'es').
*   **UI Desteği:** Bayrak emojileri ve RTL (Right-to-Left) desteği sütunlarda bulunmalı.

### 🛠 Uygulama Adımları

#### 1. Prisma Modeli Oluşturma (`schema.prisma`)
`languages` tablosunu tanımlıyoruz.
*   **Not:** PDF Sayfa 4'teki tasarıma sadık kalarak, bu tabloda `UUID` veya `Serial ID` yerine, **doğal anahtar (Natural Key)** olan `code` alanını Primary Key yapıyoruz. Bu, JOIN işlemlerinde ekstra bir `SELECT` yapmadan dil koduna erişmemizi sağlar.

```prisma
model Language {
  // ISO 639-1 Kodu (PK). Örn: 'tr', 'en'.
  // Veritabanında CHAR(2) olarak tutulacak (sabit uzunluk optimizasyonu).
  code        String  @id @db.Char(2)
  
  // Görünen isim. Örn: 'Turkish', 'English'
  name        String  @db.VarChar(50)
  
  // Kendi dilindeki ismi. Örn: 'Türkçe', 'English'
  // UI'da dil seçici (Language Switcher) için kritiktir.
  nativeName  String  @map("native_name") @db.VarChar(50)
  
  // Hafif görsel referans. Örn: '🇹🇷'
  flagEmoji   String  @map("flag_emoji") @db.VarChar(10)
  
  // Yazım yönü: 'LTR' (Left-to-Right) veya 'RTL' (Right-to-Left - Arapça/İbranice)
  // PDF Sayfa 4: Varsayılan 'LTR'
  direction   String  @default("LTR") @db.VarChar(3)
  
  // Soft Delete / Feature Flag mekanizması
  isActive    Boolean @default(true) @map("is_active")

  // İlişkiler (İleriki fazlarda eklenecek, şimdilik yer tutucu)
  // coursesTeaching  Course[] @relation("TeachingLang")
  // coursesLearning  Course[] @relation("LearningLang")

  @@map("languages") // Tablo adı çoğul ve snake_case
}
```

#### 2. Migration Oluşturma
Modeli veritabanına fiziksel olarak yansıtın.

```bash
npx prisma migrate dev --name init_languages_table
```

*Bu işlem sonucunda SQL tarafında şu kod çalışacaktır (PDF Sayfa 4 ile birebir uyumlu):*
```sql
CREATE TABLE languages (
 code CHAR(2) PRIMARY KEY,
 name VARCHAR(50) NOT NULL,
 native_name VARCHAR(50) NOT NULL,
 flag_emoji VARCHAR(10),
 direction VARCHAR(3) DEFAULT 'LTR',
 is_active BOOLEAN DEFAULT TRUE
);
```

#### 3. Seed Stratejisi (İlk Veri Yükleme)
Uygulamanın çalışabilmesi için veritabanının boş olmaması gerekir. `prisma/seed.ts` dosyasını oluşturun ve temel dilleri ekleyin.

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const languages = [
    { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flagEmoji: '🇹🇷', direction: 'LTR' },
    { code: 'en', name: 'English', nativeName: 'English', flagEmoji: '🇺🇸', direction: 'LTR' },
    { code: 'es', name: 'Spanish', nativeName: 'Español', flagEmoji: '🇪🇸', direction: 'LTR' },
    { code: 'de', name: 'German', nativeName: 'Deutsch', flagEmoji: '🇩🇪', direction: 'LTR' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', flagEmoji: '🇸🇦', direction: 'RTL' }, // RTL Testi
  ]

  for (const lang of languages) {
    await prisma.language.upsert({
      where: { code: lang.code },
      update: {},
      create: lang,
    })
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
```
Seed komutunu çalıştırın: `npx prisma db seed`

### ✅ Definition of Done (Bitti Tanımı)
1.  `languages` tablosu veritabanında oluşturuldu.
2.  `code` alanı `CHAR(2)` tipinde ve Primary Key.
3.  `direction` alanı varsayılan olarak 'LTR'.
4.  Seed verileri yüklendi ve `SELECT * FROM languages;` sorgusu en az 5 dil döndürüyor.
5.  Arapça gibi RTL diller için `direction` alanının 'RTL' olduğu doğrulandı.

---

**Devam et** dediğinde, sistemin en önemli aktörünü tanımlayacağımız **Faz 4: Kullanıcı Çekirdeği (Cluster B)** aşamasına geçeceğiz. Burada UUID kullanımı ve performans alanları devreye girecek.