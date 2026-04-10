/**
 * MeshPattern Component (Shared)
 * Renders mesh gradient pattern (Stripe/Linear style)
 */

import React from "react";
import Svg, { Defs, RadialGradient, Stop, Circle, Ellipse } from "react-native-svg";
import type { PatternBackgroundProps } from "../../types";
import { INTENSITY_OPACITY } from "../../types";

const MeshPatternComponent: React.FC<PatternBackgroundProps> = ({
    primaryColor,
    secondaryColor,
    width,
    height,
    intensity = "medium",
}) => {
    const baseOpacity = INTENSITY_OPACITY[intensity];

    return (
        <Svg width={width} height={height} style={{ position: "absolute" }}>
            <Defs>
                <RadialGradient id="mesh1" cx="50%" cy="50%">
                    <Stop offset="0%" stopColor={primaryColor} stopOpacity={baseOpacity * 2} />
                    <Stop offset="100%" stopColor={primaryColor} stopOpacity="0" />
                </RadialGradient>
                <RadialGradient id="mesh2" cx="50%" cy="50%">
                    <Stop offset="0%" stopColor={secondaryColor} stopOpacity={baseOpacity * 1.7} />
                    <Stop offset="100%" stopColor={secondaryColor} stopOpacity="0" />
                </RadialGradient>
                <RadialGradient id="mesh3" cx="50%" cy="50%">
                    <Stop offset="0%" stopColor={primaryColor} stopOpacity={baseOpacity * 1.3} />
                    <Stop offset="100%" stopColor={primaryColor} stopOpacity="0" />
                </RadialGradient>
            </Defs>

            <Circle cx={width * 0.2} cy={height * 0.3} r={width * 0.4} fill="url(#mesh1)" />
            <Ellipse
                cx={width * 0.8}
                cy={height * 0.7}
                rx={width * 0.35}
                ry={height * 0.4}
                fill="url(#mesh2)"
            />
            <Circle cx={width * 0.5} cy={height * 0.5} r={width * 0.25} fill="url(#mesh3)" />
        </Svg>
    );
};

export const MeshPattern = React.memo(MeshPatternComponent);
