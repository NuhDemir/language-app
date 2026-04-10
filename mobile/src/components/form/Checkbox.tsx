import React from "react";
import {
  TouchableOpacity,
  View,
  StyleSheet,
  TouchableOpacityProps,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Theme, Radius, Spacing } from "../../styles";
import { Typography } from "../ui/Typography";

interface CheckboxProps extends Omit<TouchableOpacityProps, "onPress"> {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  size?: number;
}

/**
 * Checkbox bileşeni
 * Seçim kutusu render eder.
 *
 * @example
 * <Checkbox
 *   checked={isSelected}
 *   onChange={setIsSelected}
 *   label="Kabul ediyorum"
 * />
 */
export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  label,
  size = 24,
  disabled,
  style,
  ...props
}) => {
  const handlePress = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handlePress}
      disabled={disabled}
      style={[styles.container, style]}
      {...props}
    >
      <View
        style={[
          styles.checkbox,
          {
            width: size,
            height: size,
            borderRadius: Radius.xs,
            backgroundColor: checked ? Theme.primary.main : "transparent",
            borderColor: checked ? Theme.primary.main : Theme.border.subtle,
          },
          disabled && styles.disabled,
        ]}
      >
        {checked && (
          <Ionicons
            name="checkmark"
            size={size - 6}
            color={Theme.text.inverse}
          />
        )}
      </View>
      {label && (
        <Typography
          variant="bodyMedium"
          color={disabled ? "disabled" : "primary"}
          style={styles.label}
        >
          {label}
        </Typography>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    marginLeft: Spacing.s,
  },
});

export default Checkbox;
