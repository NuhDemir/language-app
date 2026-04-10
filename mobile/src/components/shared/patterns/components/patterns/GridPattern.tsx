/**
 * GridPattern Component (Shared)
 * Renders grid pattern for engineering/system categories
 */

import React from "react";
import Svg, { Rect } from "react-native-svg";
import type { PatternBackgroundProps } from "../../types";
import { INTENSITY_OPACITY } from "../../types";

const GridPatternComponent: React.FC<PatternBackgroundProps> = ({
    primaryColor,
    width,
    height,
    intensity = "medium",
}) => {
    const baseOpacity = INTENSITY_OPACITY[intensity];

    const cells = React.useMemo(() => {
        const result = [];
        const cellSize = 20;
        const cols = Math.ceil(width / cellSize);
        const rows = Math.ceil(height / cellSize);

        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                result.push({
                    x: i * cellSize,
                    y: j * cellSize,
                    size: cellSize,
                });
            }
        }
        return result;
    }, [width, height]);

    return (
        <Svg width={width} height={height} style={{ position: "absolute" }}>
            {cells.map((cell, index) => (
                <Rect
                    key={index}
                    x={cell.x}
                    y={cell.y}
                    width={cell.size}
                    height={cell.size}
                    fill="none"
                    stroke={primaryColor}
                    strokeWidth={0.5}
                    opacity={baseOpacity}
                />
            ))}
        </Svg>
    );
};

export const GridPattern = React.memo(GridPatternComponent);
