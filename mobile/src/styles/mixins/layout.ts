import { StyleSheet } from 'react-native';
import { Theme } from '../theme';
import { Spacing } from '../variables/spacing';

/**
 * Mixins/Layout.ts
 * Proje genelinde tekrar eden Flexbox yapıları, Hizalamalar ve Container'lar.
 * Componentlere spread (...) operatörü ile karıştırılarak kullanılır.
 */

export const Layout = StyleSheet.create({
  // --- 1. FLEXBOX UTILITIES (Yerleşim Araçları) ---

  // Yatay Dizilim (flex-row) - İçerikleri dikeyde ortalar
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // İki uca yaslanmış Row (Örn: Başlık --- Kapat İkonu)
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  // İçeriği hem yatay hem dikey tam ortala
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  // İçeriği ortalanmış Row
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Flex Wrap (Sığmazsa aşağı atla)
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  // Dikey Dizilim (Default ama explicit belirtmek için)
  col: {
    flexDirection: 'column',
  },

  // Dikeyde ortalanmış kolon
  colCenter: {
    flexDirection: 'column',
    alignItems: 'center',
  },

  // Boş alanı doldur (flex-grow: 1)
  flex1: {
    flex: 1,
  },

  // --- 2. SCREEN & CONTAINER (Sayfa İskeletleri) ---

  // Standart Tam Ekran Yapısı
  screen: {
    flex: 1,
    backgroundColor: Theme.background.app, // #F7F8FA
  },

  // Kenarlardan güvenli boşluk bırakılmış container
  container: {
    flex: 1,
    paddingHorizontal: Spacing.screen.paddingHorizontal, // 24px
  },

  // Klavye açılınca veya scroll edilebilir alanlar için
  scrollContent: {
    paddingHorizontal: Spacing.screen.paddingHorizontal,
    paddingBottom: Spacing.layout.bottomTabHeight + 20,
    flexGrow: 1,
  },

  // --- 3. POSITIONING (Konumlandırma) ---

  // Bir alanı tamamen kaplayan overlay (Modal arkası vb.)
  absoluteFill: {
    ...StyleSheet.absoluteFillObject, // top:0, left:0, bottom:0, right:0
    zIndex: 1,
  },

  // --- 4. DEBUGGING ---

  // Tasarım yaparken sınırları görmek için kırmızı çerçeve
  debug: {
    borderWidth: 1,
    borderColor: 'red',
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
  }
});