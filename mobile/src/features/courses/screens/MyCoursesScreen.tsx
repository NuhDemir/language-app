// src/features/courses/screens/MyCoursesScreen.tsx
// Screen for viewing enrolled courses and managing active course
// Refactored with SOLID principles - Single Responsibility

import React from 'react';
import { View, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { useMyCourses } from '../api';
import { useCourseStore } from '../stores';
import { MyCourse } from '../types';
import { Typography as AppText } from '../../../components/ui/Typography';
import { LoadingState, EmptyState, ErrorState } from '../components/molecules';
import { CourseCardContent, CourseProgress } from '../components/molecules';
import { layoutStyles, courseCardStyles, buttonStyles } from '../styles';

export const MyCoursesScreen = () => {
    const router = useRouter();
    const { data: myCourses, isLoading, isError, refetch } = useMyCourses();
    const { activeCourseId, setActiveCourse } = useCourseStore();

    const handleSwitchActive = (courseId: string) => {
        const numericId = parseInt(courseId);
        setActiveCourse(numericId);

        Toast.show({
            type: 'success',
            text1: 'Course Switched',
            text2: 'Continue learning!',
        });

        router.push('/learn');
    };

    const handleContinueLearning = () => {
        router.push('/learn');
    };

    const renderCourseCard = ({ item }: { item: MyCourse }) => {
        const isActive = parseInt(item.id) === activeCourseId;

        return (
            <View style={[courseCardStyles.card, isActive && courseCardStyles.activeCard]}>
                <CourseCardContent
                    title={item.title}
                    learningLangCode={item.learningLangCode}
                    fromLangCode={item.fromLangCode}
                    phase={item.phase}
                    isActive={isActive}
                />

                <CourseProgress
                    completedLevels={item.progress.completedLevels}
                    totalLevels={item.progress.totalLevels}
                    totalXp={item.progress.totalXp}
                />

                {isActive ? (
                    <TouchableOpacity
                        style={buttonStyles.continueButton}
                        onPress={handleContinueLearning}
                    >
                        <AppText style={buttonStyles.continueButtonText}>Continue Learning</AppText>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={buttonStyles.switchButton}
                        onPress={() => handleSwitchActive(item.id)}
                    >
                        <AppText style={buttonStyles.switchButtonText}>Switch to This Course</AppText>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    if (isLoading) {
        return <LoadingState message="Loading your courses..." />;
    }

    if (isError) {
        return (
            <ErrorState
                title="Failed to Load Courses"
                message="Please check your connection and try again"
                onRetry={refetch}
            />
        );
    }

    if (!myCourses || myCourses.length === 0) {
        return (
            <EmptyState
                emoji="🌍"
                title="No Enrolled Courses"
                message="Browse courses and enroll to start learning"
                actionText="Browse Courses"
                onAction={() => router.push('/courses/list')}
            />
        );
    }

    return (
        <View style={layoutStyles.container}>
            <FlatList
                data={myCourses}
                renderItem={renderCourseCard}
                keyExtractor={(item) => item.id}
                contentContainerStyle={layoutStyles.listContent}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};
