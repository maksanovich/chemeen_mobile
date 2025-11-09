import React from 'react';
import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function HeaderQuickActions() {
    const router = useRouter();

    const goToList = () => {
        router.navigate('/');
    };

    const goToMaster = () => {
        router.navigate('/master');
    };

    return (
        <View style={{ flexDirection: 'row', gap: 12, marginRight: 8 }}>
            <Pressable
                accessibilityRole="button"
                onPress={goToList}
                hitSlop={8}
                style={{ padding: 4 }}
            >
                <Ionicons name="list-outline" size={22} color="#fff" />
            </Pressable>
            <Pressable
                accessibilityRole="button"
                onPress={goToMaster}
                hitSlop={8}
                style={{ padding: 4 }}
            >
                <Ionicons name="server-outline" size={22} color="#fff" />
            </Pressable>
        </View>
    );
}


