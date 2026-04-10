/**
 * CirclesPattern Component
 * Renders concentric circles pattern for experience/journey visualization
 * Perfect for roadmap and progress visualization
 */

import React from "react";
import Svg, { Circle } from "react-native-svg";
import type { PatternBackgroundProps } from "../../types";
import { INTENSITY_OPACITY } from "../../types";

const CirclesPatternComponent: React.FC<PatternBackgroundProps> = ({
    primaryColor,
    secondaryColor,
    width,
    height,
    intensity = "medium",
}) => {
    const baseOpacity = INTENSITY_OPACITY[intensity];

    const circles = React.useMemo(() => {
        const result = [];
        const centerX = width / 2;
        const centerY = height / 2;
        const maxRadius = Math.max(width, height);
        const circleCount = 6;

        for (let i = 0; i < circleCount; i++) {
            const radius = (maxRadius / circleCount) * (i + 1);
            const opacity = baseOpacity * (1 - i / circleCount);
            const color = i % 2 === 0 ? primaryColor : secondaryColor;

            result.push({
                cx: centerX,
                cy: centerY,
                r: radius,
                opacity,
                color,
            });
        }
        return result;
    }, [width, height, primaryColor, secondaryColor, baseOpacity]);

    return (
        <Svg width={width} height={height} style={{ position: "absolute" }}>
            {circles.map((circle, index) => (
                <Circle
                    key={index}
                    cx={circle.cx}
                    cy={circle.cy}
                    r={circle.r}
                    stroke={circle.color}
                    strokeWidth={1.5}
                    fill="none"
                    opacity={circle.opacity}
                />
            ))}
        </Svg>
    );
};

export const CirclesPattern = React.memo(CirclesPatternComponent);
