/**
 * Theme System Index
 * Central export for all theme-related utilities
 */

import type { ThemeType } from "./light";

export { Palette } from "./colors";
export {
  InventoryTheme,
  getInventoryTheme,
  type ThemeMode,
} from "./inventoryTheme";
export { LightTheme, type ThemeType } from "./light";
export { DarkTheme } from "./dark";
export type ThemeColors = ThemeType;

// Default theme export for backward compatibility
export { LightTheme as Theme } from "./light";
