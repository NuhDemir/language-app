// app/(app)/courses/my-courses.tsx
// Route for my courses screen

import React from 'react';
import { Stack } from 'expo-router';
import { MyCoursesScreen } from '../../../src/features/courses/screens';

export default function MyCoursesRoute() {
    return (
        <>
            <Stack.Screen
                options={{
                    title: 'My Courses',
                    headerShown: true,
                }}
            />
            <MyCoursesScreen />
        </>
    );
}
