import React from "react";
import { Text, TextProps, StyleSheet, TextStyle } from "react-native";
import { Typography as TypographyStyles, Theme } from "../../styles";

type VariantType =
  | "display"
  | "h1"
  | "h2"
  | "h3"
  | "bodyLarge"
  | "bodyMedium"
  | "captionSmall"
  | "captionTiny";
type ColorType =
  | "primary"
  | "secondary"
  | "disabled"
  | "inverse"
  | "error"
  | "success";
type WeightType =
  | "regular"
  | "medium"
  | "semiBold"
  | "bold"
  | "extraBold"
  | "black";

interface TypographyProps extends TextProps {
  variant?: VariantType;
  color?: ColorType;
  weight?: WeightType;
  align?: "left" | "center" | "right";
}

export const Typography: React.FC<TypographyProps> = ({
  children,
  variant = "bodyMedium",
  color = "primary",
  weight,
  align,
  style,
  ...props
}) => {
  // Font ailesi belirleme (weight prop veya variant'a göre varsayılan)
  const getFontFamily = (): string => {
    if (weight) {
      return TypographyStyles.family[weight];
    }
    // Variant'a göre varsayılan ağırlık
    switch (variant) {
      case "display":
      case "h1":
        return TypographyStyles.family.bold;
      case "h2":
        return TypographyStyles.family.semiBold;
      case "h3":
        return TypographyStyles.family.medium;
      default:
        return TypographyStyles.family.regular;
    }
  };

  // Renk belirleme
  const getColor = (): string => {
    switch (color) {
      case "primary":
        return Theme.text.primary;
      case "secondary":
        return Theme.text.secondary;
      case "disabled":
        return Theme.text.disabled;
      case "inverse":
        return Theme.text.inverse;
      case "error":
        return Theme.status.error;
      case "success":
        return Theme.status.success;
      default:
        return Theme.text.primary;
    }
  };

  const textStyle: TextStyle = {
    fontFamily: getFontFamily(),
    fontSize: TypographyStyles.size[variant] as number,
    lineHeight: TypographyStyles.lineHeight[variant],
    color: getColor(),
    textAlign: align,
    includeFontPadding: false,
  };

  return (
    <Text style={[textStyle, style]} {...props}>
      {children}
    </Text>
  );
};
