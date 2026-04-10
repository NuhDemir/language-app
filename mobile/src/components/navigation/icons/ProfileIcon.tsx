import React from "react";
import Svg, { Path } from "react-native-svg";

interface IconProps {
  size?: number;
  color?: string;
}

export const ProfileIcon: React.FC<IconProps> = ({
  size = 24,
  color = "#ABB7C2",
}) => {
  // viewBox aspect ratio adjustment for proper scaling
  const width = size * (21 / 24);
  const height = size;

  return (
    <Svg width={width} height={height} viewBox="0 0 21 24" fill="none">
      <Path
        d="M10.5 12.875C13.7792 12.875 16.4375 10.2167 16.4375 6.9375C16.4375 3.65831 13.7792 1 10.5 1C7.22081 1 4.5625 3.65831 4.5625 6.9375C4.5625 10.2167 7.22081 12.875 10.5 12.875Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M20 22.375C20 19.8554 18.9991 17.4391 17.2175 15.6575C15.4359 13.8759 13.0196 12.875 10.5 12.875C7.98044 12.875 5.56408 13.8759 3.78249 15.6575C2.00089 17.4391 1 19.8554 1 22.375"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
