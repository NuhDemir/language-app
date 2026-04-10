/**
 * Theme/Colors.ts
 * Projenin "Ham" renk paleti.
 * Burada anlamsal isimlendirme (background, text vb.) yapılmaz.
 * Sadece renklerin hex kodları ve ton isimlendirmeleri bulunur.
 */

export const Palette = {
  black:"rgb(38, 38, 38)",
  // --- PASTEL TONES (Görselden) ---
  // Clay kartlar ve vurgular için
  pastelBlue: '#D2DEFE',
  pastelPurple: '#E8DAF4',
  pastelCyan: '#E7FDFF',
  pastelPink: '#FBD0D0', // Ekstra yumuşaklık için

  // --- BRAND / PRIMARY (Marka Renkleri) ---
  // Görseldeki "Unmount" butonları ve aktif state'ler
  violetPrimary: '#5872F4',
  violetLight: '#7B90F8',
  violetDark: '#4156B5',

  // --- NEUTRALS (Griler ve Zeminler) ---
  // Metinler ve UI iskeleti için
  white: '#FFFFFF',
  offWhite: '#F7F8FA', // App background için mükemmel, göz yormayan kırık beyaz
  slate50: '#F8FAFC',
  slate100: '#F1F5F9',
  slate200: '#E2E8F0', // Borderlar için
  slate300: '#CBD5E1',
  slate400: '#94A3B8', // Disabled text
  slate600: '#475569', // Secondary text
  slate800: '#1E293B', // Main text
  slate900: '#0F172A', // Başlıklar

  // --- UTILITY (Durumlar) ---
  success: '#38C172',
  error: '#EF4444',
  warning: '#F59E0B',

  // --- CLAY SPECIFIC ---
  shadowDark: '#A6ABBD',
  shadowLight: '#FFFFFF',

  // --- ACCENT / TEAL ---
  teal: '#2BB5A0',

  // --- TEXT COLORS ---
  textBlack: '#494949',

  // --- GRADIENT COLORS ---
  blackGradientStart: '#202020',
  blackGradientEnd: '#434343',

  // --- DARK MODE COLORS ---
  darkBackground: '#0c0e12',
  darkSurface: '#111318',
  darkSurfaceVariant: '#23262c',
  darkPrimary: '#97a9ff',
  darkPrimaryDim: '#3e65ff',
  darkSecondary: '#bf81ff',
  darkTertiary: '#a1faff',
  darkOutline: '#46484d',
  darkOutlineVariant: '#74757a',
  darkOnSurface: '#f6f6fc',
  darkOnSurfaceVariant: '#aaabb0',
} as const;
