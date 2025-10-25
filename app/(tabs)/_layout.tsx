import React from 'react';
import { Tabs } from 'expo-router';

import { TabBarIcon } from '@/components/ThemedIcon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarStyle: {
          backgroundColor: '#6235b6',
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 18,
          fontWeight: 'bold',
        },
        tabBarItemStyle: {
          paddingVertical: 1,
          paddingHorizontal: 0,
        },
        tabBarInactiveTintColor: '#fff',
        headerStyle: {
          backgroundColor: '#6235b6',
        },
        headerShadowVisible: false,
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'List',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'list' : 'list-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="master"
        options={{
          title: 'Master',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'server' : 'server-outline'} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
