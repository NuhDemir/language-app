// LoadingState Component - Single Responsibility
import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Typography as AppText } from '../../../../components/ui/Typography';
import { Theme } from '../../../../styles/theme';
import { layoutStyles } from '../../styles';

interface LoadingStateProps {
    message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Loading...' }) => {
    return (
        <View style={layoutStyles.centerContainer}>
            <ActivityIndicator size="large" color={Theme.primary.main} />
            <AppText style={layoutStyles.loadingText}>{message}</AppText>
        </View>
    );
};
