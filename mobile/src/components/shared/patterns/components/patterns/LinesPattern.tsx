/**
 * LinesPattern Component (Shared)
 * Renders diagonal lines pattern for business/strategy categories
 */

import React from "react";
import Svg, { Line } from "react-native-svg";
import type { PatternBackgroundProps } from "../../types";
import { INTENSITY_OPACITY } from "../../types";

const LinesPatternComponent: React.FC<PatternBackgroundProps> = ({
    primaryColor,
    width,
    height,
    intensity = "medium",
}) => {
    const baseOpacity = INTENSITY_OPACITY[intensity];

    const lines = React.useMemo(() => {
        const result = [];
        const spacing = 15;
        const lineCount = Math.ceil((width + height) / spacing);

        for (let i = 0; i < lineCount; i++) {
            const offset = i * spacing;
            result.push({
                x1: offset,
                y1: 0,
                x2: offset - height,
                y2: height,
            });
        }
        return result;
    }, [width, height]);

    return (
        <Svg width={width} height={height} style={{ position: "absolute" }}>
            {lines.map((line, index) => (
                <Line
                    key={index}
                    x1={line.x1}
                    y1={line.y1}
                    x2={line.x2}
                    y2={line.y2}
                    stroke={primaryColor}
                    strokeWidth={1}
                    opacity={baseOpacity}
                />
            ))}
        </Svg>
    );
};

export const LinesPattern = React.memo(LinesPatternComponent);
