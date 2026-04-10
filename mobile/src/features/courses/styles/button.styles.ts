// Button Styles - Modular & Reusable
import { StyleSheet } from 'react-native';
import { Theme } from '../../../styles/theme';
import { Spacing } from '../../../styles/variables/spacing';

export const buttonStyles = StyleSheet.create({
    primaryButton: {
        backgroundColor: Theme.primary.main,
        paddingVertical: Spacing.s,
        paddingHorizontal: Spacing.l,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 44,
    },
    primaryButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: Theme.text.inverse,
    },
    secondaryButton: {
        backgroundColor: Theme.clay.cardBg,
        paddingVertical: Spacing.s,
        paddingHorizontal: Spacing.l,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: Theme.border.subtle,
        minHeight: 44,
    },
    secondaryButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: Theme.text.primary,
    },
    disabledButton: {
        opacity: 0.5,
    },
    enrollButton: {
        backgroundColor: Theme.primary.main,
        paddingVertical: Spacing.s,
        borderRadius: 8,
        alignItems: 'center',
    },
    enrollButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: Theme.text.inverse,
    },
    continueButton: {
        backgroundColor: Theme.primary.main,
        paddingVertical: Spacing.s,
        borderRadius: 8,
        alignItems: 'center',
    },
    continueButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: Theme.text.inverse,
    },
    switchButton: {
        backgroundColor: Theme.clay.cardBg,
        paddingVertical: Spacing.s,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Theme.border.subtle,
    },
    switchButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: Theme.text.primary,
    },
});
