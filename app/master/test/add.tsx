import React, { useState } from 'react';
import {
    StyleSheet,
    ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';

import TestForm from '@/components/Forms/master/TestForm';
import { ThemedView } from '@/components/ThemedView';

import { ITest } from '@/constants/Interfaces';
import { DEFAULT_TEST } from '@/constants/DefaultValues';

import axiosInstance from '@/utils/axiosInstance';

import { useDispatch } from "@/store";
import { addItem } from '@/store/reducers/master';

export default function TestAddScreen() {
    const router = useRouter();
    const dispatch = useDispatch();

    const [formData, setFormData] = useState<ITest>(DEFAULT_TEST);

    const handleSubmit = async () => {
        try {
            const response = await axiosInstance.post('master/test/', formData);
            dispatch(addItem(response.data))
            router.navigate('/master/test/list');
        } catch (error) {
            console.error('Fetch Error:', error);
        }
    }

    return (
        <ScrollView>
            <ThemedView style={styles.container}>
                <TestForm
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
