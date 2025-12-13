# Faz 14 Teknik İncelemesi: Yüksek Hacimli İlerleme Takibi (Partitioning)

Bu doküman, milyarlarca satırı yönetmek için Range Partitioning stratejisini açıklar.

---

## 📚 Bölüm 1: Hacim Problemi

### 1.1 Neden Partitioning?

```
Günlük: 1M kullanıcı × 5 ders = 5M satır
Aylık: 150M satır
Yıllık: 1.8B satır
```

Tek tabloda:

- Indeksler şişer
- `VACUUM` sistemi kilitler
- Query planner yavaşlar

### 1.2 Çözüm: Range Partitioning

```
lesson_completions (Parent - Boş)
├── lesson_completions_2024_01 (Ocak verileri)
├── lesson_completions_2024_02 (Şubat verileri)
└── lesson_completions_2024_03 (Mart verileri)
```

Her partition bağımsız:

- Kendi indeksleri
- Kendi VACUUM'u
- Paralel sorgu

---

## 📚 Bölüm 2: Partition Key

### 2.1 Neden completed_at?

| Adaylar          | Avantaj                       | Dezavantaj             |
| ---------------- | ----------------------------- | ---------------------- |
| user_id          | Kullanıcı başına hızlı        | Dengesiz dağılım       |
| **completed_at** | Eşit dağılım, arşivleme kolay | Tarih filtresi gerekir |

### 2.2 PK Zorunluluğu

```sql
-- ❌ Hata: Partition key PK'de olmalı
PRIMARY KEY (id)

-- ✅ Doğru:
PRIMARY KEY (user_id, completed_at, id)
```

PostgreSQL kuralı: Partition key PK/Unique içinde olmalı.

---

## 📚 Bölüm 3: Prisma Engeli

Prisma'da `PARTITION BY` yok.

**Strateji:**

1. Prisma'da normal model tanımla
2. `--create-only` ile migration oluştur
3. SQL'i manuel değiştir
4. Migration'ı uygula

---

## 📚 Bölüm 4: Dikkat

> ⚠️ **UYARI:** Bu fazda partition oluşturulmadı!
> Tabloya INSERT yaparsan `no partition of relation found` hatası alırsın.
> Partition'lar Faz 15'te eklenecek.

---

**Bu doküman, Phase 14 partitioning stratejisini açıklar.**
