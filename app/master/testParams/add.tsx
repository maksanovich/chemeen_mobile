import React, { useState } from 'react';
import {
    StyleSheet,
    ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';

import TestParamsForm from '@/components/Forms/master/TestParamsForm';
import { ThemedView } from '@/components/ThemedView';

import { ITestParameters } from '@/constants/Interfaces';
import { DEFAULT_TEST_PARAMETERS } from '@/constants/DefaultValues';

import axiosInstance from '@/utils/axiosInstance';

import { useDispatch } from "@/store";
import { addItem } from '@/store/reducers/master';

export default function TestAddScreen() {
    const router = useRouter();
    const dispatch = useDispatch();

    const [formData, setFormData] = useState<ITestParameters>(DEFAULT_TEST_PARAMETERS);

    const handleSubmit = async () => {
        try {
            const response = await axiosInstance.post('master/testParams/', formData);
            dispatch(addItem(response.data))
            router.navigate('/master/testParams/list');
        } catch (error) {
            console.error('Fetch Error:', error);
        }
    }

    return (
        <ScrollView>
            <ThemedView style={styles.container}>
                <TestParamsForm
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
