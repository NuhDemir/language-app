// app/index.tsx
// Entry point - redirects based on auth state

import { Redirect } from 'expo-router';
import { useAuthStore } from '../src/stores/auth.store';

export default function Index() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  if (isAuthenticated) {
    return <Redirect href="/(app)/home" />;
  }
  
  return <Redirect href="/(auth)/login" />;
}
