/**
 * UserHeader - Molecule Component
 * Clean user greeting with logout
 */

import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { LogOut } from 'lucide-react-native';
import { Typography } from '../../../../components/ui/Typography';
import { Spacing, isTablet } from '../../../../styles';

interface UserHeaderProps {
    username: string;
    onLogout: () => void;
}

export const UserHeader = React.memo<UserHeaderProps>(({ username, onLogout }) => {
    const tablet = isTablet();

    return (
        <View style={styles.container}>
            <View style={styles.greetingContainer}>
                <Typography style={[styles.greeting, tablet && styles.greetingTablet]}>
                    Merhaba,
                </Typography>
                <Typography style={[styles.username, tablet && styles.usernameTablet]}>
                    {username}! 👋
                </Typography>
            </View>

            <TouchableOpacity onPress={onLogout} style={styles.logoutButton}>
                <LogOut size={20} color="#64748B" />
            </TouchableOpacity>
        </View>
    );
});

UserHeader.displayName = 'UserHeader';

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    greetingContainer: {
        gap: 4,
    },
    greeting: {
        fontSize: 16,
        color: '#64748B',
        fontWeight: '500',
    },
    greetingTablet: {
        fontSize: 18,
    },
    username: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1E293B',
    },
    usernameTablet: {
        fontSize: 32,
    },
    logoutButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
});
