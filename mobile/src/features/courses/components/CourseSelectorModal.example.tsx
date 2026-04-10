// src/features/courses/components/CourseSelectorModal.example.tsx
// Example usage of CourseSelectorModal component

import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import { CourseSelectorModal } from './CourseSelectorModal';
import { useCourseStore } from '../stores';
import { AppText } from '../../../components/ui';
import { Theme } from '../../../styles/theme';
import { Spacing } from '../../../styles/variables/spacing';
import { Radius } from '../../../styles/variables/radius';

/**
 * Example 1: Basic Usage
 * 
 * This example shows the most basic usage of the CourseSelectorModal.
 * It displays a button that opens the modal, and handles course selection.
 */
export const BasicExample = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const { activeCourseId, setActiveCourse } = useCourseStore();

    const handleSelectCourse = (courseId: string) => {
        const numericId = parseInt(courseId);
        setActiveCourse(numericId);

        Toast.show({
            type: 'success',
            text1: 'Course Switched',
            text2: 'Continue learning!',
        });
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.button}
                onPress={() => setModalVisible(true)}
            >
                <AppText style={styles.buttonText}>Switch Course</AppText>
            </TouchableOpacity>

            <CourseSelectorModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSelectCourse={handleSelectCourse}
                currentCourseId={activeCourseId?.toString() || null}
            />
        </View>
    );
};

/**
 * Example 2: With Navigation
 * 
 * This example shows how to use the modal with navigation.
 * After selecting a course, it navigates to the Learn screen.
 */
export const WithNavigationExample = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const { activeCourseId, setActiveCourse } = useCourseStore();
    // In a real app, you would use: const router = useRouter();

    const handleSelectCourse = (courseId: string) => {
        const numericId = parseInt(courseId);
        setActiveCourse(numericId);

        Toast.show({
            type: 'success',
            text1: 'Course Switched',
            text2: 'Continue learning!',
        });

        // Navigate to Learn screen
        // router.push('/learn');
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.button}
                onPress={() => setModalVisible(true)}
            >
                <AppText style={styles.buttonText}>Switch Course</AppText>
            </TouchableOpacity>

            <CourseSelectorModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSelectCourse={handleSelectCourse}
                currentCourseId={activeCourseId?.toString() || null}
            />
        </View>
    );
};

/**
 * Example 3: In Header
 * 
 * This example shows how to integrate the modal into a screen header.
 * This is useful for the LearnScreen where users can quickly switch courses.
 */
export const InHeaderExample = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const { activeCourseId, setActiveCourse } = useCourseStore();

    const handleSelectCourse = (courseId: string) => {
        const numericId = parseInt(courseId);
        setActiveCourse(numericId);

        Toast.show({
            type: 'success',
            text1: 'Course Switched',
            text2: 'Continue learning!',
        });
    };

    return (
        <View style={styles.headerContainer}>
            {/* Header with course selector button */}
            <View style={styles.header}>
                <AppText style={styles.headerTitle}>Learn</AppText>
                <TouchableOpacity
                    style={styles.headerButton}
                    onPress={() => setModalVisible(true)}
                >
                    <AppText style={styles.headerButtonText}>Switch</AppText>
                </TouchableOpacity>
            </View>

            {/* Course content would go here */}
            <View style={styles.content}>
                <AppText style={styles.contentText}>Course content...</AppText>
            </View>

            <CourseSelectorModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSelectCourse={handleSelectCourse}
                currentCourseId={activeCourseId?.toString() || null}
            />
        </View>
    );
};

/**
 * Example 4: With Custom Styling
 * 
 * This example shows how the modal adapts to different screen sizes
 * and maintains consistent styling with the design system.
 */
export const CustomStylingExample = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const { activeCourseId, setActiveCourse } = useCourseStore();

    const handleSelectCourse = (courseId: string) => {
        const numericId = parseInt(courseId);
        setActiveCourse(numericId);

        Toast.show({
            type: 'success',
            text1: 'Course Switched',
            text2: 'Continue learning!',
        });
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={[styles.button, styles.customButton]}
                onPress={() => setModalVisible(true)}
            >
                <AppText style={styles.buttonText}>🌍 Switch Course</AppText>
            </TouchableOpacity>

            <CourseSelectorModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSelectCourse={handleSelectCourse}
                currentCourseId={activeCourseId?.toString() || null}
            />
        </View>
    );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Theme.background.app,
        padding: Spacing.xl,
    },
    button: {
        backgroundColor: Theme.primary.main,
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.m,
        borderRadius: Radius.m,
    },
    buttonText: {
        color: Theme.text.inverse,
        fontSize: 16,
        fontWeight: '600',
    },
    customButton: {
        backgroundColor: Theme.primary.dark,
        paddingHorizontal: Spacing.xxl,
        paddingVertical: Spacing.l,
        borderRadius: Radius.l,
    },
    headerContainer: {
        flex: 1,
        backgroundColor: Theme.background.app,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.l,
        borderBottomWidth: 1,
        borderBottomColor: Theme.border.subtle,
        backgroundColor: Theme.background.paper,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: Theme.text.primary,
    },
    headerButton: {
        backgroundColor: Theme.primary.light,
        paddingHorizontal: Spacing.m,
        paddingVertical: Spacing.s,
        borderRadius: Radius.s,
    },
    headerButtonText: {
        color: Theme.primary.dark,
        fontSize: 14,
        fontWeight: '600',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentText: {
        fontSize: 16,
        color: Theme.text.secondary,
    },
});

/**
 * Usage Notes:
 * 
 * 1. The modal automatically fetches enrolled courses using the useMyCourses hook
 * 2. It highlights the currently active course with a badge
 * 3. It displays progress information for each course
 * 4. It closes automatically when a course is selected
 * 5. It handles loading and empty states gracefully
 * 6. It's responsive and adapts to tablet screens
 * 
 * Props:
 * - visible: boolean - Controls modal visibility
 * - onClose: () => void - Called when modal should close
 * - onSelectCourse: (courseId: string) => void - Called when a course is selected
 * - currentCourseId: string | null - ID of the currently active course
 * 
 * Integration with LearnScreen:
 * 
 * ```typescript
 * import { CourseSelectorModal } from '@/features/courses/components';
 * 
 * export const LearnScreen = () => {
 *   const [showSelector, setShowSelector] = useState(false);
 *   const { activeCourseId, setActiveCourse } = useCourseStore();
 *   const router = useRouter();
 * 
 *   const handleSelectCourse = (courseId: string) => {
 *     setActiveCourse(parseInt(courseId));
 *     Toast.show({
 *       type: 'success',
 *       text1: 'Course Switched',
 *       text2: 'Continue learning!',
 *     });
 *   };
 * 
 *   return (
 *     <View>
 *       <CourseMapHeader
 *         title="Learn"
 *         onMenuPress={() => setShowSelector(true)}
 *       />
 *       
 *       <CourseSelectorModal
 *         visible={showSelector}
 *         onClose={() => setShowSelector(false)}
 *         onSelectCourse={handleSelectCourse}
 *         currentCourseId={activeCourseId?.toString() || null}
 *       />
 *     </View>
 *   );
 * };
 * ```
 */
