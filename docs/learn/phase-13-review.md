# Faz 13 Teknik İncelemesi: Kullanıcı Kayıt Mimarisi (Enrollment)

Bu doküman, N-N (Çoka-Çok) ilişki yönetimini ve composite primary key stratejisini açıklar.

---

## 📚 Bölüm 1: N-N İlişki Bridge Table

### 1.1 Problem

Bir kullanıcı birden fazla kursa kayıt olabilir.
Bir kursta birden fazla kullanıcı olabilir.

→ **N-N (Many-to-Many)** ilişki.

### 1.2 Çözüm: Bridge Table

```
User ←—— Enrollment ——→ Course
 (1)       (N)    (N)      (1)
```

`Enrollment` tablosu "köprü" görevi görür.

---

## 📚 Bölüm 2: Composite Primary Key

### 2.1 Neden Yapay ID Kullanmıyoruz?

```prisma
// ❌ Gereksiz:
model Enrollment {
  id       Int    @id @default(autoincrement())
  userId   String
  courseId BigInt
}

// ✅ Doğru:
model Enrollment {
  userId   String
  courseId BigInt
  @@id([userId, courseId])
}
```

**Avantajlar:**

- Duplicate kayıt imkansız (DB seviyesinde)
- Otomatik indeks oluşur
- Daha az storage

### 2.2 Lookup Sorgusu

```sql
SELECT * FROM enrollments WHERE user_id = $1 AND course_id = $2;
-- PK index kullanılır → O(1) lookup
```

---

## 📚 Bölüm 3: Cascade Delete

```prisma
user   User   @relation(..., onDelete: Cascade)
course Course @relation(..., onDelete: Cascade)
```

| Senaryo          | Davranış           |
| ---------------- | ------------------ |
| User silinirse   | Enrollment silinir |
| Course silinirse | Enrollment silinir |

---

## 📚 Bölüm 4: progressData JSONB

```json
{
  "last_unit_id": 5,
  "checkpoint_rewards": [1, 2, 3]
}
```

Kursa özel metadata, migration gerektirmeden genişletilebilir.

---

**Bu doküman, Phase 13 Enrollment mimarisini açıklar.**
