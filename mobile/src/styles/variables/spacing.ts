/**
 * Spacing.ts
 * Projedeki tüm boşluk (margin, padding, gap) değerlerinin tek kaynağıdır.
 * 4px'lik grid sistemi temel alınmıştır.
 */

const base = 4;

export const Spacing = {
  // 1. TEMEL DEĞERLER (Doğrudan sayı olarak erişim)
  // Örn: margin: Spacing.s16
  px: 1,
  0: 0,
  4: base * 1, // xs
  8: base * 2, // s
  12: base * 3, // m
  16: base * 4, // l  (Standart paragraf arası)
  20: base * 5, // xl
  24: base * 6, // 2xl (Panel kenar boşluğu)
  32: base * 8, // 3xl (Section arası)
  40: base * 10, // 4xl
  48: base * 12,
  64: base * 16, // Büyük section boşluğu
  80: base * 20,

  // 2. SEMANTİK ALIASLAR (Anlamsal İsimlendirme)
  // Geliştiricilerin nerede ne kullanacağını standartlaştırır.
  xs: base * 1, // 4px  - İkon ve metin arası
  s: base * 2, // 8px  - Küçük elemanlar arası
  m: base * 3, // 12px - Liste elemanları arası
  l: base * 4, // 16px - Kart içi padding
  xl: base * 6, // 24px - Ekran kenar boşluğu (Horizontal Padding)
  xxl: base * 8, // 32px - Başlık ve içerik arası

  // 3. EKRAN DÜZENİ (Layout Specific)
  // Ekranların kenar boşluklarını buradan yönetiriz.
  screen: {
    paddingHorizontal: 24, // Ferah bir görünüm için 24px ideal
    paddingVertical: 20,
  },

  // 4. HEADER / TABBAR YÜKSEKLİKLERİ
  layout: {
    headerHeight: 60,
    bottomTabHeight: 80,
    hitSlop: 10, // Tıklanabilir alan genişletme
  },
} as const;

export type SpacingType = keyof typeof Spacing;
