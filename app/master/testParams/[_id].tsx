import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

import TestParamsForm from '@/components/Forms/master/TestParamsForm';
import { ThemedView } from '@/components/ThemedView';

import { ITestParameters } from '@/constants/Interfaces';
import { DEFAULT_TEST_PARAMETERS } from '@/constants/DefaultValues';

import axiosInstance from '@/utils/axiosInstance';

import { useDispatch } from "@/store";
import { updateItem } from '@/store/reducers/master';

const TestDetailScreen = () => {
    const router = useRouter();
    const { _id } = useLocalSearchParams();
    const dispatch = useDispatch();

    const [formData, setFormData] = useState<ITestParameters>(DEFAULT_TEST_PARAMETERS);

    useEffect(() => {
        getTestParams();
    }, [_id])

    const getTestParams = async () => {
        try {
            const response = await axiosInstance.get('master/testParams/' + _id,);
            setFormData(response.data);
        } catch (error) {
            console.error('Fetch Error:', error);
        }
    }

    const handleSubmit = async () => {
        try {
            const response = await axiosInstance.put('master/testParams/' + _id, formData);
            dispatch(updateItem(response.data))
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
};

export default TestDetailScreen;

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
});