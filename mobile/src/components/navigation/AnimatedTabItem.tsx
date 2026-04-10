import React, { useEffect, useRef } from "react";
import { StyleSheet, Pressable, Animated, View } from "react-native";

// Style imports
import { Palette } from "../../styles/theme";
import { Typography } from "../../styles/variables/typography";
import { Spacing } from "../../styles/variables/spacing";

interface AnimatedTabItemProps {
  label: string;
  icon: (color: string, isFocused: boolean) => React.ReactNode;
  isFocused: boolean;
  onPress: () => void;
  style?: object;
}

export const AnimatedTabItem: React.FC<AnimatedTabItemProps> = ({
  label,
  icon,
  isFocused,
  onPress,
  style,
}) => {
  // Animation values - using React Native's Animated API
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const colorAnim = useRef(new Animated.Value(isFocused ? 1 : 0)).current;

  // Update color animation when focus changes
  useEffect(() => {
    Animated.timing(colorAnim, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused]);

  // Handle press animation
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.85,
      friction: 5,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 80,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    // Bounce effect
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1.15,
        friction: 3,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();

    onPress();
  };

  // Interpolate color
  const textColor = colorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [Palette.textBlack, Palette.textBlack],
  });

  // Current color for icon
  const currentColor = Palette.textBlack;

  // Underline width animation
  const underlineWidth = colorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 24],
  });

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.container, style]}
    >
      <Animated.View
        style={[styles.iconContainer, { transform: [{ scale: scaleAnim }] }]}
      >
        {icon(currentColor, isFocused)}
      </Animated.View>
      <Animated.Text
        style={[
          styles.label,
          { color: textColor },
          isFocused && styles.labelActive,
        ]}
        numberOfLines={1}
      >
        {label}
      </Animated.Text>
      <Animated.View style={[styles.underline, { width: underlineWidth }]} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.xs,
    minWidth: 50,
  },
  iconContainer: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xs,
  },
  label: {
    fontFamily: Typography.family.medium,
    fontSize: Typography.size.captionTiny,
    textAlign: "center",
  },
  labelActive: {
    fontFamily: Typography.family.semiBold,
  },
  underline: {
    height: 2,
    backgroundColor: Palette.textBlack,
    borderRadius: 1,
    marginTop: 4,
  },
});

export default AnimatedTabItem;
