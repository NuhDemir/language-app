/**
 * Styles/index.ts
 * Tüm stil modüllerinin merkezi export noktası.
 * Bileşenler buradan import yaparak tek kaynaktan erişir.
 */

// Theme (Renkler ve Anlamsal Tema)
export { Theme, Palette, LightTheme, DarkTheme, Y2K, Y2KPalette } from './theme';
export type { ThemeColors } from './theme';

// Variables (Değişkenler)
export { Spacing } from './variables/spacing';
export { Typography } from './variables/typography';
export { Radius } from './variables/radius';
export { Animations } from './variables/animations';
export { Breakpoints, getDeviceType, isTablet, isPhone, responsive } from './variables/breakpoints';
export type { DeviceType } from './variables/breakpoints';

// Mixins (Yeniden kullanılabilir stil parçaları)
export { Layout } from './mixins/layout';
export { Shadows } from './mixins/shadows';
export * from './mixins/skeuomorphic';

// Tokens (Design Tokens)
export { StoryTokens } from './tokens/story';
export { CharacterTokens, getPoseCategory } from './tokens/character';

// Base (Temel resetler)
export { Reset } from './base/reset';
