import React, { useEffect } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';

import ThemedAlert from '@/components/ThemedAlert';
import ThemedBackButton from '@/components/ThemedBackButton';
import HeaderQuickActions from '@/components/HeaderQuickActions';

import { Provider } from 'react-redux';
import { store } from '@/store';

import { useColorScheme } from '@/hooks/useColorScheme';
import { getHeaderTitle } from '@/utils/utils';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <Provider store={store}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <ThemedAlert>
          <Stack
            screenOptions={({ route }) => ({
              title: getHeaderTitle(route.name),
              headerTitleStyle: {
                fontWeight: 'bold',
              },
              headerStyle: {
                backgroundColor: '#6235b6',
              },
              headerShadowVisible: false,
              headerTintColor: '#fff',
              headerBackVisible: false,
              headerLeft: () => <ThemedBackButton />,
              headerRight: () => <HeaderQuickActions />,
            })}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
        </ThemedAlert>
      </ThemeProvider>
    </Provider>
  );
}
