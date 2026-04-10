// src/features/lesson/components/HeartsDisplay.tsx
// Hearts/Lives display component

import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Heart } from 'lucide-react-native';

import { COLORS, SPACING } from '../../../constants/theme';

interface HeartsDisplayProps {
  hearts: number;
  maxHearts?: number;
}

const HeartsDisplayComponent: React.FC<HeartsDisplayProps> = ({
  hearts,
  maxHearts = 3,
}) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: maxHearts }).map((_, index) => (
        <Heart
          key={index}
          size={24}
          color={index < hearts ? COLORS.error.main : COLORS.neutral.border}
          fill={index < hearts ? COLORS.error.main : 'transparent'}
          style={styles.heart}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heart: {
    marginLeft: 2,
  },
});

export const HeartsDisplay = memo(HeartsDisplayComponent);
