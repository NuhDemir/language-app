import React from "react";
import { View, ViewProps } from "react-native";
import { Spacing } from "../../styles";

type SpacerSize = "xs" | "s" | "m" | "l" | "xl" | "xxl";

interface SpacerProps extends ViewProps {
  size?: SpacerSize;
  horizontal?: boolean;
}

/**
 * Spacer bileşeni
 * Elemanlar arasına standart boşluk ekler.
 *
 * @example
 * <Spacer size="m" />           // Dikey 12px boşluk
 * <Spacer size="l" horizontal /> // Yatay 16px boşluk
 */
export const Spacer: React.FC<SpacerProps> = ({
  size = "m",
  horizontal = false,
  style,
  ...props
}) => {
  const spaceValue = Spacing[size];

  return (
    <View
      style={[
        horizontal ? { width: spaceValue } : { height: spaceValue },
        style,
      ]}
      {...props}
    />
  );
};

export default Spacer;
