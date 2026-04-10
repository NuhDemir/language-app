/**
 * Story Design Tokens
 * Instagram-style story component için tasarım sabitleri
 */

import { Palette } from "../theme/colors";
import { Typography } from "../variables/typography";

export const StoryTokens = {
  ring: {
    size: {
      outer: 88,
      inner: 80,
      border: 4,
    },
    gradient: {
      viewed: [Palette.slate200, Palette.slate200],
      unviewed: (brandColor: string): [string, string, string] => [
        brandColor,
        `${brandColor}E6`,
        brandColor,
      ],
    },
  },
  label: {
    maxLines: 2,
    fontSize: Typography.size.captionSmall,
    lineHeight: Typography.lineHeight.captionSmall,
    color: Palette.slate600,
    maxWidth: 88,
  },
  badge: {
    size: 16,
    color: Palette.error,
    borderWidth: 2,
    borderColor: Palette.offWhite,
  },
  progress: {
    height: 2,
    color: Palette.violetPrimary,
    backgroundColor: Palette.slate200,
  },
  animation: {
    press: {
      scaleMin: 0.92,
      scaleMax: 1,
      duration: 200,
    },
    active: {
      scale: 1.05,
      glowRadius: 8,
    },
    gradient: {
      duration: 3000,
    },
    badge: {
      duration: 1500,
    },
  },
  spacing: {
    itemGap: 12,
    containerPadding: 16,
  },
} as const;
