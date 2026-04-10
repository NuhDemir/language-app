// Example usage of useCourseProgress hook
// This file demonstrates how to use the useCourseProgress hook in a React component

import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useCourseProgress } from './useCourseProgress';
import { useCourseStore } from '../stores';

/**
 * Example component showing how to use useCourseProgress
 */
export const CourseProgressExample = () => {
    const { activeCourseId } = useCourseStore();

    // Fetch course progress data
    const { data, isLoading, isError, error, refetch } = useCourseProgress(activeCourseId);

    // Loading state
    if (isLoading) {
        return (
            <View>
                <ActivityIndicator size="large" />
                <Text>Loading course progress...</Text>
            </View>
        );
    }

    // Error state
    if (isError) {
        return (
            <View>
                <Text>Error loading progress: {error?.message}</Text>
                <Text onPress={() => refetch()}>Retry</Text>
            </View>
        );
    }

    // No active course
    if (!activeCourseId || !data) {
        return (
            <View>
                <Text>No active course selected</Text>
            </View>
        );
    }

    // Success state - display progress data
    return (
        <View>
            <Text>Course Progress</Text>
            <Text>Total XP: {data.totalXp}</Text>
            <Text>
                Completed Levels: {data.completedLevelsCount} / {data.totalLevelsCount}
            </Text>
            <Text>Total Time: {data.totalTimeMinutes} minutes</Text>

            {/* Display level progress */}
            <Text>Level Progress:</Text>
            {data.levels.map((level) => (
                <View key={level.levelId}>
                    <Text>Level {level.levelId}</Text>
                    <Text>
                        Lessons: {level.completedLessons} / {level.totalLessons}
                    </Text>
                    <Text>XP Earned: {level.xpEarned}</Text>
                    <Text>Accuracy: {level.accuracy}%</Text>
                </View>
            ))}
        </View>
    );
};

/**
 * Example: Using with a specific course ID
 */
export const SpecificCourseProgressExample = () => {
    const courseId = 1; // Hardcoded course ID

    const { data, isLoading } = useCourseProgress(courseId);

    if (isLoading) return <ActivityIndicator />;
    if (!data) return <Text>No data</Text>;

    return (
        <View>
            <Text>Progress for Course {data.courseId}</Text>
            <Text>Enrolled: {new Date(data.enrolledAt).toLocaleDateString()}</Text>
        </View>
    );
};

/**
 * Example: Conditional fetching (only when user is enrolled)
 */
export const ConditionalProgressExample = () => {
    const { activeCourseId, enrolledCourseIds } = useCourseStore();

    // Only fetch if user is enrolled in the active course
    const isEnrolled = activeCourseId && enrolledCourseIds.includes(activeCourseId);

    const { data } = useCourseProgress(isEnrolled ? activeCourseId : null);

    if (!isEnrolled) {
        return <Text>Not enrolled in any course</Text>;
    }

    return (
        <View>
            <Text>Current Level: {data?.currentLevelId || 'Not started'}</Text>
        </View>
    );
};
