/**
 * Logo Component
 * Reusable app logo component with different size variants
 */

import React from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';

interface LogoProps {
    size?: 'small' | 'medium' | 'large' | 'xlarge';
    style?: StyleProp<ImageStyle>;
}

const SIZES = {
    small: { width: 60, height: 60 },
    medium: { width: 100, height: 100 },
    large: { width: 150, height: 150 },
    xlarge: { width: 200, height: 200 },
};

export const Logo: React.FC<LogoProps> = ({ size = 'medium', style }) => {
    const dimensions = SIZES[size];

    return (
        <Image
            source={require('../../../assets/logo/logo.png')}
            style={[dimensions, style]}
            resizeMode="contain"
        />
    );
};
