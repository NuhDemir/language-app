import { Palette } from './colors';

/**
 * Light Theme
 * Uygulamanın varsayılan aydınlık görünümü.
 */
export const LightTheme = {
  // 1. GENEL ZEMİN
  background: {
    app: Palette.offWhite,       // Tüm ekranın arkası
    paper: Palette.white,        // Düz kartlar (Clay olmayanlar)
    modal: Palette.white,        // Alt menüler
  },

  // 2. METİN RENKLERİ (Typography ile birleşecek)
  text: {
    primary: Palette.slate900,   // Başlıklar (H1, H2, Bold)
    secondary: Palette.slate600, // Açıklamalar, alt başlıklar
    disabled: Palette.slate400,  // Pasif yazılar
    inverse: Palette.white,      // Koyu buton üzerindeki yazılar
  },

  // 3. AKSİYON / MARKA
  primary: {
    main: Palette.violetPrimary,
    light: Palette.violetLight, // Hover/Press
    dark: Palette.violetDark,
    contrastText: Palette.white,
  },

  // 3.1 İKİNCİL RENK
  secondary: {
    main: Palette.teal,
    light: Palette.pastelCyan,
    dark: Palette.teal,
    contrastText: Palette.white,
  },

  // 3.2 BAŞARI RENK
  success: {
    main: Palette.success,
    light: '#D1FAE5',
    dark: Palette.success,
  },

  // 3.3 HATA RENK
  error: {
    main: Palette.error,
    light: '#FEE2E2',
    dark: Palette.error,
  },

  // 4. CLAYMORPHISM ÖZEL (Clay.ts mixin'i burayı kullanacak)
  // Clay elemanların renkleri burada tanımlanır.
  clay: {
    cardBg: Palette.slate50,     // Standart Clay kart
    blueCard: Palette.pastelBlue,
    purpleCard: Palette.pastelPurple,
    cyanCard: Palette.pastelCyan,

    // Clay efektinin gölge ve ışık renkleri
    shadow: Palette.shadowDark,
    highlight: Palette.shadowLight,
  },

  // 5. KENARLIK VE AYIRAÇLAR
  border: {
    subtle: Palette.slate200,
    active: Palette.violetPrimary,
  },

  // 6. DURUMLAR
  status: {
    success: Palette.success,
    error: Palette.error,
    warning: Palette.warning,
  }
};

// Bu tipi Dark Theme'de de kullanacağız ki eşleşme tam olsun.
export type ThemeType = typeof LightTheme;