/**
 * AnimatedHomeIcon Component
 * 
 * Home icon for bottom tab bar (using fallback until Lottie assets are added)
 */

import React from "react";
import { HomeIcon } from "./HomeIcon";

interface AnimatedHomeIconProps {
    size?: number;
    color?: string;
    isFocused?: boolean;
}

export const AnimatedHomeIcon: React.FC<AnimatedHomeIconProps> = ({
    size = 28,
    color = "#ABB7C2",
    isFocused = false,
}) => {
    // Using fallback icon until Lottie animations are added
    return <HomeIcon size={size} color={color} />;
};
