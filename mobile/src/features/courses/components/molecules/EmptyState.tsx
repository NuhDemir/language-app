// EmptyState Component - Single Responsibility
import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Typography as AppText } from '../../../../components/ui/Typography';
import { layoutStyles, buttonStyles } from '../../styles';

interface EmptyStateProps {
    emoji: string;
    title: string;
    message: string;
    actionText?: string;
    onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    emoji,
    title,
    message,
    actionText,
    onAction,
}) => {
    return (
        <View style={layoutStyles.centerContainer}>
            <AppText style={layoutStyles.emptyEmoji}>{emoji}</AppText>
            <AppText style={layoutStyles.emptyTitle}>{title}</AppText>
            <AppText style={layoutStyles.emptyText}>{message}</AppText>
            {actionText && onAction && (
                <TouchableOpacity style={buttonStyles.primaryButton} onPress={onAction}>
                    <AppText style={buttonStyles.primaryButtonText}>{actionText}</AppText>
                </TouchableOpacity>
            )}
        </View>
    );
};
