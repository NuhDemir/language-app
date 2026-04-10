// src/features/courses/components/PathConnector.tsx
// SVG curved path connector between level nodes

import React, { memo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { COLORS, SPACING } from '../../../constants/theme';
import { NodePosition, NodeStatus } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const NODE_SIZE = 64;
const CONTENT_PADDING = 24;
const PATH_HEIGHT = 40;

// Calculate X position for a node
const getXPosition = (position: NodePosition): number => {
  const availableWidth = SCREEN_WIDTH - CONTENT_PADDING * 2 - NODE_SIZE;
  const nodeCenter = NODE_SIZE / 2;
  
  switch (position) {
    case 'left':
      return CONTENT_PADDING + nodeCenter;
    case 'center':
      return CONTENT_PADDING + availableWidth / 2 + nodeCenter;
    case 'right':
      return CONTENT_PADDING + availableWidth + nodeCenter;
    default:
      return SCREEN_WIDTH / 2;
  }
};

interface PathConnectorProps {
  fromPosition: NodePosition;
  toPosition: NodePosition;
  status: NodeStatus;
}

const PathConnectorComponent: React.FC<PathConnectorProps> = ({
  fromPosition,
  toPosition,
  status,
}) => {
  const fromX = getXPosition(fromPosition);
  const toX = getXPosition(toPosition);
  
  // Quadratic bezier curve control point
  const controlX = (fromX + toX) / 2;
  const controlY = PATH_HEIGHT / 2;

  // Create smooth curve path
  const pathData = `
    M ${fromX} 0
    Q ${controlX} ${controlY} ${toX} ${PATH_HEIGHT}
  `;

  const getStrokeColor = () => {
    switch (status) {
      case 'completed':
        return COLORS.gold.main;
      case 'active':
        return COLORS.primary.main;
      case 'locked':
      default:
        return COLORS.neutral.border;
    }
  };

  return (
    <View style={styles.container}>
      <Svg width={SCREEN_WIDTH} height={PATH_HEIGHT}>
        <Path
          d={pathData}
          stroke={getStrokeColor()}
          strokeWidth={4}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={status === 'locked' ? '8,8' : undefined}
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: PATH_HEIGHT,
    marginVertical: -SPACING.sm,
  },
});

export const PathConnector = memo(PathConnectorComponent);
