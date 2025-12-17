# Phase 19 Technical Deep Dive: Senior-Level Onboarding Document

> **Hedef Kitle:** NestJS temellerini bilen ama mimari vizyonu eksik Junior Backend Developer  
> **Amaç:** Bu doküman seni "Mid-Level" seviyesine çekecek derinlikte teknik bilgi ve mental model sunuyor.  
> **Son Güncelleme:** 2025-12-17

---

## 📑 İçindekiler

1. [Mimari Genel Bakış](#1-mimari-genel-bakış)
2. [Infrastructure Layer: PgBouncer & Prisma](#2-infrastructure-layer-pgbouncer--prisma)
3. [NestJS Core Concepts Deep Dive](#3-nestjs-core-concepts-deep-dive)
4. [Design Patterns ve Mimari Kararlar](#4-design-patterns-ve-mimari-kararlar)
5. [Request Lifecycle: Baştan Sona Veri Akışı](#5-request-lifecycle-baştan-sona-veri-akışı)
6. [Modül Bazlı Kod Analizi](#6-modül-bazlı-kod-analizi)
7. [Veritabanı Mimarisi: Partitioning & SRS](#7-veritabanı-mimarisi-partitioning--srs)
8. [Senior Developer Mental Model](#8-senior-developer-mental-model)
9. [Gap Analizi & Teknik Borçlar](#9-gap-analizi--teknik-borçlar)
10. [Önceliklendirilmiş Refactoring Planı](#10-önceliklendirilmiş-refactoring-planı)

---

## 1. Mimari Genel Bakış

### 1.1 Sistem Topolojisi

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                 │
│                    (Mobile App / Web App)                            │
└─────────────────────────────────┬───────────────────────────────────┘
                                  │ HTTP/HTTPS
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                               │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                       NestJS Application                       │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │ │
│  │  │ Courses  │  │ Exercises│  │ Lesson   │  │ Vocab    │       │ │
│  │  │ Module   │  │ Module   │  │ Flow     │  │ Module   │       │ │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘       │ │
│  │       │             │             │             │              │ │
│  │       └─────────────┴──────┬──────┴─────────────┘              │ │
│  │                            ▼                                   │ │
│  │                   ┌────────────────┐                           │ │
│  │                   │ PrismaModule   │  (Global, Singleton)      │ │
│  │                   │ PrismaService  │                           │ │
│  │                   └───────┬────────┘                           │ │
│  └───────────────────────────┼────────────────────────────────────┘ │
└──────────────────────────────┼──────────────────────────────────────┘
                               │ pg adapter
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      CONNECTION POOLING LAYER                        │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                    PgBouncer (Port 6432)                       │ │
│  │                    Mode: TRANSACTION                           │ │
│  │                    Max Connections: ~100                       │ │
│  └────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       DATA LAYER                                     │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                PostgreSQL 16+ (Port 5432)                      │ │
│  │  ┌──────────────────────────────────────────────────────────┐  │ │
│  │  │  languages │ users │ courses │ units │ levels │ exercises │  │ │
│  │  └──────────────────────────────────────────────────────────┘  │ │
│  │  ┌──────────────────────────────────────────────────────────┐  │ │
│  │  │  enrollments │ lesson_completions (PARTITIONED) │ srs    │  │ │
│  │  └──────────────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2 Neden Bu Mimari?

**Problem:** Duolingo benzeri bir uygulama milyonlarca kullanıcıya hitap edecek. Her kullanıcı günde ortalama 5-10 ders bitirir. Bu, saniyede binlerce veritabanı işlemi demek.

**Çözüm Stratejileri:**

| Katman              | Problem                          | Çözüm                         | Trade-off                         |
| ------------------- | -------------------------------- | ----------------------------- | --------------------------------- |
| Connection          | PostgreSQL max 100 connection    | PgBouncer (Transaction Mode)  | Session-level features kaybedilir |
| Write Volume        | lesson_completions çok büyüyecek | Range Partitioning (by month) | Query'lerde partition key zorunlu |
| Read Performance    | Hierarchy N+1 query              | Raw SQL + json_build_object   | Prisma type-safety kaybedilir     |
| Content Flexibility | Exercise types değişken          | JSONB + Zod validation        | Şema esnekliği vs. type-safety    |

---

## 2. Infrastructure Layer: PgBouncer & Prisma

### 2.1 Neden PgBouncer?

```typescript
// ❌ PROBLEM: Her request yeni connection açar
// PostgreSQL default max_connections = 100
// 100 concurrent user = 100 connection = DB çöker

// ✅ ÇÖZÜM: PgBouncer connection pooling
// 1000 concurrent user → 20 actual DB connections
```

**Transaction Mode vs Session Mode:**

```
SESSION MODE (❌ Ölçeklenmez):
┌──────────┐    ┌──────────────┐    ┌────────┐
│ Request1 │────│ Connection1  │────│   DB   │
└──────────┘    └──────────────┘    └────────┘
                (Request bitene kadar tutulur)

TRANSACTION MODE (✅ Ölçeklenir):
┌──────────┐    ┌──────────────┐    ┌────────┐
│ Request1 │────│              │    │        │
├──────────┤    │ Connection1  │────│   DB   │
│ Request2 │────│   (shared)   │    │        │
├──────────┤    │              │    │        │
│ Request3 │────│              │    │        │
└──────────┘    └──────────────┘    └────────┘
                (Transaction bitince serbest)
```

### 2.2 PrismaService: Lifecycle Hooks Deep Dive

```typescript
// src/prisma/prisma.service.ts
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    // NEDEN: PgBouncer ile uyumluluk için driver adapter kullanıyoruz
    const connectionString = process.env.DATABASE_URL;
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    super({ adapter });
  }

  async onModuleInit() {
    // NEDEN: Eager connection - İlk request'te gecikme yaşanmaz
    // Alternatif: Lazy connection (ilk query'de bağlan) - Ama cold start yaşanır
    await this.$connect();
  }

  async onModuleDestroy() {
    // NEDEN: Graceful shutdown - Connection leak önlenir
    // SIGTERM geldiğinde aktif connection'lar düzgün kapatılır
    await this.$disconnect();
  }
}
```

**OnModuleInit vs Constructor'da Connect:**

```typescript
// ❌ YANLIŞ: Constructor'da async işlem
constructor() {
  this.$connect(); // Promise döner ama await yok, bağlantı garanti değil
}

// ✅ DOĞRU: Lifecycle hook kullan
async onModuleInit() {
  await this.$connect(); // NestJS bu method'u bekler
}
```

### 2.3 Global Module Pattern

```typescript
// src/prisma/prisma.module.ts
@Global() // ← BU ÖNEMLİ
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

**@Global() Decorator'ın Anlamı:**

```
@Global() OLMADAN:
┌─────────────────┐     ┌─────────────────┐
│ CoursesModule   │     │ ExercisesModule │
│  imports: [     │     │  imports: [     │
│   PrismaModule  │     │   PrismaModule  │ ← Her modül import etmeli
│  ]              │     │  ]              │
└─────────────────┘     └─────────────────┘

@Global() İLE:
┌─────────────────┐     ┌─────────────────┐
│ CoursesModule   │     │ ExercisesModule │
│  // PrismaService│     │  // PrismaService│
│  // otomatik     │     │  // otomatik     │ ← Import gerekmez
└─────────────────┘     └─────────────────┘
          ↑                       ↑
          └───────────┬───────────┘
                      │
              ┌───────────────┐
              │ AppModule     │
              │  imports: [   │
              │   PrismaModule│ ← Tek bir yerde import
              │  ]            │
              └───────────────┘
```

**Singleton Pattern Garantisi:**

NestJS'de provider'lar default olarak **Singleton**'dır. Bu şu anlama gelir:

```typescript
// CoursesService ve ExercisesService aynı PrismaService instance'ını kullanır
class CoursesService {
  constructor(private prisma: PrismaService) {} // Instance #1
}

class ExercisesService {
  constructor(private prisma: PrismaService) {} // Aynı Instance #1
}
```

---

## 3. NestJS Core Concepts Deep Dive

### 3.1 Dependency Injection (IoC) Container

**Inversion of Control (IoC) Felsefesi:**

```typescript
// ❌ TIGHT COUPLING: Bağımlılığı kendisi oluşturur
class CoursesService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient(); // Service, Prisma'ya sıkı bağlı
  }
}

// ✅ LOOSE COUPLING: Bağımlılık dışarıdan enjekte edilir
@Injectable()
class CoursesService {
  constructor(private prisma: PrismaService) {} // Container enjekte eder
}
```

**Neden IoC Önemli?**

1. **Testability:** Mock PrismaService geçebilirsin
2. **Flexibility:** Farklı implementasyonlar swap edilebilir
3. **Lifecycle:** NestJS bağımlılıkların yaşam döngüsünü yönetir

**@Injectable() Decorator Arkasında:**

```typescript
@Injectable()
export class ExercisesService {
  constructor(private readonly prisma: PrismaService) {}
}

// TypeScript derlendiğinde metadata eklenir:
// Reflect.defineMetadata('design:paramtypes', [PrismaService], ExercisesService);

// NestJS runtime'da:
// 1. ExercisesService'in PrismaService'e ihtiyacı var mı? → Metadata'dan oku
// 2. PrismaService instance'ı var mı? → Container'dan al
// 3. Yoksa oluştur, varsa var olanı kullan (Singleton)
// 4. ExercisesService constructor'ına inject et
```

### 3.2 Module System: Encapsulation

```typescript
// src/courses/courses.module.ts
@Module({
  providers: [CoursesService, CourseRepository], // İç bileşenler
  exports: [CoursesService], // Dışarıya açılan API
})
export class CoursesModule {}
```

**Bu Tasarımın Mantığı:**

```
┌─────────────────────────────────────────┐
│            CoursesModule                 │
│  ┌─────────────────────────────────────┐│
│  │ PUBLIC (exports)                    ││
│  │  - CoursesService                   ││
│  └─────────────────────────────────────┘│
│  ┌─────────────────────────────────────┐│
│  │ PRIVATE (internal)                  ││
│  │  - CourseRepository                 ││  ← Dışarıdan erişilemez!
│  └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

**Neden Repository Export Edilmiyor?**

```typescript
// Başka bir modülden:
// ❌ courseRepository.getCourseHierarchy(1) → Erişim yok!
// ✅ coursesService.getCourseHierarchy(1)   → Bu yol zorunlu

// Böylece:
// 1. Repository implementasyonu değişebilir (raw SQL → Prisma query)
// 2. Service layer business logic uygular (validation, logging)
// 3. Tek bir entry point: Service
```

### 3.3 Validation Pipeline: class-validator + class-transformer

```typescript
// main.ts
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true, // DTO'da olmayan field'ları sil
    forbidNonWhitelisted: true, // Fazla field varsa 400 fırlat
    transform: true, // Plain object → DTO class instance
  })
);
```

**DTO Validasyon Akışı:**

```typescript
// src/exercises/dto/create-exercise.dto.ts
export class CreateExerciseDto {
  @IsInt()
  levelId: number; // "levelId": "5" → number 5 (transform: true)

  @IsString()
  type: string;

  @IsInt()
  @Min(1)
  @Max(10)
  @IsOptional()
  difficultyScore?: number = 1; // Gelmezse default 1
}
```

**Request Body Transform Süreci:**

```
1. HTTP Request Body (JSON):
   { "levelId": "5", "type": "translate", "content": {...} }

2. class-transformer (transform: true):
   CreateExerciseDto {
     levelId: 5,        // string → number
     type: "translate",
     content: {...}
   }

3. class-validator:
   ✅ levelId: IsInt() → PASS
   ✅ type: IsString() → PASS
   ✅ difficultyScore: undefined → default 1

4. Controller'a ulaşan:
   CreateExerciseDto {
     levelId: 5,
     type: "translate",
     difficultyScore: 1,  // ← Default değer eklendi
     content: {...}
   }
```

### 3.4 Exception Filter: Standardized Error Response

```typescript
// src/common/filters/http-exception.filter.ts
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: /* ... */,
    };

    // 5xx = Error log (critical), 4xx = Warning log (user error)
    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(`${request.method} ${request.url}`, exception.stack);
    } else {
      this.logger.warn(`${request.method} ${request.url}: ${message}`);
    }

    response.status(status).json(errorResponse);
  }
}
```

**Neden Custom Exception Filter?**

```json
// ❌ Default NestJS Error Response (Stack trace sızar!)
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "TypeError: Cannot read property 'id' of undefined\n    at CoursesService.findOne (/app/src/courses/courses.service.ts:42:15)\n..."
}

// ✅ Custom Filter Response (Güvenli + Consistent)
{
  "statusCode": 500,
  "timestamp": "2025-12-17T14:30:00.000Z",
  "path": "/courses/999",
  "method": "GET",
  "message": "Internal server error"
}
```

---

## 4. Design Patterns ve Mimari Kararlar

### 4.1 Repository Pattern

**Projede Kullanımı:**

```typescript
// src/courses/repositories/course.repository.ts
@Injectable()
export class CourseRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getCourseHierarchy(courseId: number) {
    // Raw SQL - Performans kritik
    return this.prisma.$queryRaw`...`;
  }

  async findAll() {
    // Prisma Query - Basit CRUD
    return this.prisma.course.findMany();
  }
}
```

**Neden Repository Pattern Kullandık?**

```
Service Layer:
├── Business Logic (validation, error handling)
├── Orchestration (birden fazla repository çağrısı)
└── Transaction yönetimi

Repository Layer:
├── Data Access Logic (query optimization)
├── Raw SQL encapsulation
└── Prisma abstraction
```

**Trade-off Analizi:**

| Yaklaşım               | Avantaj                 | Dezavantaj                    |
| ---------------------- | ----------------------- | ----------------------------- |
| Service içinde Prisma  | Basit, az dosya         | Query logic dağılır, test zor |
| Repository Pattern     | Query izole, test kolay | Ekstra abstraction layer      |
| Repository + Interface | DI ile mock'lanabilir   | Over-engineering riski        |

**Bu Projede Seçim:** Repository Pattern (Interface'siz)

- Neden? Prisma zaten kendi mock'unu sağlıyor (`jest-mock-extended`)
- Interface eklemek şu an over-engineering olur

### 4.2 JSONB + Zod: Hybrid Validation Strategy

**Problem:** Exercise content yapısı type'a göre değişiyor.

```typescript
// translate: { prompt, correct_answers, tokens? }
// match_pairs: { pairs: [{ term, definition }] }
// listen_tap: { audio_url, transcription }
// speak: { prompt, expected_phrase }
```

**Çözüm Stratejisi:**

```
1. Prisma DTO (class-validator):
   - Genel yapı doğrulama (levelId, type, content)

2. Zod Schema (content.schema.ts):
   - Type-specific deep validation
   - Discriminated Union Pattern
```

**Kod Analizi:**

```typescript
// src/exercises/schemas/content.schema.ts

// Her exercise type için ayrı schema
export const TranslateContentSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
  correct_answers: z.array(z.string()).min(1),
  tokens: z.array(z.string()).optional(),
});

// Discriminated Union: "type" field'a göre schema seç
export const ExercisePayloadSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("translate"),
    content: TranslateContentSchema,
  }),
  z.object({
    type: z.literal("match_pairs"),
    content: MatchContentSchema,
  }),
  // ...
]);

// Service'de kullanım:
const result = safeValidateExerciseContent(dto.type, dto.content);
if (!result.success) {
  throw new BadRequestException({
    message: `Invalid content for type "${dto.type}"`,
    errors: result.error.issues, // Detaylı Zod hataları
  });
}
```

**Neden İki Katmanlı Validation?**

```
HTTP Request
     │
     ▼
┌──────────────────────────────┐
│ ValidationPipe (class-validator) │
│ ✓ levelId: number            │
│ ✓ type: string               │
│ ✓ content: object (shallow)  │ ← Sadece object olduğunu kontrol eder
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ Service Layer (Zod)          │
│ ✓ type === 'translate'?      │
│ ✓ content.prompt: min(1)     │ ← Type-specific deep validation
│ ✓ content.correct_answers    │
└──────────────────────────────┘
```

### 4.3 Raw SQL vs Prisma Query: When to Use What

**N+1 Problem Örneği:**

```typescript
// ❌ N+1 PROBLEM (Prisma nested include)
const course = await prisma.course.findUnique({
  where: { id: 1 },
  include: {
    units: {
      include: {
        levels: true, // 1 query for course + N queries for units + M queries for levels
      },
    },
  },
});

// Query count: 1 + N + (N * M) = O(N*M) queries
```

**Çözüm: Single Query with JSON Aggregation:**

```typescript
// ✅ SINGLE QUERY (course.repository.ts)
const result = await this.prisma.$queryRaw`
  SELECT 
    c.id, c.title,
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', u.id,
          'title', u.title,
          'levels', (
            SELECT jsonb_agg(
              jsonb_build_object('id', l.id, 'order_index', l.order_index)
            )
            FROM levels l WHERE l.unit_id = u.id
          )
        )
      )
      FROM units u WHERE u.course_id = c.id
    ) as curriculum
  FROM courses c
  WHERE c.id = ${courseId}
`;

// Query count: 1 (always!)
```

**Trade-off:**

| Yaklaşım        | Query Count | Type Safety         | Maintainability           |
| --------------- | ----------- | ------------------- | ------------------------- |
| Prisma include  | O(N\*M)     | ✅ Full             | ✅ Easy                   |
| Raw SQL + jsonb | O(1)        | ⚠️ Manual interface | ⚠️ SQL knowledge required |

**Karar Kriterleri:**

- Simple CRUD → Prisma Query
- Hierarchy/Report/Dashboard → Raw SQL
- Performance critical → Raw SQL + EXPLAIN ANALYZE

---

## 5. Request Lifecycle: Baştan Sona Veri Akışı

### 5.1 Complete Request Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           HTTP REQUEST                                       │
│  POST /api/exercises                                                         │
│  Body: { levelId: 1, type: "translate", content: {...} }                    │
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. MIDDLEWARE LAYER                                                          │
│    ┌─────────────────────────────────────────────────────────────────────┐  │
│    │ Express Middleware                                                   │  │
│    │ - Body Parser (JSON → Object)                                       │  │
│    │ - CORS                                                              │  │
│    │ - Helmet (Security Headers)                                         │  │
│    └─────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 2. GUARDS (not implemented yet)                                              │
│    ┌─────────────────────────────────────────────────────────────────────┐  │
│    │ AuthGuard → JWT Token validation                                    │  │
│    │ RolesGuard → Permission check                                       │  │
│    │ ThrottlerGuard → Rate limiting                                      │  │
│    └─────────────────────────────────────────────────────────────────────┘  │
│    ⚠️ CURRENT STATE: Guards not implemented - Security gap!                 │
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 3. INTERCEPTORS (pre-controller)                                             │
│    ┌─────────────────────────────────────────────────────────────────────┐  │
│    │ LoggingInterceptor → Request logging                                │  │
│    │ TimeoutInterceptor → Request timeout                                │  │
│    └─────────────────────────────────────────────────────────────────────┘  │
│    ⚠️ CURRENT STATE: No interceptors - Logging gap!                         │
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 4. PIPES (Validation)                                                        │
│    ┌─────────────────────────────────────────────────────────────────────┐  │
│    │ ValidationPipe                                                       │  │
│    │ ├── class-transformer: { levelId: "1" } → { levelId: 1 }           │  │
│    │ └── class-validator: DTO decorators check                           │  │
│    │                                                                      │  │
│    │ On Failure: BadRequestException → Exception Filter                  │  │
│    └─────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │ CreateExerciseDto (validated)
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 5. CONTROLLER                                                                │
│    ┌─────────────────────────────────────────────────────────────────────┐  │
│    │ @Post()                                                              │  │
│    │ async create(@Body() dto: CreateExerciseDto) {                      │  │
│    │   return this.exercisesService.create(dto);                         │  │
│    │ }                                                                    │  │
│    └─────────────────────────────────────────────────────────────────────┘  │
│    ⚠️ CURRENT STATE: No controller! Service-only architecture.              │
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 6. SERVICE LAYER                                                             │
│    ┌─────────────────────────────────────────────────────────────────────┐  │
│    │ ExercisesService.create(dto)                                        │  │
│    │ ├── 1. Zod validation: safeValidateExerciseContent(type, content)  │  │
│    │ ├── 2. Media validation (soft-fail with warning log)               │  │
│    │ └── 3. Prisma insert: prisma.exercise.create({...})                │  │
│    └─────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 7. DATA ACCESS (PrismaService)                                               │
│    ┌─────────────────────────────────────────────────────────────────────┐  │
│    │ prisma.exercise.create()                                            │  │
│    │ ├── Prisma Client generates SQL                                     │  │
│    │ ├── pg adapter → Pool connection request                           │  │
│    │ └── PgBouncer → Actual DB connection                               │  │
│    └─────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 8. DATABASE                                                                  │
│    ┌─────────────────────────────────────────────────────────────────────┐  │
│    │ PostgreSQL 16                                                        │  │
│    │ INSERT INTO exercises (level_id, type, content, ...)                │  │
│    │ RETURNING *                                                          │  │
│    └─────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 9. RESPONSE FLOW (Reverse)                                                   │
│    DB → PrismaService → Service → Controller → Interceptor → Response       │
│                                                                              │
│    Exception Path:                                                           │
│    Any Layer → Exception → HttpExceptionFilter → Formatted Error Response   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Transaction Flow: Lesson Completion

```typescript
// src/lesson-flow/lesson-flow.service.ts
async finishLesson(userId: string, dto: FinishLessonDto) {
  // Interactive Transaction: All-or-nothing
  return this.prisma.$transaction(
    async (tx) => {
      // STEP 1: Log completion (partition key = completedAt)
      const completionLog = await tx.lessonCompletion.create({
        data: {
          userId,
          courseId: BigInt(dto.courseId),
          // ... analytics data
          completedAt: new Date(), // ← PARTITION KEY
        },
      });

      // STEP 2: Update user XP (atomic increment)
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          totalXp: { increment: dto.xpEarned }, // ← Race-condition safe
        },
      });

      // STEP 3: Update enrollment (within same transaction)
      await tx.enrollment.updateMany({ /* ... */ });

      return { newTotalXp, lessonLogId };
    },
    {
      maxWait: 5000,  // Connection pool waiting time
      timeout: 10000, // Total transaction time
    },
  );
}
```

**Transaction Isolation Level:**

```sql
-- PostgreSQL default: READ COMMITTED
-- Bu transaction'da:
-- 1. Step 1 insert → snapshot alınır
-- 2. Step 2 update → aynı snapshot
-- 3. Commit → tüm değişiklikler atomic olarak uygulanır

-- Eğer herhangi bir step fail olursa:
-- ROLLBACK → Hiçbir değişiklik uygulanmaz
```

---

## 6. Modül Bazlı Kod Analizi

### 6.1 Exercises Module

**Dosya Yapısı:**

```
src/exercises/
├── dto/
│   ├── create-exercise.dto.ts    # Input validation
│   └── index.ts
├── schemas/
│   ├── content.schema.ts         # Zod type-specific validation
│   ├── media.schema.ts           # Media metadata validation
│   └── index.ts
├── exercises.module.ts           # Module definition
├── exercises.service.ts          # Business logic
└── index.ts                      # Barrel export
```

**exercises.service.ts Detaylı Analiz:**

```typescript
@Injectable()
export class ExercisesService {
  private readonly logger = new Logger(ExercisesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateExerciseDto) {
    // ───────────────────────────────────────────────────────
    // STEP 1: Content Validation (Zod)
    // ───────────────────────────────────────────────────────
    // NEDEN safeValidate? → Parse throw eder, safeParse error döner
    // Production'da hata yönetimi için safeParse tercih edilir
    const validationResult = safeValidateExerciseContent(dto.type, dto.content);

    if (!validationResult.success) {
      // Zod error format() human-readable çıktı verir
      const errors = validationResult.error.format();

      // ⚠️ LOGGING PATTERN: Structured log with context
      this.logger.warn(
        `Invalid exercise content for type "${dto.type}": ${JSON.stringify(
          errors
        )}`
      );

      // ⚠️ ERROR PATTERN: Detailed validation errors in response
      throw new BadRequestException({
        message: `Invalid content for exercise type "${dto.type}"`,
        errors: validationResult.error.issues,
      });
    }

    // ───────────────────────────────────────────────────────
    // STEP 2: Media Validation (Soft Fail)
    // ───────────────────────────────────────────────────────
    // NEDEN soft fail? → Media eksik olabilir, content kritik ama media değil
    // Log'la ama işlemi devam ettir (monitoring ile track et)
    if (dto.mediaMetadata && Object.keys(dto.mediaMetadata).length > 0) {
      const mediaResult = validateMediaMetadata(dto.mediaMetadata);
      if (!mediaResult.success) {
        this.logger.warn(
          `Exercise type "${dto.type}" has invalid media metadata`
        );
        // throw yok! Soft fail.
      }
    }

    // ───────────────────────────────────────────────────────
    // STEP 3: Database Insert
    // ───────────────────────────────────────────────────────
    return this.prisma.exercise.create({
      data: {
        levelId: BigInt(dto.levelId), // ⚠️ Number → BigInt conversion
        type: dto.type,
        difficultyScore: dto.difficultyScore ?? 1,
        content: dto.content as object, // ⚠️ Type assertion (validated above)
        mediaMetadata: (dto.mediaMetadata ?? {}) as object,
      },
    });
  }

  // ───────────────────────────────────────────────────────
  // Raw SQL Query: JSONB Containment (@>)
  // ───────────────────────────────────────────────────────
  async findByContent(contentPattern: Record<string, unknown>) {
    const jsonPattern = JSON.stringify(contentPattern);

    // $queryRaw → Tagged template literal (SQL injection safe)
    return this.prisma.$queryRaw`
      SELECT id, level_id, type, difficulty_score, content, media_metadata, created_at
      FROM exercises
      WHERE content @> ${jsonPattern}::jsonb
      ORDER BY id ASC
    `;

    // @> operator: "content içinde pattern var mı?"
    // Örnek: { tokens: ["apple"] } → tokens array'inde "apple" var mı?
    // GIN index (jsonb_path_ops) bu sorguyu optimize eder
  }
}
```

### 6.2 Courses Module

**Repository Pattern Kullanımı:**

```typescript
// courses.service.ts - Thin Service Layer
@Injectable()
export class CoursesService {
  constructor(private readonly courseRepository: CourseRepository) {}

  async getCourseHierarchy(courseId: number) {
    const result = await this.courseRepository.getCourseHierarchy(courseId);

    // Business logic burada: Not found handling
    if (!result) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }

    return result;
  }
}

// course.repository.ts - Data Access Layer
@Injectable()
export class CourseRepository {
  async getCourseHierarchy(
    courseId: number
  ): Promise<CourseHierarchyResponse | null> {
    // Complex SQL burada izole edilmiş
    const result = await this.prisma.$queryRaw<CourseHierarchyResponse[]>`
      SELECT 
        c.id, c.title, c.description,
        COALESCE(
          (SELECT jsonb_agg(...) FROM units u WHERE u.course_id = c.id),
          '[]'::jsonb
        ) as curriculum
      FROM courses c
      WHERE c.id = ${courseId}
    `;

    return result[0] || null;
  }
}
```

**Type Safety Stratejisi:**

```typescript
// src/courses/interfaces/course-hierarchy.interface.ts
export interface CourseHierarchyResponse {
  id: bigint;
  title: string;
  description: string | null;
  curriculum: Array<{
    id: bigint;
    title: string;
    order_index: number;
    levels: Array<{
      id: bigint;
      order_index: number;
      total_lessons: number;
    }>;
  }>;
}

// Repository'de kullanım:
const result = await this.prisma.$queryRaw<CourseHierarchyResponse[]>`...`;
//                                        ^^^^^^^^^^^^^^^^^^^^^^^^^
//              TypeScript bu type'ı zorlar ama runtime'da kontrol yok!
//              SQL'den dönen şeyin bu interface'e uygun olduğunu varsayar.
```

### 6.3 Lesson Flow Module: Transaction Management

```typescript
async finishLesson(userId: string, dto: FinishLessonDto) {
  return this.prisma.$transaction(
    async (tx) => {
      // tx = Transaction-scoped PrismaClient
      // Tüm işlemler aynı transaction'da

      const completionLog = await tx.lessonCompletion.create({...});
      const updatedUser = await tx.user.update({...});
      await tx.enrollment.updateMany({...});

      return { newTotalXp, lessonLogId };
    },
    {
      maxWait: 5000,  // Pool'dan connection bekleme süresi
      timeout: 10000, // Transaction max süresi
    },
  );
}
```

**Transaction Timeout Neden Önemli?**

```
1. Connection pool limited (PgBouncer ~20 connections)
2. Uzun süren transaction = connection meşgul
3. Diğer request'ler bekler
4. Timeout = Deadlock prevention

Scenario:
- User A: Transaction başlatır (connection #1)
- User B: Transaction başlatır (connection #2)
- User A: User B'nin kaydına lock koyar
- User B: User A'nın kaydına lock koymaya çalışır
- DEADLOCK! → Timeout'la kurtarılır
```

### 6.4 Vocabulary Module: SRS Query Optimization

```typescript
// vocab.repository.ts
async getDueWords(userId: string, courseId: bigint, limit = 10) {
  return this.prisma.userVocabularyProgress.findMany({
    where: {
      userId,
      courseId,
      nextReviewAt: { lte: new Date() }, // now'dan küçük veya eşit
    },
    select: {
      wordToken: true,
      stability: true,
      difficulty: true,
      nextReviewAt: true,
    },
    orderBy: {
      nextReviewAt: 'asc', // En acil olanlar önce
    },
    take: limit,
  });
}
```

**Index Strategy (schema.prisma):**

```prisma
model UserVocabularyProgress {
  // ...

  // Covering Index: Query'nin ihtiyacı olan tüm kolonları içerir
  @@index([userId, courseId, nextReviewAt], name: "idx_srs_fetch_queue")

  // Bu index şunu sağlar:
  // 1. WHERE userId AND courseId → Index seek
  // 2. WHERE nextReviewAt <= NOW() → Range scan
  // 3. ORDER BY nextReviewAt → Index order (no sort needed)
  // 4. SELECT stability, difficulty → INDEX ONLY SCAN (migration'da INCLUDE ile)
}
```

---

## 7. Veritabanı Mimarisi: Partitioning & SRS

### 7.1 Range Partitioning (lesson_completions)

**Problem:**

```
lesson_completions tablosu:
- Günlük 1M satır ekleniyor
- 1 yılda 365M satır
- SELECT * WHERE user_id = X → Full table scan = Ölüm
```

**Çözüm: Monthly Partitioning**

```sql
-- Parent table (sadece şema, veri tutmaz)
CREATE TABLE lesson_completions (
    id BIGINT,
    user_id UUID,
    completed_at TIMESTAMPTZ,  -- PARTITION KEY
    ...
    PRIMARY KEY (user_id, completed_at, id)
) PARTITION BY RANGE (completed_at);

-- Child tables (veri burada)
CREATE TABLE lesson_completions_y2025m01 PARTITION OF lesson_completions
FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE lesson_completions_y2025m02 PARTITION OF lesson_completions
FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');
```

**Query Optimization:**

```sql
-- ❌ YANLIŞ: completed_at filtresi yok
SELECT * FROM lesson_completions WHERE user_id = 'abc';
-- Tüm partition'lar taranır (partition pruning yok)

-- ✅ DOĞRU: completed_at filtresi var
SELECT * FROM lesson_completions
WHERE user_id = 'abc'
  AND completed_at >= '2025-01-01'
  AND completed_at < '2025-02-01';
-- Sadece lesson_completions_y2025m01 taranır
```

### 7.2 Automatic Partition Maintenance

```typescript
// src/cron/partition-maintenance.service.ts
@Injectable()
export class PartitionMaintenanceService {
  // Her ayın 15'inde gece yarısı çalışır
  @Cron("0 0 15 * *")
  async createNextMonthPartition() {
    // Gelecek ay için partition oluştur
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const tableName = `lesson_completions_y${year}m${month}`;

    await this.prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "${tableName}" 
      PARTITION OF "lesson_completions"
      FOR VALUES FROM ('${startStr}') TO ('${endStr}');
    `);
  }
}
```

**Neden 15'inde?**

```
Ocak 15 → Şubat partition'ı oluşturulur
        → 15+ gün marj var
        → Eğer cron fail olursa manual müdahale için zaman var
        → Şubat 1'de partition hazır
```

### 7.3 Wallet Architecture (Phase 19)

**Zero-Trust Balance Protection:**

```prisma
model UserWallet {
  userId    String   @db.Uuid
  currency  Currency // ENUM ('GEMS', 'HEARTS', 'LINGOTS')
  balance   Int      @default(0)

  @@id([userId, currency])  // Composite PK
  @@map("user_wallets")
}
```

**Database-Level Defense:**

```sql
-- Prisma bunu desteklemez, manual migration'da eklenir
ALTER TABLE user_wallets
ADD CONSTRAINT chk_wallet_balance_non_negative
CHECK (balance >= 0);
```

**Neden Database-Level Constraint?**

```typescript
// ❌ Application-Level Check (Güvensiz)
async deductBalance(userId, amount) {
  const wallet = await this.prisma.userWallet.findFirst({...});
  if (wallet.balance < amount) {
    throw new Error('Insufficient balance');
  }
  // RACE CONDITION: Bu an başka bir request balance'ı düşürmüş olabilir!
  await this.prisma.userWallet.update({
    data: { balance: wallet.balance - amount },
  });
}

// ✅ Database-Level Check (Güvenli)
// CHECK constraint varsa:
// UPDATE user_wallets SET balance = balance - 100 WHERE ...
// → PostgreSQL: "violates check constraint" hatası fırlatır
// → Uygulama hatalı olsa bile DB'yi korur
```

---

## 8. Senior Developer Mental Model

### 8.1 Trade-off Analizi

**Her mimari karar bir trade-off'tur. Bu projede yapılan seçimler:**

| Karar     | Seçilen                 | Alternatif         | Neden Bu?                         |
| --------- | ----------------------- | ------------------ | --------------------------------- |
| ORM       | Prisma                  | TypeORM, Drizzle   | Type-safety, migration, ecosystem |
| Pool      | PgBouncer (Transaction) | Prisma native pool | Scaling, Serverless uyumu         |
| Partition | Range (by month)        | List, Hash         | Time-series data için ideal       |
| Content   | JSONB + Zod             | Separate tables    | Flexibility vs. complexity        |
| Query     | Raw SQL (hierarchy)     | Prisma include     | Performance (N+1 prevention)      |

### 8.2 Kaçınılan Hatalar

```typescript
// ❌ HATA 1: any kullanımı
content: any; // Type-safety yok!

// ✅ ÇÖZÜM:
content: Record<string, unknown>; // Broad ama any değil

// ❌ HATA 2: Inline validation
if (!dto.levelId) throw new Error(); // Manual, hata prone

// ✅ ÇÖZÜM:
@IsInt() levelId: number; // Declarative, framework yönetir

// ❌ HATA 3: Hardcoded strings
type: 'translate' // Typo riski

// ✅ ÇÖZÜM:
// Zod literal ile: z.literal('translate')
// Veya: enum ExerciseType { TRANSLATE = 'translate' }

// ❌ HATA 4: N+1 query
const courses = await prisma.course.findMany();
for (const c of courses) {
  const units = await prisma.unit.findMany({ where: { courseId: c.id } });
  // Her course için ayrı query = O(n) database calls
}

// ✅ ÇÖZÜM:
// 1. Prisma include (basit case)
// 2. Raw SQL + jsonb_agg (complex case)
```

### 8.3 Scalability Düşüncesi

```
Current State:
└── Single PostgreSQL
    └── PgBouncer
        └── NestJS App

Future State (10M users):
└── PostgreSQL Primary
    ├── Read Replicas (3x)
    ├── PgBouncer per replica
    └── NestJS Cluster (PM2/K8s)
        └── Redis Cache Layer

Şu anki mimari bu geçişi destekliyor çünkü:
1. PrismaService singleton → connection string değişince otomatik geçiş
2. Raw SQL → Replica routing eklenebilir
3. Partition → Archive old partitions to cold storage
```

---

## 9. Gap Analizi & Teknik Borçlar

### 9.1 Kritik Eksikler (Immediate Risk)

| #   | Eksik                            | Risk Seviyesi | Etki                            |
| --- | -------------------------------- | ------------- | ------------------------------- |
| 1   | **Controller Layer Yok**         | 🔴 Critical   | HTTP endpoint'ler tanımlı değil |
| 2   | **Authentication/Authorization** | 🔴 Critical   | Herkes her şeye erişebilir      |
| 3   | **API Documentation (Swagger)**  | 🟡 High       | Frontend entegrasyonu zor       |
| 4   | **Request Logging Interceptor**  | 🟡 High       | Debugging/monitoring yok        |

### 9.2 Teknik Borçlar (Future Risk)

| #   | Borç                  | Mevcut Durum       | İdeal Durum                |
| --- | --------------------- | ------------------ | -------------------------- |
| 1   | Type Safety (Raw SQL) | Manual interface   | Runtime validation (zod)   |
| 2   | Error Handling        | Generic BadRequest | Domain-specific exceptions |
| 3   | Test Coverage         | 0%                 | Min 80% unit, 60% e2e      |
| 4   | Caching Layer         | Yok                | Redis + Cache decorator    |
| 5   | Rate Limiting         | Yok                | @nestjs/throttler          |

### 9.3 "Şimdilik Çalışıyor" Kod Analizi

```typescript
// ⚠️ BORÇ 1: BigInt conversion everywhere
levelId: BigInt(dto.levelId);
// Problem: Her yerde manuel conversion = hata riski
// Çözüm: Custom transformer veya DTO'da BigInt tipi

// ⚠️ BORÇ 2: Type assertion abuse
content: dto.content as object;
// Problem: "as" runtime'da kontrol yok
// Çözüm: Validated type döndürmek (Zod parse result)

// ⚠️ BORÇ 3: $executeRawUnsafe SQL injection riski
await this.prisma.$executeRawUnsafe(`
  CREATE TABLE IF NOT EXISTS "${tableName}" ...
`);
// Problem: tableName inject edilebilir
// Çözüm: Whitelist validation veya parameterized query
```

---

## 10. Önceliklendirilmiş Refactoring Planı

### 🔥 Öncelik 1: Controller Layer & API Structure (Hafta 1)

**Neden Kritik?** Service'ler var ama HTTP endpoint yok. Uygulama kullanılamaz durumda.

```
Yapılacaklar:
├── src/exercises/exercises.controller.ts
├── src/courses/courses.controller.ts
├── src/lesson-flow/lesson-flow.controller.ts
├── src/vocabulary/vocabulary.controller.ts
└── Swagger documentation (@nestjs/swagger)
```

### 🔥 Öncelik 2: Authentication & Authorization (Hafta 2)

**Neden Kritik?** Herkes admin yetkisiyle işlem yapabilir.

```
Yapılacaklar:
├── @nestjs/passport + passport-jwt
├── AuthModule (JWT validation)
├── AuthGuard (route protection)
├── RolesGuard (admin/user separation)
└── User decorator (@CurrentUser())
```

### 🔥 Öncelik 3: Logging & Monitoring (Hafta 2)

**Neden Kritik?** Production'da hata takibi imkansız.

```
Yapılacaklar:
├── LoggingInterceptor (request/response logging)
├── Pino/Winston integration (structured logs)
├── Request ID correlation
├── Performance timing
└── Health check endpoint
```

### 📋 Öncelik 4-10 (Backlog)

| Sıra | Item                       | Effort | Impact |
| ---- | -------------------------- | ------ | ------ |
| 4    | Unit Tests (Service layer) | M      | High   |
| 5    | E2E Tests (Happy path)     | M      | High   |
| 6    | Rate Limiting (@throttler) | S      | Medium |
| 7    | Caching Layer (Redis)      | L      | High   |
| 8    | Input Sanitization         | S      | Medium |
| 9    | BigInt Transformer Utility | S      | Low    |
| 10   | Error Code Standardization | M      | Medium |

---

## Sonraki Adımlar

Bu dokümantasyonu okuduktan sonra:

1. **Hands-on:** `exercises.service.ts` kodunu satır satır incele
2. **Practice:** Yeni bir exercise type ekleyerek Zod schema flow'u öğren
3. **Debug:** `finishLesson` transaction'ını breakpoint ile takip et
4. **Challenge:** CourseRepository'nin raw SQL'ini Prisma include ile yaz, EXPLAIN ANALYZE ile karşılaştır

---

> **Doküman Sahibi:** Senior Backend Architect  
> **Review:** Tech Lead onayı gerektirir  
> **Güncelleme Sıklığı:** Her major phase sonunda
