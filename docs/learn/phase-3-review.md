# Faz 3 Teknik İncelemesi: Dil Altyapısı (Language Infrastructure)

Bu doküman, bir Junior Backend Developer'ı "Mid-Level" seviyesine taşımak hedefiyle, Faz 3'te uygulanan mimarinin "neden" ve "nasıl" yapıldığını derinlemesine analiz eder.

---

## 📚 Bölüm 1: NestJS Mimarisi ve Design Pattern'lar

Kodumuza dalmadan önce, NestJS'in temel felsefesini anlamak şarttır. NestJS, Angular'dan ilham almış ve birçok **Enterprise Design Pattern**'ı kullanır.

### 1.1 Inversion of Control (IoC) ve Dependency Injection (DI)

**Problem:** Bir sınıfın (A) başka bir sınıfa (B) ihtiyaç duyduğu durumlarda, A sınıfı B'yi kendi içinde oluşturur (`new B()`). Bu, **Tight Coupling** (sıkı bağlılık) yaratır. B değişirse A da değişmek zorundadır. Test etmek çok zordur.

**Çözüm: IoC (Tersine Çevirme)**
Kontrol artık sınıfın kendisinde değil, bir **Container**'dadır. NestJS bu container'dır. Sınıflar bağımlılıklarını kendileri oluşturmaz, container'dan "ister".

```typescript
// src/app.controller.ts (Mevcut Kod)
@Controller()
export class AppController {
  // AppService burada "new AppService()" ile OLUŞTURULMADI.
  // NestJS Container, AppService'i ENJEKTE ETTİ.
  constructor(private readonly appService: AppService) {}
}
```

**Senior Developer Bakış Açısı:**

> DI kullanmak, test yazarken sınıfı izole etmemizi sağlar. Controller'ı test ederken gerçek `AppService` yerine bir "Mock" (sahte) servis enjekte edebiliriz. Bu, Unit Test'lerin temel taşıdır.

---

### 1.2 Singleton Pattern

NestJS'te, `@Injectable()` ile işaretlenen her servis varsayılan olarak **Singleton**'dır. Yani uygulama boyunca tek bir örneği (instance) vardır.

```typescript
// src/prisma/prisma.service.ts
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    // Bu constructor uygulama başlatıldığında BİR KERE çalışır.
    const connectionString = process.env.DATABASE_URL;
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    super({ adapter });
  }
}
```

**Neden Singleton?**
Veritabanı bağlantıları **pahalıdır**. Her istek için yeni bir bağlantı açmak sunucuyu çökertir. `PrismaService` Singleton olarak tek bir bağlantı havuzunu (Pool) tüm uygulamada paylaşır.

**Trade-off:**
Singleton, **state** (durum) tutmamalıdır. Eğer `PrismaService` içinde bir `this.currentUser` değişkeni tutsaydık, tüm kullanıcılar aynı şeyi görürdü. Bu, ciddi bir güvenlik açığı olurdu.

---

### 1.3 @Global() Decorator ve Scope

```typescript
// src/prisma/prisma.module.ts
@Global() // <-- Bu kritik.
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

**`@Global()` Ne Yapar?**
Normalde bir servis kullanmak için modülü ilgili modüle import etmelisiniz:

```typescript
// Örnek: languages.module.ts
@Module({
  imports: [PrismaModule], // Her seferinde bunu yazmak gerekir.
})
```

`@Global()` ile işaretlenmiş modüller **tüm uygulamada** otomatik olarak erişilebilir olur. `PrismaService` her yerde lazım olduğu için bu mantıklıdır.

**Uyarı:** `@Global()` çok sık kullanılmamalı. Her şeyi global yapmak, bağımlılıkları gizler ve kodun anlaşılmasını zorlaştırır.

---

## 📚 Bölüm 2: Request Lifecycle (İstek Yaşam Döngüsü)

Bir HTTP isteği NestJS'e girdiğinde hangi aşamalardan geçer? Bu akışı anlamak, hata ayıklama ve performans optimizasyonu için hayatidir.

```
[Client HTTP Request]
        │
        ▼
┌───────────────────┐
│  1. Middleware    │  (Logging, CORS)
└───────────────────┘
        │
        ▼
┌───────────────────┐
│  2. Guards        │  (AuthGuard - Kimlik Doğrulama)
└───────────────────┘
        │
        ▼
┌───────────────────┐
│  3. Interceptors  │  (Before - Request Transform)
│     (Pre-Handler) │
└───────────────────┘
        │
        ▼
┌───────────────────┐
│  4. Pipes         │  (ValidationPipe - DTO Doğrulama)
└───────────────────┘
        │
        ▼
┌───────────────────┐
│  5. Controller    │  (Route Handler - Ana İş Mantığı)
│     + Service     │
└───────────────────┘
        │
        ▼
┌───────────────────┐
│  6. Interceptors  │  (After - Response Transform)
│     (Post-Handler)│
└───────────────────┘
        │
        ▼
┌───────────────────┐
│  7. Exception     │  (Hata Yakalama Filtresi)
│     Filters       │
└───────────────────┘
        │
        ▼
