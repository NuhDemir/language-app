// Course Card Styles - Modular & Reusable
import { StyleSheet } from 'react-native';
import { Theme } from '../../../styles/theme';
import { Spacing } from '../../../styles/variables/spacing';

export const courseCardStyles = StyleSheet.create({
    card: {
        backgroundColor: Theme.background.paper,
        borderRadius: 12,
        padding: Spacing.l,
        marginBottom: Spacing.l,
        borderWidth: 1,
        borderColor: Theme.border.subtle,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    activeCard: {
        borderColor: Theme.primary.main,
        borderWidth: 2,
        shadowColor: Theme.primary.main,
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.s,
    },
    courseTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: Theme.text.primary,
        flex: 1,
        lineHeight: 24,
    },
    courseDescription: {
        fontSize: 14,
        color: Theme.text.secondary,
        lineHeight: 20,
        marginBottom: Spacing.m,
    },
    languageInfo: {
        marginBottom: Spacing.l,
    },
    languageRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.xs,
    },
    languageText: {
        fontSize: 14,
        color: Theme.text.secondary,
        marginBottom: Spacing.xs,
    },
    phaseText: {
        fontSize: 12,
        color: Theme.text.disabled,
    },
});
