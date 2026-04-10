import { StyleSheet } from 'react-native';
import { Theme } from '../theme'; 
import { Typography } from '../variables/typography';

/**
 * Reset.ts
 * Platform farklarını kapatan ve varsayılan font ayarlarını yapan dosya.
 * Figtree fontu yüklendikten sonra burası varsayılan olarak devreye girer.
 */

export const Reset = StyleSheet.create({
  // 1. GLOBAL TEXT RESET
  // Bu stil her <Text> bileşenine verilmelidir.
  text: {
    // Varsayılan olarak 'Figtree-Regular' kullanılır
    fontFamily: Typography.family.regular, 
    fontSize: Typography.size.bodyMedium, // 14px
    lineHeight: Typography.lineHeight.bodyMedium, // 22px
    color: Theme.text.primary,
    
    // Android dikey hizalama düzeltmesi
    includeFontPadding: false,
    textAlignVertical: 'center',
    
    backgroundColor: 'transparent',
  },

  // 2. INPUT RESET
  input: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.bodyMedium,
    color: Theme.text.primary,
    padding: 0,
    margin: 0,
    includeFontPadding: false,
  },

  // 3. BUTTON LABEL BASE
  // Butonlar genelde biraz daha kalın olur (Medium veya SemiBold)
  buttonText: {
    fontFamily: Typography.family.medium, 
    fontSize: Typography.size.button.m,
    color: Theme.text.inverse,
    textAlign: 'center',
    includeFontPadding: false,
  }
});