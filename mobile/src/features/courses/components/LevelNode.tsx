// src/features/courses/components/LevelNode.tsx
// Gamified level node with 3D effect based on status

import React, { memo } from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Crown, Lock, Star, Play } from 'lucide-react-native';
import { COLORS, RADIUS, SPACING } from '../../../constants/theme';
import { AppText } from '../../../components/ui';
import { NodeStatus, NodePosition } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const NODE_SIZE = 64;
const CONTENT_PADDING = 24;

// Calculate horizontal offset based on position
const getHorizontalOffset = (position: NodePosition): number => {
  const availableWidth = SCREEN_WIDTH - CONTENT_PADDING * 2 - NODE_SIZE;

  switch (position) {
    case 'left':
      return 0;
    case 'center':
      return availableWidth / 2;
    case 'right':
      return availableWidth;
    default:
      return availableWidth / 2;
  }
};

interface LevelNodeProps {
  id: string;
  orderIndex: number;
  status: NodeStatus;
  position: NodePosition;
  totalLessons: number;
  onPress: (id: string) => void;
}

const LevelNodeComponent: React.FC<LevelNodeProps> = ({
  id,
  orderIndex,
  status,
  position,
  totalLessons,
  onPress,
}) => {
  const horizontalOffset = getHorizontalOffset(position);

  const getNodeColors = () => {
    switch (status) {
      case 'completed':
        return {
          bg: COLORS.gold.main,
          shadow: COLORS.gold.shadow,
          icon: '#FFFFFF',
        };
      case 'active':
        return {
          bg: COLORS.primary.main,
          shadow: COLORS.primary.shadow,
          icon: '#FFFFFF',
        };
      case 'locked':
      default:
        return {
          bg: COLORS.neutral.locked,
          shadow: COLORS.neutral.lockedShadow,
          icon: '#FFFFFF',
        };
    }
  };

  const colors = getNodeColors();

  const renderIcon = () => {
    const iconSize = 28;

    switch (status) {
      case 'completed':
        return <Crown size={iconSize} color={colors.icon} />;
      case 'active':
        return <Play size={iconSize} color={colors.icon} fill={colors.icon} />;
      case 'locked':
      default:
        return <Lock size={iconSize} color={colors.icon} />;
    }
  };

  const handlePress = () => {
    if (status === 'locked') {
      // Show toast or vibrate - handled in parent
    }
    onPress(id);
  };

  return (
    <View style={[styles.container, { marginLeft: horizontalOffset }]}>
      {/* 3D Shadow Layer */}
      <View style={[styles.shadowLayer, { backgroundColor: colors.shadow }]} />

      {/* Main Node */}
      <TouchableOpacity
        style={[styles.node, { backgroundColor: colors.bg }]}
        onPress={handlePress}
        activeOpacity={status === 'locked' ? 0.9 : 0.7}
        disabled={status === 'locked'}
      >
        {renderIcon()}
      </TouchableOpacity>

      {/* Level Label */}
      <View style={styles.labelContainer}>
        <AppText style={[
          styles.labelText,
          status === 'active' && styles.labelActive,
          status === 'completed' && styles.labelCompleted,
        ]}>
          {orderIndex}
        </AppText>
      </View>

      {/* Active Indicator (Pulse Effect) */}
      {status === 'active' && (
        <View style={styles.pulseRing} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: NODE_SIZE,
    height: NODE_SIZE + 24,
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  shadowLayer: {
    position: 'absolute',
    top: 4,
    left: 0,
    width: NODE_SIZE,
    height: NODE_SIZE,
    borderRadius: RADIUS.full,
  },
  node: {
    width: NODE_SIZE,
    height: NODE_SIZE,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  labelContainer: {
    marginTop: 8,
  },
  labelText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.neutral.body,
  },
  labelActive: {
    color: COLORS.primary.main,
    fontWeight: '700',
  },
  labelCompleted: {
    color: COLORS.gold.text,
    fontWeight: '700',
  },
  pulseRing: {
    position: 'absolute',
    top: -4,
    left: -4,
    width: NODE_SIZE + 8,
    height: NODE_SIZE + 8,
    borderRadius: RADIUS.full,
    borderWidth: 3,
    borderColor: COLORS.primary.light,
    opacity: 0.6,
  },
});

// Memoize to prevent unnecessary re-renders in FlatList
export const LevelNode = memo(LevelNodeComponent);
