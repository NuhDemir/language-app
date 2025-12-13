import { z } from 'zod';

// ============================================================
// AUDIO METADATA SCHEMA
// ============================================================

/**
 * Schema for audio file metadata.
 * Used for TTS, pronunciation, and listening exercises.
 */
export const AudioMetadataSchema = z.object({
  /** CDN URL for the audio file */
  url: z.string().url('Invalid audio URL'),

  /** Duration in milliseconds (required for progress bars) */
  duration_ms: z.number().int().positive('Duration must be positive'),

  /** Audio format for client-side decoder selection */
  format: z.enum(['mp3', 'aac', 'webm', 'wav', 'ogg']),

  /** File size in bytes (optional, for preload optimization) */
  size_bytes: z.number().int().positive().optional(),
});

export type AudioMetadata = z.infer<typeof AudioMetadataSchema>;

// ============================================================
// IMAGE METADATA SCHEMA
// ============================================================

/**
 * Schema for image file metadata.
 * Used for vocabulary illustrations and exercise visuals.
 */
export const ImageMetadataSchema = z.object({
  /** CDN URL for the image file */
  url: z.string().url('Invalid image URL'),

  /** Image width in pixels */
  width: z.number().int().positive(),

  /** Image height in pixels */
  height: z.number().int().positive(),

  /** Alt text for accessibility (A11y) */
  alt_text: z.string().optional(),

  /** Image format */
  format: z.enum(['jpg', 'png', 'webp', 'svg']).optional(),
});

export type ImageMetadata = z.infer<typeof ImageMetadataSchema>;

// ============================================================
// MAIN MEDIA METADATA SCHEMA
// ============================================================

/**
 * Main media metadata schema for exercises.
 * All fields are optional - exercises may have none, some, or all media types.
 */
export const MediaMetadataSchema = z.object({
  /** Primary audio (pronunciation, sentence audio) */
  main_audio: AudioMetadataSchema.optional(),

  /** Slow audio for beginners */
  slow_audio: AudioMetadataSchema.optional(),

  /** Intro/context image */
  intro_image: ImageMetadataSchema.optional(),

  /** Lottie animation URL for reward/celebration */
  reward_animation_lottie: z.string().url().optional(),

  /** Video URL (for advanced exercises) */
  video_url: z.string().url().optional(),
});

export type MediaMetadata = z.infer<typeof MediaMetadataSchema>;

// ============================================================
// VALIDATION HELPER
// ============================================================

/**
 * Validates media metadata with soft failure (logs warning but doesn't throw).
 * @param metadata - Raw media metadata object
 * @returns Validation result with success flag
 */
export function validateMediaMetadata(metadata: unknown) {
  return MediaMetadataSchema.safeParse(metadata);
}
