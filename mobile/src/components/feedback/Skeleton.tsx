import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet, ViewProps, Easing } from "react-native";
import { Theme, Radius } from "../../styles";

interface SkeletonProps extends ViewProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  animated?: boolean;
}

/**
 * Skeleton bileşeni
 * İçerik yüklenirken placeholder gösterir.
 *
 * @example
 * <Skeleton width={200} height={20} />              // Metin placeholder
 * <Skeleton width={100} height={100} borderRadius={50} /> // Avatar placeholder
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  width = "100%",
  height = 16,
  borderRadius = Radius.s,
  animated = true,
  style,
  ...props
}) => {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (animated) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.3,
            duration: 800,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
        ]),
      );
      animation.start();
      return () => animation.stop();
    }
  }, [animated, pulseAnim]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity: animated ? pulseAnim : 0.5,
        } as any,
        style,
      ]}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: Theme.border.subtle,
  },
});

export default Skeleton;
