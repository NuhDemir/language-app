/**
 * Radius.ts
 * Kartlar, butonlar ve inputlar için köşe yuvarlaklık değerleri.
 * Claymorphism için genelde yüksek (round) değerler tercih edilir.
 */

export const Radius = {
  xs: 4,   // İç içe geçmiş çok küçük elemanlar
  s: 8,    // Küçük etiketler (Tags)
  m: 12,   // Standart Butonlar
  l: 16,   // Input alanları ve Küçük Kartlar
  xl: 24,  // Ana Kartlar (Clay Cards) - En çok bunu kullanacağız
  xxl: 32, // Modal ve BottomSheet köşeleri

  // Tam yuvarlak (Pill shape butonlar veya Avatarlar için)
  pill: 9999,
  circle: 9999,
} as const;
