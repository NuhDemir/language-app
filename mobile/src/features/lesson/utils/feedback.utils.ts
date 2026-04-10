// src/features/lesson/utils/feedback.utils.ts
// Audio and Haptics feedback utilities

import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';

// ============================================================================
// SOUND EFFECTS
// Sound files are bundled with the app for offline support
// Future: Move to CDN with caching for reduced app size
// ============================================================================

// Sound cache to avoid reloading
let correctSound: Audio.Sound | null = null;
let wrongSound: Audio.Sound | null = null;

/**
 * Initialize audio system
 * Call this once when lesson starts
 */
export const initializeAudio = async (): Promise<void> => {
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    });
  } catch (error) {
    console.warn('[Audio] Failed to initialize:', error);
  }
};

/**
 * Play correct answer sound effect
 * TODO: Replace with actual sound file when available
 */
export const playCorrectSound = async (): Promise<void> => {
  try {
    // Haptic feedback immediately
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Sound (placeholder - would load from bundled file)
    // if (!correctSound) {
    //   const { sound } = await Audio.Sound.createAsync(
    //     require('../../../assets/sounds/correct.mp3')
    //   );
    //   correctSound = sound;
    // }
    // await correctSound.replayAsync();
  } catch (error) {
    console.warn('[Feedback] Correct sound failed:', error);
  }
};

/**
 * Play wrong answer sound effect
 */
export const playWrongSound = async (): Promise<void> => {
  try {
    // Haptic feedback immediately
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    
    // Sound (placeholder)
    // if (!wrongSound) {
    //   const { sound } = await Audio.Sound.createAsync(
    //     require('../../../assets/sounds/wrong.mp3')
    //   );
    //   wrongSound = sound;
    // }
    // await wrongSound.replayAsync();
  } catch (error) {
    console.warn('[Feedback] Wrong sound failed:', error);
  }
};

/**
 * Light haptic for button press
 */
export const playTapFeedback = async (): Promise<void> => {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch (error) {
    // Silently fail - haptics may not be available
  }
};

/**
 * Medium haptic for selection
 */
export const playSelectionFeedback = async (): Promise<void> => {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } catch (error) {
    // Silently fail
  }
};

/**
 * Clean up audio resources
 * Call when lesson ends
 */
export const cleanupAudio = async (): Promise<void> => {
  try {
    if (correctSound) {
      await correctSound.unloadAsync();
      correctSound = null;
    }
    if (wrongSound) {
      await wrongSound.unloadAsync();
      wrongSound = null;
    }
  } catch (error) {
    console.warn('[Audio] Cleanup failed:', error);
  }
};
