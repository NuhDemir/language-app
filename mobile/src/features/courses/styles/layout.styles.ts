// Layout Styles - Modular & Reusable
import { StyleSheet } from 'react-native';
import { Theme } from '../../../styles/theme';
import { Spacing } from '../../../styles/variables/spacing';

export const layoutStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.background.app,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xl,
        backgroundColor: Theme.background.app,
    },
    listContent: {
        padding: Spacing.l,
    },
    emptyState: {
        alignItems: 'center',
        padding: Spacing.xl,
    },
    emptyEmoji: {
        fontSize: 64,
        marginBottom: Spacing.l,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: Theme.text.primary,
        marginBottom: Spacing.s,
        textAlign: 'center',
    },
    emptyText: {
        fontSize: 14,
        color: Theme.text.secondary,
        textAlign: 'center',
        marginBottom: Spacing.xl,
        lineHeight: 20,
    },
    loadingText: {
        marginTop: Spacing.l,
        fontSize: 16,
        color: Theme.text.secondary,
    },
    errorEmoji: {
        fontSize: 64,
        marginBottom: Spacing.l,
    },
    errorTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: Theme.text.primary,
        marginBottom: Spacing.s,
        textAlign: 'center',
    },
    errorText: {
        fontSize: 14,
        color: Theme.text.secondary,
        textAlign: 'center',
        marginBottom: Spacing.xl,
        lineHeight: 20,
    },
});
