// src/features/courses/components/UnitHeader.tsx
// Unit section header with brand colored background

import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { BookOpen } from 'lucide-react-native';
import { COLORS, RADIUS, SPACING, FONT_SIZES } from '../../../constants/theme';
import { AppText } from '../../../components/ui';

interface UnitHeaderProps {
  title: string;
  orderIndex: number;
  levelCount: number;
}

const UnitHeaderComponent: React.FC<UnitHeaderProps> = ({
  title,
  orderIndex,
  levelCount,
}) => {
  return (
    <View style={styles.container}>
      {/* Icon */}
      <View style={styles.iconContainer}>
        <BookOpen size={24} color={COLORS.primary.text} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <AppText style={styles.unitLabel}>Ünite {orderIndex}</AppText>
        <AppText style={styles.title}>{title}</AppText>
        <AppText style={styles.subtitle}>{levelCount} seviye</AppText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary.light,
    borderRadius: RADIUS.lg,
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.md,
    padding: SPACING.lg,
    alignItems: 'center',
    shadowColor: COLORS.primary.main,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.neutral.bg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  content: {
    flex: 1,
  },
  unitLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary.main,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.primary.text,
    fontWeight: '700',
    marginTop: 2,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.neutral.body,
    marginTop: 2,
  },
});

export const UnitHeader = memo(UnitHeaderComponent);
