// Badge Component - Single Responsibility
import React from 'react';
import { View, ViewStyle } from 'react-native';
import { Typography as AppText } from '../../../../components/ui/Typography';
import { badgeStyles } from '../../styles';

export type BadgeVariant = 'enrolled' | 'active' | 'beta' | 'live';

interface BadgeProps {
    variant: BadgeVariant;
    text: string;
    style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({ variant, text, style }) => {
    const getBadgeStyle = () => {
        switch (variant) {
            case 'enrolled':
                return badgeStyles.enrolledBadge;
            case 'active':
                return badgeStyles.activeBadge;
            case 'beta':
                return badgeStyles.betaBadge;
            case 'live':
                return badgeStyles.liveBadge;
            default:
                return badgeStyles.enrolledBadge;
        }
    };

    const getTextStyle = () => {
        switch (variant) {
            case 'enrolled':
                return badgeStyles.enrolledText;
            case 'active':
                return badgeStyles.activeText;
            case 'beta':
                return badgeStyles.betaText;
            case 'live':
                return badgeStyles.liveText;
            default:
                return badgeStyles.enrolledText;
        }
    };

    return (
        <View style={[badgeStyles.badge, getBadgeStyle(), style]}>
            <AppText style={getTextStyle()}>{text}</AppText>
        </View>
    );
};
