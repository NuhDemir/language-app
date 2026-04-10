// app/(app)/courses/list.tsx
// Route for course list screen

import React from 'react';
import { Stack } from 'expo-router';
import { CourseListScreen } from '../../../src/features/courses/screens';

export default function CourseListRoute() {
    return (
        <>
            <Stack.Screen
                options={{
                    title: 'Browse Courses',
                    headerShown: true,
                }}
            />
            <CourseListScreen />
        </>
    );
}
