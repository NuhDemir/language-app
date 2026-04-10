import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  TouchableOpacityProps,
  ActivityIndicator,
} from "react-native";
import { Theme, Typography, Spacing, Radius, Shadows } from "../../styles";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "small" | "medium" | "large";

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
}

/**
 * Button bileşeni
 * Farklı varyant ve boyutlarda buton render eder.
 *
 * @example
 * <Button title="Devam Et" variant="primary" />
 * <Button title="İptal" variant="outline" size="small" />
 */
export const Button: React.FC<ButtonProps> = ({
  title,
  variant = "primary",
  size = "medium",
  loading = false,
  fullWidth = false,
  disabled,
  style,
  ...props
}) => {
  const getBackgroundColor = () => {
    if (disabled) return Theme.text.disabled;
    switch (variant) {
      case "primary":
        return Theme.primary.main;
      case "secondary":
        return Theme.background.app;
      case "outline":
      case "ghost":
        return "transparent";
      default:
        return Theme.primary.main;
    }
  };

  const getTextColor = () => {
    if (disabled) return Theme.text.inverse;
    switch (variant) {
      case "primary":
        return Theme.text.inverse;
      case "secondary":
        return Theme.text.primary;
      case "outline":
      case "ghost":
        return Theme.primary.main;
      default:
        return Theme.text.inverse;
    }
  };

  const getBorderStyle = () => {
    if (variant === "outline") {
      return {
        borderWidth: 1,
        borderColor: disabled ? Theme.text.disabled : Theme.primary.main,
      };
    }
    return {};
  };

  const getSizeStyle = () => {
    switch (size) {
      case "small":
        return {
          paddingVertical: Spacing.s,
          paddingHorizontal: Spacing.l,
          fontSize: Typography.size.button.s,
        };
      case "large":
        return {
          paddingVertical: Spacing.l,
          paddingHorizontal: Spacing.xxl,
          fontSize: Typography.size.button.l,
        };
      default:
        return {
          paddingVertical: Spacing.m,
          paddingHorizontal: Spacing.xl,
          fontSize: Typography.size.button.m,
        };
    }
  };

  const sizeStyle = getSizeStyle();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={disabled || loading}
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          paddingVertical: sizeStyle.paddingVertical,
          paddingHorizontal: sizeStyle.paddingHorizontal,
        },
        getBorderStyle(),
        variant === "primary" && !disabled && Shadows.small,
        fullWidth && styles.fullWidth,
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text
          style={[
            styles.text,
            {
              color: getTextColor(),
              fontSize: sizeStyle.fontSize,
            },
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: Radius.m,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontFamily: Typography.family.semiBold,
    textAlign: "center",
  },
  fullWidth: {
    width: "100%",
  },
});

export default Button;
