/**
 * WavesPattern Component (Shared)
 * Renders wave pattern for creative/design categories
 */

import React from "react";
import Svg, { Path } from "react-native-svg";
import type { PatternBackgroundProps } from "../../types";
import { INTENSITY_OPACITY } from "../../types";

const WavesPatternComponent: React.FC<PatternBackgroundProps> = ({
    primaryColor,
    secondaryColor,
    width,
    height,
    intensity = "medium",
}) => {
    const baseOpacity = INTENSITY_OPACITY[intensity];

    const waves = React.useMemo(() => {
        const waveCount = 3;
        const result = [];

        for (let i = 0; i < waveCount; i++) {
            const amplitude = 15 + i * 5;
            const frequency = 0.02 + i * 0.01;
            const yOffset = (height / waveCount) * i + 20;

            let path = `M 0 ${yOffset}`;
            for (let x = 0; x <= width; x += 5) {
                const y = yOffset + Math.sin(x * frequency) * amplitude;
                path += ` L ${x} ${y}`;
            }

            result.push({
                path,
                opacity: baseOpacity - i * 0.03,
            });
        }
        return result;
    }, [width, height, baseOpacity]);

    return (
        <Svg width={width} height={height} style={{ position: "absolute" }}>
            {waves.map((wave, index) => (
                <Path
                    key={index}
                    d={wave.path}
                    stroke={index % 2 === 0 ? primaryColor : secondaryColor}
                    strokeWidth={2}
                    fill="none"
                    opacity={wave.opacity}
                />
            ))}
        </Svg>
    );
};

export const WavesPattern = React.memo(WavesPatternComponent);
