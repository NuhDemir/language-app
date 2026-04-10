// src/features/courses/screens/CourseListScreen.tsx
// Screen for browsing and enrolling in courses
// Refactored with SOLID principles - Single Responsibility

import React from 'react';
import { View, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { useCourses, useEnrollCourse } from '../api';
import { useCourseStore } from '../stores';
import { CourseBasic } from '../types';
import { Typography as AppText } from '../../../components/ui/Typography';
import { LoadingState, EmptyState, ErrorState } from '../components/molecules';
import { CourseCardContent } from '../components/molecules/CourseCardContent';
import { layoutStyles, courseCardStyles, buttonStyles } from '../styles';

export const CourseListScreen = () => {
    const router = useRouter();
    const { data: courses, isLoading, isError, refetch } = useCourses();
    const enrollMutation = useEnrollCourse();
    const { setActiveCourse, enrolledCourseIds } = useCourseStore();

    const handleEnroll = async (courseId: string) => {
        const numericId = parseInt(courseId);

        // Validate course ID
        if (isNaN(numericId)) {
            Toast.show({
                type: 'error',
                text1: 'Invalid Course',
                text2: 'Please select a valid course',
            });
            return;
        }

        // Check if already enrolled
        if (enrolledCourseIds.includes(numericId)) {
            Toast.show({
                type: 'info',
                text1: 'Already Enrolled',
                text2: 'You are already enrolled in this course',
            });
            return;
        }

        try {
            await enrollMutation.mutateAsync(numericId);
            setActiveCourse(numericId);

            Toast.show({
                type: 'success',
                text1: 'Enrolled Successfully!',
                text2: 'Start learning now',
            });

            // Navigate to Learn screen
            router.push('/learn');
        } catch (error: any) {
            const statusCode = error?.statusCode;

            if (statusCode === 409) {
                Toast.show({
                    type: 'info',
                    text1: 'Already Enrolled',
                    text2: 'You are already enrolled in this course',
                });
            } else if (statusCode === 404) {
                Toast.show({
                    type: 'error',
                    text1: 'Course Not Found',
                    text2: 'This course does not exist',
                });
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Enrollment Failed',
                    text2: 'Please check your connection and try again',
                });
            }
        }
    };

    const renderCourseCard = ({ item }: { item: CourseBasic }) => {
        const isEnrolled = enrolledCourseIds.includes(parseInt(item.id));

        return (
            <View style={courseCardStyles.card}>
                <CourseCardContent
                    title={item.title}
                    description={item.description || undefined}
                    learningLangCode={item.learningLangCode}
                    fromLangCode={item.fromLangCode}
                    phase={item.phase}
                    isEnrolled={isEnrolled}
                />

                {!isEnrolled && (
                    <TouchableOpacity
                        style={buttonStyles.enrollButton}
                        onPress={() => handleEnroll(item.id)}
                        disabled={enrollMutation.isPending}
                    >
                        <AppText style={buttonStyles.enrollButtonText}>
                            {enrollMutation.isPending ? 'Enrolling...' : 'Enroll'}
                        </AppText>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    if (isLoading) {
        return <LoadingState message="Loading courses..." />;
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

    if (!courses || courses.length === 0) {
        return (
            <EmptyState
                emoji="📚"
                title="No Courses Available"
                message="Check back later for new courses"
            />
        );
    }

    return (
        <View style={layoutStyles.container}>
            <FlatList
                data={courses}
                renderItem={renderCourseCard}
                keyExtractor={(item) => item.id}
                contentContainerStyle={layoutStyles.listContent}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};