[Client HTTP Response]
```

**Mevcut Kodumuzda Neler Eksik?**
Şu anda sadece Adım 5 (Controller + Service) aktif. Diğer katmanlar (Guards, Pipes, Filters) henüz implemente edilmedi. Bu, **teknik borç** (technical debt) olarak Faz 4+ için planlanmalıdır.

---

## 📚 Bölüm 3: Faz 3 Kod Analizi (Language Model)

### 3.1 Prisma Schema Analizi

```prisma
// prisma/schema.prisma (Faz 3 Sonrası)
model Language {
  code        String  @id @db.Char(2)  // Natural Key
  name        String  @db.VarChar(50)
  nativeName  String  @map("native_name") @db.VarChar(50)
  flagEmoji   String  @map("flag_emoji") @db.VarChar(10)
  direction   String  @default("LTR") @db.VarChar(3)
  isActive    Boolean @default(true) @map("is_active")

  @@map("languages")
}
```

**Mimari Kararların Analizi:**

| Karar                           | Neden?                                                                      | Alternatif Neden Seçilmedi?                                                            |
| ------------------------------- | --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `@id @db.Char(2)` (Natural Key) | ISO 639-1 kodları evrenseldir, değişmez. JOIN'lerde ekstra lookup gereksiz. | UUID kullanmak, `WHERE code = 'tr'` yerine `WHERE id = '...'` yazmayı zorunlu kılardı. |
| `@db.VarChar(50)`               | Dinamik uzunluk, disk alanı optimizasyonu.                                  | `@db.Char(50)` boş alanları da doldururdu (wasteful).                                  |
| `@map("native_name")`           | Prisma'da camelCase, DB'de snake_case. İkili standart korunuyor.            | Tek standart seçilseydi, ya ORM ya da SQL okunabilirliği zarar görürdü.                |
| `isActive` (Soft Delete)        | Kayıt silinmez, devre dışı bırakılır. Veri kaybı önlenir.                   | `DELETE FROM` komutu geri dönüşümsüzdür.                                               |

---

### 3.2 Seed Stratejisi ve Upsert Pattern

```typescript
// prisma/seed.ts
await prisma.language.upsert({
  where: { code: lang.code },
  update: {}, // Kayıt varsa hiçbir şey yapma.
  create: lang, // Kayıt yoksa oluştur.
});
```

**Neden `createMany()` Değil?**
`createMany` aynı `code` ile iki kayıt oluşturmaya çalışırsa **hata fırlatır** (Unique Constraint Violation). `upsert`, idempotent bir operasyondur: kaç kez çalıştırırsanız çalıştırın, sonuç aynıdır. Bu, CI/CD pipeline'larında kritiktir.

---

## 📚 Bölüm 4: Gap Analizi (Teknik Borç Raporu)

Mevcut kod tabanını "acımasız" bir gözle inceledim. İşte bulgular:

### 4.1 Kritik Eksiklikler

| #   | Eksik                              | Etki                                                          | Öncelik        |
| --- | ---------------------------------- | ------------------------------------------------------------- | -------------- |
| 1   | `app.module.ts` silindi.           | Uygulama başlamaz. `main.ts` bu modülü referans alıyor.       | 🔴 **BLOCKER** |
| 2   | Global Exception Filter yok.       | Yakalanmamış hatalar ham stack trace döner (güvenlik riski).  | 🟠 Yüksek      |
| 3   | ValidationPipe yok.                | DTO'lar doğrulanmaz, geçersiz veri DB'ye gider.               | 🟠 Yüksek      |
| 4   | Logging yok.                       | Üretimde hata ayıklama imkansız.                              | 🟡 Orta        |
| 5   | HealthCheck endpoint yok.          | Kubernetes/Load Balancer uygulamanın ayakta olduğunu bilemez. | 🟡 Orta        |
| 6   | `PrismaService` hata yönetimi yok. | DB bağlantı hatası uygulamayı patlatır.                       | 🟠 Yüksek      |

### 4.2 "Şimdilik Çalışıyor" Noktaları (Dikkat!)

1.  **`process.env.DATABASE_URL` doğrudan okunuyor.**

    - Sorun: Eğer ortam değişkeni eksikse, uygulama çalışma zamanında belirsiz davranış sergiler.
    - Çözüm: NestJS `ConfigModule` ile validation yapılmalı.

2.  **`PrismaService` constructor'da `Pool` oluşturuluyor.**
    - Sorun: Bağlantı havuzu ayarları (min/max connections) hard-coded.
    - Çözüm: Bu değerler `.env`'den okunmalı.

---

## 📚 Bölüm 5: Öncelikli Refactoring Planı

Aşağıdaki maddeler onaylandıktan sonra uygulanacaktır:

| Sıra | Madde                        | Açıklama                                                                                    |
| ---- | ---------------------------- | ------------------------------------------------------------------------------------------- |
| 1    | `app.module.ts` Restorasyonu | BLOCKER. Uygulamanın çalışması için şart.                                                   |
| 2    | Global Exception Filter      | `HttpExceptionFilter` oluşturularak tüm hataların standart formatta dönmesi sağlanacak.     |
| 3    | Global Validation Pipe       | `main.ts`'e `useGlobalPipes(new ValidationPipe())` eklenerek DTO validation aktif edilecek. |

---

**Bu doküman, Faz 3 ve öncesinin teknik temelini oluşturur. Onay sonrası implementasyona geçilecektir.**
