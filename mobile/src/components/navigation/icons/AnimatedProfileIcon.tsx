/**
 * AnimatedProfileIcon Component
 * 
 * Profile icon for bottom tab bar (using fallback until Lottie assets are added)
 */

import React from "react";
import { ProfileIcon } from "./ProfileIcon";

interface AnimatedProfileIconProps {
    size?: number;
    color?: string;
    isFocused?: boolean;
}

export const AnimatedProfileIcon: React.FC<AnimatedProfileIconProps> = ({
    size = 28,
    color = "#ABB7C2",
    isFocused = false,
}) => {
    // Using fallback icon until Lottie animations are added
    return <ProfileIcon size={size} color={color} />;
};
