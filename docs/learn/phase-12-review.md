# Faz 12 Teknik İncelemesi: N+1 Problemi ve JSON Build Object

Bu doküman, ORM'lerin en büyük tuzağını PostgreSQL gücüyle aşmayı açıklar.

---

## 📚 Bölüm 1: N+1 Problemi

### 1.1 Problem Tanımı

```typescript
// N+1 TUZAĞI:
const course = await prisma.course.findUnique({
  where: { id: 1 },
  include: {
    units: {
      include: { levels: true },
    },
  },
});
```

**Arka Planda:**

1. 1 sorgu: `SELECT * FROM courses WHERE id = 1`
2. N sorgu: `SELECT * FROM units WHERE course_id = 1`
3. N×M sorgu: `SELECT * FROM levels WHERE unit_id = ?` (her unit için)

100 Unit × 5 Level = **501 sorgu!**

### 1.2 Hydration Maliyeti

Prisma tüm bu satırları Node.js tarafında birleştirir:

- CPU yükü
- Memory allocation
- Network I/O

---

## 📚 Bölüm 2: PostgreSQL Çözümü

### 2.1 json_build_object

```sql
jsonb_build_object(
  'id', u.id,
  'title', u.title,
  'levels', (SELECT jsonb_agg(...) FROM levels)
)
```

Veritabanı JSON üretir → Node.js sadece pass-through yapar.

### 2.2 jsonb_agg

```sql
SELECT jsonb_agg(
  jsonb_build_object('id', l.id, 'title', l.title)
  ORDER BY l.order_index ASC
)
FROM levels l
WHERE l.unit_id = u.id
```

Satırları JSON array'e toplar.

---

## 📚 Bölüm 3: Repository Pattern

```typescript
@Injectable()
export class CourseRepository {
  constructor(private prisma: PrismaService) {}

  async getCourseHierarchy(courseId: number) {
    return this.prisma.$queryRaw`...`;
  }
}
```

**Neden Repository?**

- Raw SQL'i servis katmanından izole eder
- Test edilebilirlik
- Single Responsibility

---

## 📚 Bölüm 4: Gap Analizi

| #   | Eksik                | Öncelik    |
| --- | -------------------- | ---------- |
| 1   | CourseRepository yok | 🔴 Blocker |
| 2   | CoursesModule yok    | 🔴 Blocker |

---

**Bu doküman, Phase 12 N+1 çözümünü açıklar.**
