/**
 * Type-safe interface for User.settings JSONB field.
 * This allows extending settings without database migrations.
 */
export interface UserSettings {
  /** Daily XP goal (default: 50) */
  daily_goal: number;

  /** Sound effects enabled (default: true) */
  sound_effects: boolean;

  /** Notifications enabled (default: true) */
  notifications: boolean;

  /** Dark mode preference (optional, future feature) */
  dark_mode?: boolean;
}

/**
 * Default settings for new users.
 * Must match the default value in schema.prisma.
 */
export const DEFAULT_USER_SETTINGS: UserSettings = {
  daily_goal: 50,
  sound_effects: true,
  notifications: true,
};
