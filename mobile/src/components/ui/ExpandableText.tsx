/**
 * ExpandableText · components/ui
 *
 * Karakter sınırı ile kırpılmış metin gösterir.
 * "Devamını oku" / "Daralt" butonu ile tam metin toggle edilir.
 */

import React, { useState, useCallback } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { Typography } from "./Typography";
import { Theme, Spacing } from "../../styles/index";

interface ExpandableTextProps {
  /** Gösterilecek metin */
  text: string;
  /** Kırpma karakter limiti */
  characterLimit?: number;
  /** Typography variant */
  variant?: "bodyLarge" | "bodyMedium" | "captionSmall";
  /** Typography color */
  color?: "primary" | "secondary" | "disabled";
  /** Typography align */
  align?: "left" | "center" | "right";
  /** Ek stil */
  style?: object;
}

export const ExpandableText = React.memo<ExpandableTextProps>(
  ({
    text,
    characterLimit = 120,
    variant = "bodyLarge",
    color = "secondary",
    align = "center",
    style,
  }) => {
    const [expanded, setExpanded] = useState(false);
    const needsTruncation = text.length > characterLimit;

    const toggleExpanded = useCallback(() => {
      setExpanded((prev) => !prev);
    }, []);

    const displayText =
      needsTruncation && !expanded
        ? text.slice(0, characterLimit).trimEnd() + "…"
        : text;

    return (
      <>
        <Typography variant={variant} color={color} align={align} style={style}>
          {displayText}
        </Typography>
        {needsTruncation && (
          <TouchableOpacity
            onPress={toggleExpanded}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel={expanded ? "Metni daralt" : "Devamını oku"}
          >
            <Typography
              variant="captionSmall"
              weight="semiBold"
              color="primary"
              align={align}
              style={styles.toggleText}
            >
              {expanded ? "Daralt" : "Devamını oku"}
            </Typography>
          </TouchableOpacity>
        )}
      </>
    );
  },
);

ExpandableText.displayName = "ExpandableText";

const styles = StyleSheet.create({
  toggleText: {
    marginTop: Spacing.xs,
    color: Theme.primary.main,
  },
});
