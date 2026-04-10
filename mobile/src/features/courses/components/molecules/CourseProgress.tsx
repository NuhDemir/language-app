// CourseProgress Component - Composition
import React from 'react';
import { View } from 'react-native';
import { ProgressBar, StatItem } from '../atoms';
import { progressStyles } from '../../styles';

interface CourseProgressProps {
    completedLevels: number;
    totalLevels: number;
    totalXp: number;
}

export const CourseProgress: React.FC<CourseProgressProps> = ({
    completedLevels,
    totalLevels,
    totalXp,
}) => {
    return (
        <>
            <ProgressBar current={completedLevels} total={totalLevels} />
            <View style={progressStyles.statsRow}>
                <StatItem value={totalXp} label="XP" />
            </View>
        </>
    );
};
