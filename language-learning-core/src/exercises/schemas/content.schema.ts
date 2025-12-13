import { z } from 'zod';

// ============================================================
// EXERCISE CONTENT SCHEMAS (Discriminated Union Pattern)
// ============================================================

/**
 * Translate Exercise Content
 * User translates a sentence from one language to another.
 */
export const TranslateContentSchema = z.object({
  /** Source text to translate */
  prompt: z.string().min(1, 'Prompt is required'),

  /** Acceptable correct answers (multiple for synonyms) */
  correct_answers: z.array(z.string()).min(1, 'At least one correct answer required'),

  /** Word tokens for selection (word bank) */
  tokens: z.array(z.string()).optional(),
});

export type TranslateContent = z.infer<typeof TranslateContentSchema>;

/**
 * Match Pairs Exercise Content
 * User matches terms with their definitions.
 */
export const MatchContentSchema = z.object({
  /** Array of term-definition pairs */
  pairs: z
    .array(
      z.object({
        term: z.string().min(1),
        definition: z.string().min(1),
        image_url: z.string().url().optional(),
      }),
    )
    .min(2, 'At least 2 pairs required'),
});

export type MatchContent = z.infer<typeof MatchContentSchema>;

/**
 * Listen & Tap Exercise Content
 * User listens to audio and constructs the sentence.
 */
export const ListenContentSchema = z.object({
  /** Audio file URL */
  audio_url: z.string().url('Invalid audio URL'),

  /** Correct transcription */
  transcription: z.string().min(1),

  /** Optional slow audio URL */
  slow_audio_url: z.string().url().optional(),
});

export type ListenContent = z.infer<typeof ListenContentSchema>;

/**
 * Speak Exercise Content
 * User speaks a phrase for pronunciation practice.
 */
export const SpeakContentSchema = z.object({
  /** Phrase to speak */
  prompt: z.string().min(1),

  /** Expected pronunciation (for reference) */
  expected_phrase: z.string().min(1),

  /** Reference audio URL */
  reference_audio_url: z.string().url().optional(),
});

export type SpeakContent = z.infer<typeof SpeakContentSchema>;

// ============================================================
// DISCRIMINATED UNION SCHEMA
// ============================================================

/**
 * Main Exercise Content Schema using Discriminated Union.
 * The `type` field determines which content schema is applied.
 */
export const ExercisePayloadSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('translate'),
    content: TranslateContentSchema,
  }),
  z.object({
    type: z.literal('match_pairs'),
    content: MatchContentSchema,
  }),
  z.object({
    type: z.literal('listen_tap'),
    content: ListenContentSchema,
  }),
  z.object({
    type: z.literal('speak'),
    content: SpeakContentSchema,
  }),
]);

export type ExercisePayload = z.infer<typeof ExercisePayloadSchema>;

// ============================================================
// VALIDATION HELPER
// ============================================================

/**
 * Validates exercise content against its type schema.
 * @param type - Exercise type (e.g., 'translate', 'match_pairs')
 * @param content - Raw content object to validate
 * @returns Validated content or throws ZodError
 */
export function validateExerciseContent(
  type: string,
  content: unknown,
): z.infer<typeof ExercisePayloadSchema> {
  return ExercisePayloadSchema.parse({ type, content });
}

/**
 * Safe validation that returns result instead of throwing.
 * @param type - Exercise type
 * @param content - Raw content object
 * @returns SafeParseReturnType with success flag and data/error
 */
export function safeValidateExerciseContent(type: string, content: unknown) {
  return ExercisePayloadSchema.safeParse({ type, content });
}
