import { AuthProvider, useAuth } from '@/context/AuthContext';
import { Stack, useRouter, useSegments } from 'expo-router';
import React, { useEffect } from 'react';

const RootNavigator = () => {
  const { user } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === 'auth';
    const inTabs = segments[0] === '(tabs)';

    if (!user && !inAuthGroup) {
      router.replace('/auth/welcome');
    } else if (user && (inAuthGroup || segments.length === 0)) {
      router.replace('/(tabs)');
    }
  }, [user, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="auth" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="gasto" />
    </Stack>
  );
};

const RootLayout = () => {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
};

export default RootLayout;
