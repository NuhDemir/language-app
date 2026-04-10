// src/features/courses/components/CourseMapHeader.tsx
// Course Map screen header with back button and menu
// SOLID Principles Applied:
// - Single Responsibility: Only handles header UI and user interactions
// - Open/Closed: Easy to extend with new actions without modifying existing code
// - Dependency Inversion: Depends on callback abstractions, not concrete implementations

import React, { memo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import { ArrowLeft, MoreVertical } from 'lucide-react-native';

import { Theme, Typography, Spacing, Radius, Shadows } from '../../../styles';
import { AppText, Logo } from '../../../components/ui';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isTablet = SCREEN_WIDTH >= 768;

// ============================================================================
// TYPES
// ============================================================================

interface CourseMapHeaderProps {
  title?: string;
  showLogo?: boolean;
  onBackPress?: () => void;
  onMenuPress?: () => void;
}

// ============================================================================
// SUB-COMPONENTS (Single Responsibility)
// ============================================================================

interface IconButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  accessibilityLabel: string;
}

const IconButton: React.FC<IconButtonProps> = memo(({ onPress, children, accessibilityLabel }) => (
  <TouchableOpacity
    style={styles.iconButton}
    onPress={onPress}
    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    accessibilityRole="button"
    accessibilityLabel={accessibilityLabel}
    activeOpacity={0.7}
  >
    {children}
  </TouchableOpacity>
));

IconButton.displayName = 'IconButton';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const CourseMapHeaderComponent: React.FC<CourseMapHeaderProps> = ({
  title = 'Course Map',
  showLogo = false,
  onBackPress,
  onMenuPress,
}) => {
  const handleBack = useCallback(() => {
    onBackPress?.();
  }, [onBackPress]);

  const handleMenu = useCallback(() => {
    onMenuPress?.();
  }, [onMenuPress]);

  const iconSize = isTablet ? 28 : 24;
  const iconColor = Theme.text.primary;

  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={Theme.background.app}
        translucent={Platform.OS === 'android'}
      />
      <View style={styles.container}>
        {/* Back Button */}
        {onBackPress && (
          <IconButton onPress={handleBack} accessibilityLabel="Go back">
            <ArrowLeft size={iconSize} color={iconColor} strokeWidth={2.5} />
          </IconButton>
        )}

        {/* Title or Logo */}
        <View style={styles.centerContent}>
          {showLogo ? (
            <Logo size="small" style={styles.logo} />
          ) : (
            <AppText style={styles.title} numberOfLines={1}>
              {title}
            </AppText>
          )}
        </View>

        {/* Menu Button */}
        {onMenuPress ? (
          <IconButton onPress={handleMenu} accessibilityLabel="Open menu">
            <MoreVertical size={iconSize} color={iconColor} strokeWidth={2.5} />
          </IconButton>
        ) : (
          <View style={styles.iconButton} />
        )}
      </View>
    </>
  );
};

// ============================================================================
// STYLES (Design System Integration)
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: isTablet ? Spacing.xl : Spacing.l,
    paddingVertical: isTablet ? Spacing.l : Spacing.m,
    backgroundColor: Theme.background.app,
    borderBottomWidth: 1,
    borderBottomColor: Theme.border.subtle,
    ...Platform.select({
      ios: {
        shadowColor: Theme.clay.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  iconButton: {
    width: isTablet ? 48 : 44,
    height: isTablet ? 48 : 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Radius.m,
    backgroundColor: 'transparent',
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: Spacing.m,
  },
  title: {
    fontFamily: Typography.family.bold,
    fontSize: isTablet ? Typography.size.h2 : Typography.size.h3,
    color: Theme.text.primary,
    textAlign: 'center',
  },
  logo: {
    width: isTablet ? 50 : 45,
    height: isTablet ? 50 : 45,
  },
});

// ============================================================================
// EXPORT (Memoized for Performance)
// ============================================================================

export const CourseMapHeader = memo(CourseMapHeaderComponent);
