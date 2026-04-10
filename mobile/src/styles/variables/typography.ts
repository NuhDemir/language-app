/**
 * Typography.ts
 * Projedeki tüm font ailesi, boyutlandırma, satır yükseklikleri ve ağırlıklarını yönetir.
 * Font Ailesi: Figtree
 */


export const Typography = {
  // 1. FONT AİLESİ (Expo'da yüklediğimiz isimlerin aynısı olmalı)
  family: {
    regular: 'Figtree-Regular',     // 400
    medium: 'Figtree-Medium',       // 500
    semiBold: 'Figtree-SemiBold',   // 600
    bold: 'Figtree-Bold',           // 700
    extraBold: 'Figtree-ExtraBold', // 800 
    black: 'Figtree-Black',         // 900 
  },

  // 2. FONT BOYUTLARI (FONT SIZE)
  size: {
    display: 32,       // Çok büyük manşetler
    h1: 24,            // Ekran başlıkları
    h2: 20,            // Alt başlıklar
    h3: 18,            // Kart başlıkları
    
    bodyLarge: 16,     // Okunabilir metin
    bodyMedium: 14,    // Varsayılan metin
    bodySmall: 12,     // Yardımcı metinler
    captionSmall: 12,  // Alt bilgiler
    captionTiny: 10,   // Çok küçük etiketler

    // Buton Özel Boyutları
    button: {
      xl: 20, // Xlarge Button
      l: 18,  // Large Button
      m: 16,  // Medium Button (Standart)
      s: 14,  // Small Button
    }
  },

  // 3. SATIR YÜKSEKLİKLERİ (LINE HEIGHT)
  // Okunabilirlik için font boyutundan genelde %20-40 daha büyük olur
  lineHeight: {
    display: 40,
    h1: 32,
    h2: 28,
    h3: 26,
    
    bodyLarge: 24,
    bodyMedium: 22,
    bodySmall: 18,

    captionSmall: 18,
    captionTiny: 14,
  },
};

// Typescript Tip Tanımlamaları
export type FontFamily = keyof typeof Typography.family;
export type FontSize = keyof typeof Typography.size;
//-------------------------------------------------------------------------
//-------------------------- NASIL UYGULANIR? -----------------------------
//-------------------------------------------------------------------------

/*
  1. BAŞLIK (HEADING) KULLANIMI:
  Hem font ailesini hem de boyutu Typography'den çekiyoruz.
  
  style={{
    fontFamily: Typography.family.bold,
    fontSize: Typography.size.h1,
    lineHeight: Typography.lineHeight.h1,
    color: '#000'
  }}

  2. GÖVDE METNİ (BODY) KULLANIMI:
  Standart metinler için regular font ve body boyutları.
  
  style={{
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.bodyLarge,
    lineHeight: Typography.lineHeight.bodyLarge
  }}

  3. BUTON METNİ (BUTTON) KULLANIMI:
  Buton boyutları "size.button" objesinin altında özelleşmiştir.
  
  style={{
    fontFamily: Typography.family.semiBold,
    fontSize: Typography.size.button.xl, // 23px
    color: '#FFFFFF'
  }}

  4. CAPTION / KÜÇÜK YAZI KULLANIMI:
  
  style={{
    fontFamily: Typography.family.medium,
    fontSize: Typography.size.captionSmall, // 12px
    color: '#888'
  }}
*/