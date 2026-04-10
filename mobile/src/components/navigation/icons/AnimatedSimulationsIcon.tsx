/**
 * AnimatedSimulationsIcon Component
 * 
 * Simulations icon for bottom tab bar (using fallback until Lottie assets are added)
 */

import React from "react";
import { SimulationsIcon } from "./SimulationsIcon";

interface AnimatedSimulationsIconProps {
    size?: number;
    color?: string;
    isFocused?: boolean;
}

export const AnimatedSimulationsIcon: React.FC<AnimatedSimulationsIconProps> = ({
    size = 28,
    color = "#ABB7C2",
    isFocused = false,
}) => {
    // Using fallback icon until Lottie animations are added
    return <SimulationsIcon size={size} color={color} />;
};
