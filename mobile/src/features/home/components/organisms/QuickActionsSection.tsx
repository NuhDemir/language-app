/**
 * QuickActionsSection - Organism Component
 * Section with title and action cards
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BookOpen, Trophy, Target } from 'lucide-react-native';
import { Typography } from '../../../../components/ui/Typography';
import { Spacing, isTablet } from '../../../../styles';
import { QuickActionCard } from '../molecules';

interface QuickActionsSectionProps {
    onStartLesson: () => void;
    onViewLeaderboard: () => void;
    onViewGoals: () => void;
}

export const QuickActionsSection = React.memo<QuickActionsSectionProps>(({
    onStartLesson,
    onViewLeaderboard,
    onViewGoals,
}) => {
    const tablet = isTablet();

    return (
        <View style={styles.container}>
            <Typography style={[styles.title, tablet && styles.titleTablet]}>
                Hızlı Erişim
            </Typography>

            <QuickActionCard
                icon={BookOpen}
                iconColor="#3B82F6"
                title="Derse Başla"
                description="Öğrenmeye devam et"
                onPress={onStartLesson}
            />

            <QuickActionCard
                icon={Trophy}
                iconColor="#F59E0B"
                title="Liderlik Tablosu"
                description="Sıralamana göz at"
                onPress={onViewLeaderboard}
            />

            <QuickActionCard
                icon={Target}
                iconColor="#10B981"
                title="Günlük Hedefler"
                description="Yakında gelecek"
                onPress={onViewGoals}
            />
        </View>
    );
});

QuickActionsSection.displayName = 'QuickActionsSection';

const styles = StyleSheet.create({
    container: {
        marginBottom: Spacing.xl,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: Spacing.l,
    },
    titleTablet: {
        fontSize: 24,
    },
});
