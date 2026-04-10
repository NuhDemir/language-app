/**
 * useHomeData Hook
 * Business logic for home screen
 * Fetches and transforms user data
 */

import { useMemo } from 'react';
import { useUser } from '../../../stores/auth.store';

export interface HomeData {
    username: string;
    streakDays: number;
    totalXp: number;
    level: number;
    badges: number;
    rank: number;
}

export const useHomeData = (): HomeData => {
    const user = useUser();

    return useMemo(() => ({
        username: user?.username || 'Kullanıcı',
        streakDays: user?.streakDays || 0,
        totalXp: user?.totalXp || 0,
        level: user?.streakDays || 1, // Temporary: use streak as level
        badges: 0, // TODO: Implement badges system
        rank: 0, // TODO: Implement ranking system
    }), [user]);
};
