import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

import TestForm from '@/components/Forms/master/TestForm';
import { ThemedView } from '@/components/ThemedView';

import { ITest } from '@/constants/Interfaces';
import { DEFAULT_TEST } from '@/constants/DefaultValues';

import axiosInstance from '@/utils/axiosInstance';

import { useDispatch } from "@/store";
import { updateItem } from '@/store/reducers/master';

const TestDetailScreen = () => {
    const router = useRouter();
    const { _id } = useLocalSearchParams();
    const dispatch = useDispatch();

    const [formData, setFormData] = useState<ITest>(DEFAULT_TEST);

    useEffect(() => {
        getTest();
    }, [_id])

    const getTest = async () => {
        try {
            const response = await axiosInstance.get('master/test/' + _id,);
            setFormData(response.data);
        } catch (error) {
            console.error('Fetch Error:', error);
        }
    }

    const handleSubmit = async () => {
        try {
            const response = await axiosInstance.put('master/test/' + _id, formData);
            dispatch(updateItem(response.data))
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
};

export default TestDetailScreen;

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
});