// src/features/courses/components/CourseCard.tsx
// Reusable course card component for displaying course information

import React, { memo, useCallback } from 'react';
import {
    View,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
} from 'react-native';

import { COLORS, SPACING, FONT_SIZES, RADIUS, FONTS } from '../../../constants/theme';
import { AppText } from '../../../components/ui';
import type { CourseBasic, MyCourse } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isTablet = SCREEN_WIDTH >= 768;

// ============================================================================
// TYPES
// ============================================================================

export interface CourseCardProps {
    course: CourseBasic | MyCourse;
    variant: 'list' | 'enrolled' | 'selector';
    onPress?: () => void;
    onEnroll?: () => void;
    onSwitchActive?: () => void;
    isActive?: boolean;
    isEnrolled?: boolean;
    isLoading?: boolean;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const isMyCourse = (course: CourseBasic | MyCourse): course is MyCourse => {
    return 'progress' in course && 'enrolledAt' in course;
};

const getLanguageFlag = (langCode: string): string => {
    const flagMap: Record<string, string> = {
        en: '🇬🇧',
        tr: '🇹🇷',
        es: '🇪🇸',
        fr: '🇫🇷',
        de: '🇩🇪',
        it: '🇮🇹',
        pt: '🇵🇹',
        ru: '🇷🇺',
        ja: '🇯🇵',
        ko: '🇰🇷',
        zh: '🇨🇳',
        ar: '🇸🇦',
    };
    return flagMap[langCode.toLowerCase()] || '🌍';
};

// ============================================================================
// LIST VARIANT (Course browsing)
// ============================================================================

interface ListVariantProps {
    course: CourseBasic;
    onEnroll?: () => void;
    isEnrolled?: boolean;
    isLoading?: boolean;
}

const ListVariant: React.FC<ListVariantProps> = memo(({
    course,
    onEnroll,
    isEnrolled,
    isLoading,
}) => {
    const handleEnroll = useCallback(() => {
        onEnroll?.();
    }, [onEnroll]);

    return (
        <View style={styles.listCard}>
            <View style={styles.cardHeader}>
                <View style={styles.titleContainer}>
                    <AppText style={styles.courseTitle}>{course.title}</AppText>
                    {isEnrolled && (
                        <View style={styles.enrolledBadge}>
                            <AppText style={styles.enrolledText}>Enrolled</AppText>
                        </View>
                    )}
                </View>
            </View>

            <View style={styles.languageRow}>
                <AppText style={styles.languageFlag}>
                    {getLanguageFlag(course.learningLangCode)}
                </AppText>
                <AppText style={styles.languageText}>
                    Learning {course.learningLangCode.toUpperCase()}
                </AppText>
                <AppText style={styles.languageSeparator}>•</AppText>
                <AppText style={styles.languageFlag}>
                    {getLanguageFlag(course.fromLangCode)}
                </AppText>
                <AppText style={styles.languageText}>
                    From {course.fromLangCode.toUpperCase()}
                </AppText>
            </View>

            <View style={styles.phaseContainer}>
                <AppText style={styles.phaseText}>Phase: {course.phase}</AppText>
            </View>

            {!isEnrolled && (
                <TouchableOpacity
                    style={[styles.enrollButton, isLoading && styles.enrollButtonDisabled]}
                    onPress={handleEnroll}
                    disabled={isLoading}
                    activeOpacity={0.8}
                >
                    <AppText style={styles.enrollButtonText}>
                        {isLoading ? 'Enrolling...' : 'Enroll'}
                    </AppText>
                </TouchableOpacity>
            )}
        </View>
    );
});

ListVariant.displayName = 'ListVariant';

// ============================================================================
// ENROLLED VARIANT (My courses)
// ============================================================================

interface EnrolledVariantProps {
    course: MyCourse;
    onPress?: () => void;
    onSwitchActive?: () => void;
    isActive?: boolean;
}

const EnrolledVariant: React.FC<EnrolledVariantProps> = memo(({
    course,
    onPress,
    onSwitchActive,
    isActive,
}) => {
    const progressPercent = course.progress.totalLevels > 0
        ? Math.round((course.progress.completedLevels / course.progress.totalLevels) * 100)
        : 0;

    const handlePress = useCallback(() => {
        onPress?.();
    }, [onPress]);

    const handleSwitch = useCallback(() => {
        onSwitchActive?.();
    }, [onSwitchActive]);

    return (
        <View style={[styles.enrolledCard, isActive && styles.activeCard]}>
            <View style={styles.cardHeader}>
                <View style={styles.titleContainer}>
                    <AppText style={styles.courseTitle}>{course.title}</AppText>
                    {isActive && (
                        <View style={styles.activeBadge}>
                            <AppText style={styles.activeText}>Active</AppText>
                        </View>
                    )}
                </View>
            </View>

            <View style={styles.languageRow}>
                <AppText style={styles.languageFlag}>
                    {getLanguageFlag(course.learningLangCode)}
                </AppText>
                <AppText style={styles.languageText}>
                    {course.learningLangCode.toUpperCase()}
                </AppText>
                <AppText style={styles.languageSeparator}>→</AppText>
                <AppText style={styles.languageFlag}>
                    {getLanguageFlag(course.fromLangCode)}
                </AppText>
                <AppText style={styles.languageText}>
                    {course.fromLangCode.toUpperCase()}
                </AppText>
            </View>

            {/* Progress Section */}
            <View style={styles.progressSection}>
                <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
                </View>
                <View style={styles.progressInfo}>
                    <AppText style={styles.progressText}>
                        {course.progress.completedLevels} / {course.progress.totalLevels} levels
                    </AppText>
                    <AppText style={styles.progressPercent}>{progressPercent}%</AppText>
                </View>
            </View>

            {/* Stats Row */}
            <View style={styles.statsRow}>
                <View style={styles.statItem}>
                    <AppText style={styles.statValue}>{course.progress.totalXp}</AppText>
                    <AppText style={styles.statLabel}>XP</AppText>
                </View>
                <View style={styles.statItem}>
                    <AppText style={styles.statValue}>{course.progress.completedLevels}</AppText>
                    <AppText style={styles.statLabel}>Completed</AppText>
                </View>
            </View>

            {/* Action Button */}
            {isActive ? (
                <TouchableOpacity
                    style={styles.continueButton}
                    onPress={handlePress}
                    activeOpacity={0.8}
                >
                    <AppText style={styles.continueButtonText}>Continue Learning</AppText>
                </TouchableOpacity>
            ) : (
                <TouchableOpacity
                    style={styles.switchButton}
                    onPress={handleSwitch}
                    activeOpacity={0.8}
                >
                    <AppText style={styles.switchButtonText}>Switch to This Course</AppText>
                </TouchableOpacity>
            )}
        </View>
    );
});

EnrolledVariant.displayName = 'EnrolledVariant';

// ============================================================================
// SELECTOR VARIANT (Modal quick switcher)
// ============================================================================

interface SelectorVariantProps {
    course: MyCourse;
    onPress?: () => void;
    isActive?: boolean;
}

const SelectorVariant: React.FC<SelectorVariantProps> = memo(({
    course,
    onPress,
    isActive,
}) => {
    const handlePress = useCallback(() => {
        onPress?.();
    }, [onPress]);

    return (
        <TouchableOpacity
            style={[styles.selectorCard, isActive && styles.selectorActiveCard]}
            onPress={handlePress}
            activeOpacity={0.7}
        >
            <View style={styles.selectorContent}>
                <View style={styles.selectorLeft}>
                    <View style={styles.languageFlags}>
                        <AppText style={styles.selectorFlag}>
                            {getLanguageFlag(course.learningLangCode)}
                        </AppText>
                        <AppText style={styles.selectorFlag}>
                            {getLanguageFlag(course.fromLangCode)}
                        </AppText>
                    </View>
                    <View style={styles.selectorInfo}>
                        <AppText style={styles.selectorTitle}>{course.title}</AppText>
                        <AppText style={styles.selectorSubtitle}>
                            {course.progress.completedLevels} / {course.progress.totalLevels} levels
                        </AppText>
                    </View>
                </View>
                {isActive && (
                    <View style={styles.selectorCheckmark}>
                        <AppText style={styles.checkmarkText}>✓</AppText>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
});

SelectorVariant.displayName = 'SelectorVariant';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const CourseCardComponent: React.FC<CourseCardProps> = ({
    course,
    variant,
    onPress,
    onEnroll,
    onSwitchActive,
    isActive,
    isEnrolled,
    isLoading,
}) => {
    switch (variant) {
        case 'list':
            return (
                <ListVariant
                    course={course}
                    onEnroll={onEnroll}
                    isEnrolled={isEnrolled}
                    isLoading={isLoading}
                />
            );
        case 'enrolled':
            if (!isMyCourse(course)) {
                console.warn('CourseCard: enrolled variant requires MyCourse type');
                return null;
            }
            return (
                <EnrolledVariant
                    course={course}
                    onPress={onPress}
                    onSwitchActive={onSwitchActive}
                    isActive={isActive}
                />
            );
        case 'selector':
            if (!isMyCourse(course)) {
                console.warn('CourseCard: selector variant requires MyCourse type');
                return null;
            }
            return (
                <SelectorVariant
                    course={course}
                    onPress={onPress}
                    isActive={isActive}
                />
            );
        default:
            return null;
    }
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
    // List Variant
    listCard: {
        backgroundColor: COLORS.neutral.surface,
        borderRadius: RADIUS.lg,
        padding: isTablet ? SPACING.xl : SPACING.lg,
        marginHorizontal: isTablet ? SPACING.xl : SPACING.md,
        marginVertical: SPACING.sm,
        borderWidth: 1,
        borderColor: COLORS.neutral.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cardHeader: {
        marginBottom: SPACING.sm,
    },
    titleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    courseTitle: {
        fontFamily: FONTS.heading,
        fontSize: isTablet ? FONT_SIZES.xl : FONT_SIZES.lg,
        fontWeight: '600',
        color: COLORS.neutral.title,
        flex: 1,
        marginRight: SPACING.sm,
    },
    enrolledBadge: {
        backgroundColor: COLORS.success.bg,
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.xs,
        borderRadius: RADIUS.sm,
    },
    enrolledText: {
        fontFamily: FONTS.semibold,
        fontSize: FONT_SIZES.xs,
        fontWeight: '600',
        color: COLORS.success.text,
    },
    languageRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    languageFlag: {
        fontSize: isTablet ? FONT_SIZES.lg : FONT_SIZES.md,
        marginRight: SPACING.xs,
    },
    languageText: {
        fontFamily: FONTS.medium,
        fontSize: isTablet ? FONT_SIZES.md : FONT_SIZES.sm,
        color: COLORS.neutral.body,
        marginRight: SPACING.xs,
    },
    languageSeparator: {
        fontFamily: FONTS.medium,
        fontSize: isTablet ? FONT_SIZES.md : FONT_SIZES.sm,
        color: COLORS.neutral.border,
        marginHorizontal: SPACING.xs,
    },
    phaseContainer: {
        marginBottom: SPACING.md,
    },
    phaseText: {
        fontFamily: FONTS.medium,
        fontSize: FONT_SIZES.xs,
        color: COLORS.neutral.locked,
    },
    enrollButton: {
        backgroundColor: COLORS.primary.main,
        paddingVertical: isTablet ? SPACING.md : SPACING.sm,
        borderRadius: RADIUS.md,
        alignItems: 'center',
    },
    enrollButtonDisabled: {
        opacity: 0.6,
    },
    enrollButtonText: {
        fontFamily: FONTS.heading,
        fontSize: isTablet ? FONT_SIZES.lg : FONT_SIZES.md,
        fontWeight: '600',
        color: '#FFFFFF',
    },

    // Enrolled Variant
    enrolledCard: {
        backgroundColor: COLORS.neutral.surface,
        borderRadius: RADIUS.lg,
        padding: isTablet ? SPACING.xl : SPACING.lg,
        marginHorizontal: isTablet ? SPACING.xl : SPACING.md,
        marginVertical: SPACING.sm,
        borderWidth: 1,
        borderColor: COLORS.neutral.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    activeCard: {
        borderColor: COLORS.primary.main,
        borderWidth: 2,
        shadowColor: COLORS.primary.shadow,
        shadowOpacity: 0.15,
    },
    activeBadge: {
        backgroundColor: COLORS.primary.light,
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.xs,
        borderRadius: RADIUS.sm,
    },
    activeText: {
        fontFamily: FONTS.semibold,
        fontSize: FONT_SIZES.xs,
        fontWeight: '600',
        color: COLORS.primary.main,
    },
    progressSection: {
        marginVertical: SPACING.md,
    },
    progressBar: {
        height: 8,
        backgroundColor: COLORS.neutral.border,
        borderRadius: RADIUS.sm,
        overflow: 'hidden',
        marginBottom: SPACING.xs,
    },
    progressFill: {
        height: '100%',
        backgroundColor: COLORS.primary.main,
        borderRadius: RADIUS.sm,
    },
    progressInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    progressText: {
        fontFamily: FONTS.medium,
        fontSize: FONT_SIZES.xs,
        color: COLORS.neutral.body,
    },
    progressPercent: {
        fontFamily: FONTS.semibold,
        fontSize: FONT_SIZES.xs,
        fontWeight: '600',
        color: COLORS.primary.main,
    },
    statsRow: {
        flexDirection: 'row',
        marginBottom: SPACING.md,
    },
    statItem: {
        marginRight: isTablet ? SPACING.xxl : SPACING.xl,
    },
    statValue: {
        fontFamily: FONTS.heading,
        fontSize: isTablet ? FONT_SIZES.xxl : FONT_SIZES.xl,
        fontWeight: '700',
        color: COLORS.neutral.title,
    },
    statLabel: {
        fontFamily: FONTS.medium,
        fontSize: FONT_SIZES.xs,
        color: COLORS.neutral.body,
    },
    continueButton: {
        backgroundColor: COLORS.primary.main,
        paddingVertical: isTablet ? SPACING.md : SPACING.sm,
        borderRadius: RADIUS.md,
        alignItems: 'center',
    },
    continueButtonText: {
        fontFamily: FONTS.heading,
        fontSize: isTablet ? FONT_SIZES.lg : FONT_SIZES.md,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    switchButton: {
        backgroundColor: COLORS.neutral.surface,
        paddingVertical: isTablet ? SPACING.md : SPACING.sm,
        borderRadius: RADIUS.md,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.neutral.border,
    },
    switchButtonText: {
        fontFamily: FONTS.heading,
        fontSize: isTablet ? FONT_SIZES.lg : FONT_SIZES.md,
        fontWeight: '600',
        color: COLORS.neutral.title,
    },

    // Selector Variant
    selectorCard: {
        backgroundColor: COLORS.neutral.surface,
        borderRadius: RADIUS.md,
        padding: isTablet ? SPACING.lg : SPACING.md,
        marginVertical: SPACING.xs,
        borderWidth: 1,
        borderColor: COLORS.neutral.border,
    },
    selectorActiveCard: {
        backgroundColor: COLORS.primary.light,
        borderColor: COLORS.primary.main,
        borderWidth: 2,
    },
    selectorContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    selectorLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    languageFlags: {
        flexDirection: 'row',
        marginRight: SPACING.sm,
    },
    selectorFlag: {
        fontSize: isTablet ? FONT_SIZES.xl : FONT_SIZES.lg,
        marginRight: SPACING.xs,
    },
    selectorInfo: {
        flex: 1,
    },
    selectorTitle: {
        fontFamily: FONTS.heading,
        fontSize: isTablet ? FONT_SIZES.lg : FONT_SIZES.md,
        fontWeight: '600',
        color: COLORS.neutral.title,
        marginBottom: SPACING.xs,
    },
    selectorSubtitle: {
        fontFamily: FONTS.medium,
        fontSize: FONT_SIZES.xs,
        color: COLORS.neutral.body,
    },
    selectorCheckmark: {
        width: isTablet ? 28 : 24,
        height: isTablet ? 28 : 24,
        borderRadius: RADIUS.full,
        backgroundColor: COLORS.primary.main,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkmarkText: {
        color: '#FFFFFF',
        fontSize: isTablet ? FONT_SIZES.md : FONT_SIZES.sm,
        fontWeight: '700',
    },
});

// ============================================================================
// EXPORT
// ============================================================================

export const CourseCard = memo(CourseCardComponent);
