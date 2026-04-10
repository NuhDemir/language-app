// Badge Styles - Modular & Reusable
import { StyleSheet } from 'react-native';
import { Theme } from '../../../styles/theme';
import { Spacing } from '../../../styles/variables/spacing';

export const badgeStyles = StyleSheet.create({
    badge: {
        paddingHorizontal: Spacing.s,
        paddingVertical: Spacing.xs,
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
    enrolledBadge: {
        backgroundColor: Theme.success.light,
    },
    enrolledText: {
        fontSize: 12,
        fontWeight: '600',
        color: Theme.success.main,
    },
    activeBadge: {
        backgroundColor: Theme.primary.light,
    },
    activeText: {
        fontSize: 12,
        fontWeight: '600',
        color: Theme.primary.dark,
    },
    betaBadge: {
        backgroundColor: Theme.warning.light,
    },
    betaText: {
        fontSize: 12,
        fontWeight: '600',
        color: Theme.warning.dark,
    },
    liveBadge: {
        backgroundColor: Theme.success.light,
    },
    liveText: {
        fontSize: 12,
        fontWeight: '600',
        color: Theme.success.main,
    },
});
