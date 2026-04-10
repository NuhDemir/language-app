import { Palette } from './colors';
import { ThemeType } from './light'; // Tipi buradan alıyoruz

/**
 * Dark Theme
 * İleride implemente edilecek, şu an için yapısal placeholder.
 */
export const DarkTheme: ThemeType = {
  background: {
    app: Palette.offWhite,
    paper: Palette.white,
    modal: Palette.white,
  },
  text: {
    primary: Palette.slate900,
    secondary: Palette.slate600,
    disabled: Palette.slate400,
    inverse: Palette.white,
  },
  primary: {
    main: Palette.violetPrimary,
    light: Palette.violetLight,
    dark: Palette.violetDark,
    contrastText: Palette.white,
  },
  secondary: {
    main: Palette.teal,
    light: Palette.pastelCyan,
    dark: Palette.teal,
    contrastText: Palette.white,
  },
  success: {
    main: Palette.success,
    light: '#D1FAE5',
    dark: Palette.success,
  },
  error: {
    main: Palette.error,
    light: '#FEE2E2',
    dark: Palette.error,
  },
  clay: {
    cardBg: Palette.slate50,
    blueCard: Palette.pastelBlue,
    purpleCard: Palette.pastelPurple,
    cyanCard: Palette.pastelCyan,
    
    shadow: Palette.shadowDark,
    highlight: Palette.shadowLight,
  },
  border: {
    subtle: Palette.slate200,
    active: Palette.violetPrimary,
  },
  status: {
    success: Palette.success,
    error: Palette.error,
    warning: Palette.warning,
  }
};