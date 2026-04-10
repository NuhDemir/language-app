/**
 * DotsPattern Component (Shared)
 * Renders scattered dots pattern for tech/data categories
 */

import React from "react";
import Svg, { Circle } from "react-native-svg";
import type { PatternBackgroundProps } from "../../types";
import { INTENSITY_OPACITY } from "../../types";

const DotsPatternComponent: React.FC<PatternBackgroundProps> = ({
    primaryColor,
    width,
    height,
    intensity = "medium",
}) => {
    const baseOpacity = INTENSITY_OPACITY[intensity];

    const dots = React.useMemo(() => {
        const result = [];
        const gridSize = 20;
        const cols = Math.ceil(width / gridSize);
        const rows = Math.ceil(height / gridSize);

        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                const offsetX = ((i * j) % 5) - 2;
                const offsetY = ((i + j) % 5) - 2;
                result.push({
                    cx: i * gridSize + offsetX,
                    cy: j * gridSize + offsetY,
                    r: 1.5,
                });
            }
        }
        return result;
    }, [width, height]);

    return (
        <Svg width={width} height={height} style={{ position: "absolute" }}>
            {dots.map((dot, index) => (
                <Circle
                    key={index}
                    cx={dot.cx}
                    cy={dot.cy}
                    r={dot.r}
                    fill={primaryColor}
                    opacity={baseOpacity}
                />
            ))}
        </Svg>
    );
};

export const DotsPattern = React.memo(DotsPatternComponent);
