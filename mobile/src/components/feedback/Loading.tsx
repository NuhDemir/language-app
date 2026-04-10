import React from "react";
import { View, ActivityIndicator, StyleSheet, ViewProps } from "react-native";
import { Theme, Layout } from "../../styles";

interface LoadingProps extends ViewProps {
  size?: "small" | "large";
  color?: string;
  fullScreen?: boolean;
}

/**
 * Loading bileşeni
 * Yüklenme durumunu gösterir.
 *
 * @example
 * <Loading />                          // Varsayılan
 * <Loading fullScreen />              // Tam ekran
 * <Loading size="small" color="red" /> // Özelleştirilmiş
 */
export const Loading: React.FC<LoadingProps> = ({
  size = "large",
  color,
  fullScreen = false,
  style,
  ...props
}) => {
  const indicatorColor = color || Theme.primary.main;

  return (
    <View
      style={[styles.container, fullScreen && styles.fullScreen, style]}
      {...props}
    >
      <ActivityIndicator size={size} color={indicatorColor} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  fullScreen: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Theme.background.app,
  },
});

export default Loading;
