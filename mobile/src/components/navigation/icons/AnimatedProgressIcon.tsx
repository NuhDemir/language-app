/**
 * AnimatedProgressIcon Component
 * 
 * Progress icon for bottom tab bar (using fallback until Lottie assets are added)
 */

import React from "react";
import { ProgressIcon } from "./ProgressIcon";

interface AnimatedProgressIconProps {
    size?: number;
    color?: string;
    isFocused?: boolean;
}

export const AnimatedProgressIcon: React.FC<AnimatedProgressIconProps> = ({
    size = 28,
    color = "#ABB7C2",
    isFocused = false,
}) => {
    // Using fallback icon until Lottie animations are added
    return <ProgressIcon size={size} color={color} />;
};
