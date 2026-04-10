// ProgressBar Component - Single Responsibility
import React from 'react';
import { View, ViewStyle } from 'react-native';
import { Typography as AppText } from '../../../../components/ui/Typography';
import { progressStyles } from '../../styles';

interface ProgressBarProps {
    current: number;
    total: number;
    showLabel?: boolean;
    style?: ViewStyle;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
    current,
    total,
    showLabel = true,
    style,
}) => {
    const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

    return (
        <View style={[progressStyles.progressSection, style]}>
            <View style={progressStyles.progressBar}>
                <View style={[progressStyles.progressFill, { width: `${percentage}%` }]} />
            </View>
            {showLabel && (
                <AppText style={progressStyles.progressText}>
                    {current} / {total} levels • {percentage}%
                </AppText>
            )}
        </View>
    );
};
