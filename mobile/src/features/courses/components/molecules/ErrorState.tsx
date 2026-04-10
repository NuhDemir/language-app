// ErrorState Component - Single Responsibility
import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Typography as AppText } from '../../../../components/ui/Typography';
import { layoutStyles, buttonStyles } from '../../styles';

interface ErrorStateProps {
    title?: string;
    message?: string;
    onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
    title = 'Failed to Load',
    message = 'Please check your connection and try again',
    onRetry,
}) => {
    return (
        <View style={layoutStyles.centerContainer}>
            <AppText style={layoutStyles.errorEmoji}>😔</AppText>
            <AppText style={layoutStyles.errorTitle}>{title}</AppText>
            <AppText style={layoutStyles.errorText}>{message}</AppText>
            {onRetry && (
                <TouchableOpacity style={buttonStyles.primaryButton} onPress={onRetry}>
                    <AppText style={buttonStyles.primaryButtonText}>Retry</AppText>
                </TouchableOpacity>
            )}
        </View>
    );
};
