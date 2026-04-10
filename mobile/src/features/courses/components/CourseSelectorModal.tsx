// src/features/courses/components/CourseSelectorModal.tsx
// Modal component for quick course switching
// Displays enrolled courses and allows switching active course

import React, { memo, useCallback } from 'react';
import {
    View,
    Modal,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Dimensions,
    Platform,
} from 'react-native';
import { X } from 'lucide-react-native';

import { Theme } from '../../../styles/theme';
import { Spacing } from '../../../styles/variables/spacing';
import { Radius } from '../../../styles/variables/radius';
import { Typography } from '../../../styles/variables/typography';
import { AppText } from '../../../components/ui';
import { useMyCourses } from '../api';
import { MyCourse } from '../types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const isTablet = SCREEN_WIDTH >= 768;

// ============================================================================
// TYPES
// ============================================================================

interface CourseSelectorModalProps {
    visible: boolean;
    onClose: () => void;
    onSelectCourse: (courseId: string) => void;
    currentCourseId: string | null;
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface CourseItemProps {
    course: MyCourse;
    isActive: boolean;
    onPress: () => void;
}

const CourseItem: React.FC<CourseItemProps> = memo(({ course, isActive, onPress }) => {
    const progressPercent = course.progress.totalLevels > 0
        ? Math.round((course.progress.completedLevels / course.progress.totalLevels) * 100)
        : 0;

    return (
        <TouchableOpacity
            style={[styles.courseItem, isActive && styles.activeCourseItem]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.courseItemHeader}>
                <AppText style={styles.courseTitle} numberOfLines={1}>
                    {course.title}
                </AppText>
                {isActive && (
                    <View style={styles.activeBadge}>
                        <AppText style={styles.activeBadgeText}>Active</AppText>
                    </View>
                )}
            </View>

            <AppText style={styles.languageText}>
                {course.learningLangCode} from {course.fromLangCode}
            </AppText>

            <View style={styles.progressSection}>
                <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
                </View>
                <AppText style={styles.progressText}>
                    {course.progress.completedLevels} / {course.progress.totalLevels} levels • {progressPercent}%
                </AppText>
            </View>
        </TouchableOpacity>
    );
});

CourseItem.displayName = 'CourseItem';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const CourseSelectorModalComponent: React.FC<CourseSelectorModalProps> = ({
    visible,
    onClose,
    onSelectCourse,
    currentCourseId,
}) => {
    const { data: myCourses, isLoading } = useMyCourses();

    const handleSelectCourse = useCallback((courseId: string) => {
        onSelectCourse(courseId);
        onClose();
    }, [onSelectCourse, onClose]);

    const renderCourseItem = useCallback(({ item }: { item: MyCourse }) => {
        const isActive = item.id === currentCourseId;
        return (
            <CourseItem
                course={item}
                isActive={isActive}
                onPress={() => handleSelectCourse(item.id)}
            />
        );
    }, [currentCourseId, handleSelectCourse]);

    const keyExtractor = useCallback((item: MyCourse) => item.id, []);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
            statusBarTranslucent
        >
            <View style={styles.overlay}>
                <TouchableOpacity
                    style={styles.backdrop}
                    activeOpacity={1}
                    onPress={onClose}
                />

                <View style={styles.modalContainer}>
                    {/* Header */}
                    <View style={styles.header}>
                        <AppText style={styles.headerTitle}>Switch Course</AppText>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={onClose}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <X size={isTablet ? 28 : 24} color={Theme.text.primary} strokeWidth={2.5} />
                        </TouchableOpacity>
                    </View>

                    {/* Course List */}
                    {isLoading ? (
                        <View style={styles.loadingContainer}>
                            <AppText style={styles.loadingText}>Loading courses...</AppText>
                        </View>
                    ) : !myCourses || myCourses.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <AppText style={styles.emptyEmoji}>🌍</AppText>
                            <AppText style={styles.emptyText}>No enrolled courses</AppText>
                        </View>
                    ) : (
                        <FlatList
                            data={myCourses}
                            renderItem={renderCourseItem}
                            keyExtractor={keyExtractor}
                            contentContainerStyle={styles.listContent}
                            showsVerticalScrollIndicator={false}
                        />
                    )}
                </View>
            </View>
        </Modal>
    );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    modalContainer: {
        width: isTablet ? SCREEN_WIDTH * 0.6 : SCREEN_WIDTH * 0.9,
        maxHeight: SCREEN_HEIGHT * 0.7,
        backgroundColor: Theme.background.paper,
        borderRadius: isTablet ? Radius.xxl : Radius.xl,
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: Theme.clay.shadow,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.2,
                shadowRadius: 16,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: isTablet ? Spacing.xl : Spacing.l,
        paddingVertical: isTablet ? Spacing.l : Spacing.m,
        borderBottomWidth: 1,
        borderBottomColor: Theme.border.subtle,
        backgroundColor: Theme.background.paper,
    },
    headerTitle: {
        fontFamily: Typography.family.bold,
        fontSize: isTablet ? Typography.size.h2 : Typography.size.h3,
        color: Theme.text.primary,
    },
    closeButton: {
        width: isTablet ? 44 : 40,
        height: isTablet ? 44 : 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: Radius.m,
    },
    listContent: {
        padding: isTablet ? Spacing.l : Spacing.m,
    },
    courseItem: {
        backgroundColor: Theme.background.app,
        borderRadius: Radius.l,
        padding: isTablet ? Spacing.l : Spacing.m,
        marginBottom: Spacing.m,
        borderWidth: 1,
        borderColor: Theme.border.subtle,
    },
    activeCourseItem: {
        borderColor: Theme.primary.main,
        borderWidth: 2,
        backgroundColor: Theme.primary.light,
    },
    courseItemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.xs,
    },
    courseTitle: {
        fontFamily: Typography.family.semiBold,
        fontSize: isTablet ? Typography.size.h3 : Typography.size.h2,
        color: Theme.text.primary,
        flex: 1,
        marginRight: Spacing.s,
    },
    activeBadge: {
        backgroundColor: Theme.primary.main,
        paddingHorizontal: Spacing.s,
        paddingVertical: Spacing.xs,
        borderRadius: Radius.s,
    },
    activeBadgeText: {
        fontFamily: Typography.family.semiBold,
        fontSize: isTablet ? Typography.size.bodyMedium : Typography.size.bodyMedium,
        color: Theme.text.inverse,
    },
    languageText: {
        fontFamily: Typography.family.regular,
        fontSize: isTablet ? Typography.size.bodyMedium : Typography.size.bodyMedium,
        color: Theme.text.secondary,
        marginBottom: Spacing.s,
    },
    progressSection: {
        marginTop: Spacing.xs,
    },
    progressBar: {
        height: 6,
        backgroundColor: Theme.clay.cardBg,
        borderRadius: Radius.s,
        overflow: 'hidden',
        marginBottom: Spacing.xs,
    },
    progressFill: {
        height: '100%',
        backgroundColor: Theme.primary.main,
    },
    progressText: {
        fontFamily: Typography.family.regular,
        fontSize: isTablet ? Typography.size.captionTiny : 10,
        color: Theme.text.secondary,
    },
    loadingContainer: {
        padding: isTablet ? Spacing.xxl : Spacing.xl,
        alignItems: 'center',
    },
    loadingText: {
        fontFamily: Typography.family.regular,
        fontSize: isTablet ? Typography.size.bodyMedium : Typography.size.bodySmall,
        color: Theme.text.secondary,
    },
    emptyContainer: {
        padding: isTablet ? Spacing.xxl : Spacing.xl,
        alignItems: 'center',
    },
    emptyEmoji: {
        fontSize: isTablet ? 64 : 48,
        marginBottom: Spacing.m,
    },
    emptyText: {
        fontFamily: Typography.family.regular,
        fontSize: isTablet ? Typography.size.bodySmall : Typography.size.captionSmall,
        color: Theme.text.secondary,
        textAlign: 'center',
    },
});

// ============================================================================
// EXPORT
// ============================================================================

export const CourseSelectorModal = memo(CourseSelectorModalComponent);
