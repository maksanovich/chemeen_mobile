import React, { useState } from 'react';
import {
    StyleSheet,
    ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';

import PRSGForm from '@/components/Forms/master/PRSGForm';
import { ThemedView } from '@/components/ThemedView';

import { IPRSG } from '@/constants/Interfaces';
import { DEFAULT_PRSG } from '@/constants/DefaultValues';

import axiosInstance from '@/utils/axiosInstance';

import { useDispatch } from "@/store";
import { addItem } from '@/store/reducers/master';

export default function PRSGAddScreen() {
    const router = useRouter();
    const dispatch = useDispatch();

    const [formData, setFormData] = useState<IPRSG>(DEFAULT_PRSG);

    const handleSubmit = async () => {
        try {
            const response = await axiosInstance.post('master/PRSG/', formData);
            dispatch(addItem(response.data))
            router.navigate('/master/PRSG/list');
        } catch (error) {
            console.error('Fetch Error:', error);
        }
    }

    return (
        <ScrollView>
            <ThemedView style={styles.container}>
                <PRSGForm
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
