/**
 * Character Design Tokens
 * CharacterWidget bileşeni için tasarım sabitleri
 * 
 * Karakter görseli, animasyonlar, efektler ve ses için
 * tüm yapılandırma değerleri burada toplanır.
 */

import { Palette } from "../theme/colors";

export const CharacterTokens = {
    frame: {
        size: {
            small: 120,
            medium: 160,
            large: 200,
            xlarge: 240,
        },
        border: {
            width: 3,
            radius: 16,
        },
        gradient: {
            // Pose kategorilerine göre gradient renkleri
            action: [Palette.violetPrimary, Palette.violetLight] as [string, string],
            happy: [Palette.success, "#34D399"] as [string, string],
            sad: ["#6B7280", "#9CA3AF"] as [string, string],
            angry: [Palette.error, "#F87171"] as [string, string],
            surprised: ["#F59E0B", "#FBBF24"] as [string, string],
            tired: ["#8B5CF6", "#A78BFA"] as [string, string],
            neutral: [Palette.slate400, Palette.slate300] as [string, string],
        },
    },
    animation: {
        crossfade: {
            duration: 400,
        },
        entrance: {
            duration: 600,
            scale: {
                from: 0.8,
                to: 1,
            },
            springConfig: {
                friction: 8,
                tension: 40,
            },
        },
        poseChange: {
            duration: 350,
            bounce: {
                friction: 4,
                tension: 200,
            },
        },
        glow: {
            duration: 2000,
            pulseScale: 1.05,
        },
        press: {
            scaleDown: 0.95,
            scaleUp: 1,
            friction: 3,
        },
    },
    glow: {
        radius: 24,
        opacity: 0.3,
        colors: {
            positive: Palette.success,
            negative: Palette.error,
            neutral: Palette.violetPrimary,
        },
    },
    badge: {
        size: 32,
        offset: {
            x: -8,
            y: -8,
        },
        iconSize: 16,
        borderWidth: 2,
        borderColor: Palette.offWhite,
    },
    shadow: {
        elevation: 8,
        shadowColor: "rgba(0, 0, 0, 0.15)",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
    },
    skeleton: {
        baseColor: Palette.slate200,
        highlightColor: Palette.slate100,
        animationDuration: 1500,
    },
    sound: {
        volume: 0.5,
        enabledByDefault: true,
    },
} as const;

/**
 * Pose kategorisi belirleme helper'ı
 */
export function getPoseCategory(pose: string): keyof typeof CharacterTokens.frame.gradient {
    const lowerPose = pose.toLowerCase();

    if (["greeting", "thinking", "moving", "victory"].includes(lowerPose)) {
        return "action";
    }
    if (lowerPose === "happy") return "happy";
    if (lowerPose === "sad") return "sad";
    if (lowerPose === "angry") return "angry";
    if (lowerPose === "surprised") return "surprised";
    if (lowerPose === "tired") return "tired";

    return "neutral";
}
