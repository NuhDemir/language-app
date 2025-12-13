
---

# Phase 13: User Enrollment Architecture (The Bridge)

**Durum:** Kullanıcı ve Kurs arasındaki N-N (Çoka-Çok) ilişkinin yönetimi.
**Hedef:** `users` ve `courses` tablolarını birbirine bağlayan, veri bütünlüğünü garanti eden ve yüksek performanslı sorgulamaya uygun `enrollments` tablosunu oluşturmak.

### 📋 Mimari Kararlar (PDF Referansı: Sayfa 8)
1.  **Composite Primary Key (Bileşik Anahtar):**
    *   Bu tablo için yapay bir `id` (Serial/UUID) kullanmak **gereksizdir**.
    *   Kayıt, `user_id` ve `course_id` kombinasyonu ile kimlik kazanır.
    *   PK: `(user_id, course_id)`. Bu sayede bir kullanıcının aynı kursa 2. kez kaydolması veritabanı seviyesinde fiziksel olarak imkansız hale gelir.
2.  **Referential Integrity (Referans Bütünlüğü):**
    *   Kullanıcı silinirse -> Kayıt silinir (`ON DELETE CASCADE`).
    *   Kurs silinirse -> Kayıt silinir (`ON DELETE CASCADE`).
3.  **Hafif Metaveri:** Kursa özel küçük notlar (örneğin "son kalınan yer" gibi basit imleçler) için `progress_data` JSONB sütunu kullanılır.

### 🛠 Prisma Schema Task

Aşağıdaki `Enrollment` modelini `schema.prisma` dosyasına ekleyin ve ilişkili modelleri güncelleyin.

```prisma
// --------------------------------------------------------
// MODEL: ENROLLMENT (Kayıtlar)
// PDF Ref: Sayfa 8
// --------------------------------------------------------
model Enrollment {
  // İlişki: Kullanıcı
  userId       String   @map("user_id") @db.Uuid
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // İlişki: Kurs
  courseId     BigInt   @map("course_id")
  course       Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)

  // Aktiflik Durumu (Kullanıcı kursu dondurmuş veya bırakmış olabilir)
  isActive     Boolean  @default(true) @map("is_active")

  // Kursa özel ilerleme meta verisi (Esneklik için)
  // Örn: { "last_unit_id": 5, "checkpoint_rewards": [1, 2] }
  progressData Json     @default("{}") @map("progress_data")

  // Kayıt Tarihi
  enrolledAt   DateTime @default(now()) @map("enrolled_at") @db.Timestamptz

  // COMPOSITE PRIMARY KEY
  // (user_id, course_id) ikilisi tablonun anahtarıdır.
  // Bu aynı zamanda otomatik bir indeks oluşturur.
  @@id([userId, courseId])

  @@map("enrollments")
}

// --------------------------------------------------------
// İLİŞKİ GÜNCELLEMELERİ (User ve Course Modelleri)
// --------------------------------------------------------
// model User {
//   ...
//   enrollments Enrollment[]
//   
//   // Kullanıcının şu an aktif olduğu kurs (Denormalize)
//   // Opsiyoneldir, Auth sırasında hızlı erişim sağlar.
//   currentCourseId BigInt? @map("current_course_id")
// }

// model Course {
//   ...
//   enrollments Enrollment[]
// }
```

### 🔍 Senior Dev İpucu: Current Course Optimizasyonu
Kullanıcı uygulamayı her açtığında "Hangi kurstaydım?" diye sormaması için `users` tablosunda `current_course_id` tutmak yaygın bir pratiktir (Faz 4'te bunu pas geçmiştik). Bu fazda dilersen `users` tablosuna bu alanı ekleyip, `enrollments` tablosunu oluşturduktan sonra mantıksal bağlantıyı kurabilirsin. Ancak Foreign Key eklerken dikkatli ol; döngüsel bağımlılık (Circular Dependency) yaratmamak için bu alan nullable olmalı ve `ON DELETE SET NULL` davranışı sergilemelidir.

### ✅ Definition of Done
1.  `npx prisma migrate dev --name create_enrollments_table` komutu hatasız çalıştı.
2.  Veritabanında `enrollments` tablosunun PK'sinin tek bir sütun değil, iki sütunun birleşimi olduğu doğrulandı.
3.  Aynı kullanıcıyı aynı kursa 2 kez eklemeye çalıştığında (Duplicate Key Error) hata alındığı test edildi.
4.  Bir kullanıcı silindiğinde `enrollments` tablosundaki kayıtlarının da uçtuğu (Cascade) görüldü.

---

**Devam et** dediğinde, projenin en "korkutucu" ama en gerekli kısmına geliyoruz. Milyonlarca satırlık veri yığınını yöneteceğimiz **Faz 14: İlerleme Takibi ve Partitioning Hazırlığı**. Burada standart tablolar yetersiz kalacak.