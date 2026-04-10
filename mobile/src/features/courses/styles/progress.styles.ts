// Progress Styles - Modular & Reusable
import { StyleSheet } from 'react-native';
import { Theme } from '../../../styles/theme';
import { Spacing } from '../../../styles/variables/spacing';

export const progressStyles = StyleSheet.create({
    progressSection: {
        marginBottom: Spacing.l,
    },
    progressBar: {
        height: 8,
        backgroundColor: Theme.clay.cardBg,
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: Spacing.xs,
    },
    progressFill: {
        height: '100%',
        backgroundColor: Theme.primary.main,
        borderRadius: 4,
    },
    progressText: {
        fontSize: 12,
        color: Theme.text.secondary,
        marginTop: Spacing.xs,
    },
    statsRow: {
        flexDirection: 'row',
        marginBottom: Spacing.l,
        flexWrap: 'wrap',
    },
    statItem: {
        marginRight: Spacing.xl,
        marginBottom: Spacing.s,
    },
    statValue: {
        fontSize: 20,
        fontWeight: '600',
        color: Theme.text.primary,
    },
    statLabel: {
        fontSize: 12,
        color: Theme.text.secondary,
        marginTop: 2,
    },
});
