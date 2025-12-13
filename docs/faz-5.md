

İşte **Faz 5** için Senior Developer Prompt'u:

---

# Phase 5: JSONB Profile Settings Strategy

**Durum:** Kullanıcı tablosundaki `settings` sütununun iç yapısının netleştirilmesi.
**Hedef:** İlişkisel veritabanı içinde NoSQL esnekliği sağlarken, verinin "çöplüğe" (Garbage Data) dönüşmesini engelleyecek varsayılan değerleri ve veri tiplerini sabitlemek.

### 📋 Mimari Prensipler (PDF Referansı: Sayfa 2 ve 3)
1.  **Hibrit Yapı:** Ayarlar (Settings) gibi sürekli değişen ve yeni özellikler eklenen alanlar için `ALTER TABLE` maliyetine girmemek adına `JSONB` kullanılmalıdır.
2.  **Varsayılan Değer Garantisi:** Bu sütun asla `NULL` olmamalıdır. Uygulama tarafında "undefined" hataları almamak için veritabanı seviyesinde geçerli bir JSON objesi varsayılan olarak atanmalıdır.
3.  **Veri Tipi:** Performans ve indeksleme (GIN Index) için `JSON` değil, binary format olan `JSONB` zorunludur.

### 🛠 Prisma Schema Task

Aşağıdaki güncellemeyi `User` modeline uygula veya doğrula. Özellikle `@default` değerinin bir **String** içinde **escaped JSON** formatında olduğuna dikkat et.

```prisma
// --------------------------------------------------------
// MEVCUT MODEL: USER (Güncelleme)
// Hedef: settings sütununun varsayılan değerini sabitlemek.
// --------------------------------------------------------

model User {
  // ... diğer alanlar (id, username vb.)

  // JSONB Config
  // 1. Veri Tipi: Json (Prisma tarafı), JSONB (Postgres tarafı)
  // 2. Varsayılan Değer: Uygulama mantığına uygun başlangıç ayarları.
  //    - daily_goal: 50 (Günlük XP hedefi)
  //    - sound_effects: true (Sesler açık)
  //    - notifications: true (Bildirimler açık)
  settings Json @default("{\"daily_goal\": 50, \"sound_effects\": true, \"notifications\": true}")

  // Not: Prisma schema dosyasında JSON içeriğini validate edemezsin.
  // Ancak @default değeri DB seviyesinde garantidir.
  
  // ... diğer alanlar
}
```

### ✅ Definition of Done
1.  Migration dosyası (`migration.sql`) kontrol edildiğinde `settings JSONB NOT NULL DEFAULT '{"daily_goal": 50...}'` satırı görüldü.
2.  Veritabanına yeni bir kullanıcı eklendiğinde, `settings` sütununun boş gelmediği, varsayılan JSON objesini içerdiği doğrulandı.

---

**Devam et** dediğinde, **Faz 6** (Kurs İskeleti) zaten yapıldığı için doğrudan **Faz 7** (Hiyerarşik Yapı) veya eğer onu da verdiğimi düşünüyorsan **Faz 8** (Egzersizler) ile devam edebiliriz. Hangi fazda kaldığımızı teyit ederek ilerleyelim:

*   Faz 6 (Courses) -> **Verildi.**
*   Faz 7 (Units & Levels) -> **Verildi.** (Son mesajımda vermiştim).

Sıradaki adım: **Faz 8: Hibrit Egzersiz Modeli**. Hazır mısın?