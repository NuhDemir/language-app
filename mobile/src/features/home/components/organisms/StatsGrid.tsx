/**
 * StatsGrid - Organism Component
 * Responsive grid of stat cards
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Zap, Target, Award, TrendingUp } from 'lucide-react-native';
import { Spacing } from '../../../../styles';
import { StatCard } from '../molecules';

interface StatsGridProps {
    totalXp: number;
    level: number;
    badges: number;
    rank: number;
}

export const StatsGrid = React.memo<StatsGridProps>(({
    totalXp,
    level,
    badges,
    rank,
}) => {
    return (
        <View style={styles.container}>
            <StatCard
                icon={Zap}
                iconColor="#F59E0B"
                value={totalXp}
                label="Toplam XP"
            />

            <StatCard
                icon={Target}
                iconColor="#3B82F6"
                value={level}
                label="Seviye"
            />

            <StatCard
                icon={Award}
                iconColor="#8B5CF6"
                value={badges}
                label="Rozet"
            />

            <StatCard
                icon={TrendingUp}
                iconColor="#10B981"
                value={rank || '-'}
                label="Sıralama"
            />
        </View>
    );
});

StatsGrid.displayName = 'StatsGrid';

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -Spacing.s,
        marginBottom: Spacing.xl,
    },
});
