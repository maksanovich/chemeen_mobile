import React, { useState } from 'react';
import {
    StyleSheet,
    ScrollView,
    Alert
} from 'react-native';
import { useRouter } from 'expo-router';

import PortForm from '@/components/Forms/master/portForm';
import { ThemedView } from '@/components/ThemedView';

import { IPort } from '@/constants/Interfaces';
import { DEFAULT_PORT } from '@/constants/DefaultValues';

import axiosInstance from '@/utils/axiosInstance';

import { useDispatch } from "@/store";
import { addItem } from '@/store/reducers/master';

export default function PortAddScreen() {
    const router = useRouter();
    const dispatch = useDispatch();

    const [formData, setFormData] = useState<IPort>(DEFAULT_PORT);

    const handleSubmit = async () => {
        try {
            const response = await axiosInstance.post('master/port/', formData);
            dispatch(addItem(response.data));
            Alert.alert('Success', 'Port created successfully!');
            router.navigate('/master/port/list');
        } catch (error: any) {
            console.error('Fetch Error:', error);
            const errorMsg = error.response?.data?.message || 'Failed to create port';
            Alert.alert('Error', errorMsg);
        }
    }

    return (
        <ScrollView>
            <ThemedView style={styles.container}>
                <PortForm
                    formData={formData}
                    setFormData={setFormData}
                    handleSubmit={handleSubmit}
                />
            </ThemedView>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
});
