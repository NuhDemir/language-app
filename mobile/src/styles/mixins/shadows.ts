import { Platform } from 'react-native';

/**
 * Shadows.ts
 * Standart (Claymorphism olmayan) gölge setleri.
 * iOS ve Android (Elevation) uyumludur.
 */

export const Shadows = {
  // Hafif gölge (Kartlar için)
  small: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },

  // Orta gölge (Dropdown menüler, Floating Action Button için)
  medium: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
    }),
  },

  // Kart gölgesi (Modern kartlar için)
  card: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },

  // Yok (Gölgeyi sıfırlamak için)
  none: {
    shadowColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  }
};