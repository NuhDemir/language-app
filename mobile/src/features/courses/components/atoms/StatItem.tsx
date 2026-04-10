// StatItem Component - Single Responsibility
import React from 'react';
import { View, ViewStyle } from 'react-native';
import { Typography as AppText } from '../../../../components/ui/Typography';
import { progressStyles } from '../../styles';

interface StatItemProps {
    value: string | number;
    label: string;
    style?: ViewStyle;
}

export const StatItem: React.FC<StatItemProps> = ({ value, label, style }) => {
    return (
        <View style={[progressStyles.statItem, style]}>
            <AppText style={progressStyles.statValue}>{value}</AppText>
            <AppText style={progressStyles.statLabel}>{label}</AppText>
        </View>
    );
};
