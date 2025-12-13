# Faz 6 Teknik İncelemesi: Kurs Mimarisi (Course Architecture)

Bu doküman, Course modelinin "neden" ve "nasıl" tasarlandığını derinlemesine analiz eder.

---

## 📚 Bölüm 1: Çift Yönlü Dil İlişkisi

### 1.1 Problem: Tek FK Yetmez

Bir kurs iki dil arasında köprüdür:

- **Learning Language:** Öğrenilecek dil (hedef)
- **From Language:** Kullanıcının ana dili (kaynak)

Örnek: "Türkçe konuşanlar için İngilizce" → `learning: EN`, `from: TR`

### 1.2 Çözüm: İki Ayrı Foreign Key

```prisma
model Course {
  learningLangCode String @map("learning_lang_code") @db.Char(2)
  learningLang     Language @relation("LearningLang", fields: [learningLangCode], references: [code])

  fromLangCode     String @map("from_lang_code") @db.Char(2)
  fromLang         Language @relation("FromLang", fields: [fromLangCode], references: [code])
}
```

**Kod Analizi:**

- `@relation("LearningLang")`: İsimlendirilmiş ilişki. Prisma'nın iki FK'yı ayırt etmesi için şart.
- `fields: [learningLangCode]`: Hangi sütunun FK olduğu.
- `references: [code]`: Language tablosundaki hangi sütuna bağlandığı.

**Ters Tarafta (Language):**

```prisma
model Language {
  coursesLearning Course[] @relation("LearningLang")
  coursesTeaching Course[] @relation("FromLang")
}
```

---

## 📚 Bölüm 2: Unique Constraint (Mükerrer Engelleme)

### 2.1 Problem: Aynı Dil Çifti İçin Çoklu Kurs

Veritabanında iki kez "EN from TR" kursu olması mantıksızdır.

### 2.2 Çözüm: Composite Unique

```prisma
@@unique([learningLangCode, fromLangCode], name: "uq_course_path")
```

**SQL Karşılığı:**

```sql
CREATE UNIQUE INDEX "uq_course_path" ON "courses"("learning_lang_code", "from_lang_code");
```

**Trade-off:**

> Bu constraint, uygulama tarafında try-catch gerektir. Duplicate kayıt denendiğinde Prisma `P2002` hatası fırlatır.

---

## 📚 Bölüm 3: BIGSERIAL vs UUID

### 3.1 Neden Bu Tabloda UUID Kullanmıyoruz?

| Özellik           | Course                | User                       |
| ----------------- | --------------------- | -------------------------- |
| Güvenlik Riski    | Düşük (içerik public) | Yüksek (kişisel veri)      |
| Sharding İhtiyacı | Düşük (az kayıt)      | Yüksek (milyonlarca kayıt) |
| Okuma Performansı | Kritik (listeleme)    | Orta                       |

**Karar:** BIGSERIAL daha küçük ve hızlı index, Course için yeterli.

---

## 📚 Bölüm 4: Gap Analizi

### 4.1 Mevcut Eksiklikler

| #   | Eksik                          | Etki                       | Öncelik    |
| --- | ------------------------------ | -------------------------- | ---------- |
| 1   | Course modeli yok              | İçerik motoru çalışamaz    | 🔴 Blocker |
| 2   | Language ters ilişkileri eksik | Prisma generate hata verir | 🔴 Blocker |
| 3   | Seed'de course verisi yok      | Test ortamı boş            | 🟠 Yüksek  |

### 4.2 Öncelikli Düzeltmeler

1. **Course modeli eklenmesi**
2. **Language modeli güncellenmesi** (inverse relations)
3. **Seed verisi eklenmesi**

---

**Bu doküman, Phase 6 Course mimarisini açıklar.**
