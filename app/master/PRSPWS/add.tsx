import React, { useState } from 'react';
import {
    StyleSheet,
    ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';

import PRSPWSForm from '@/components/Forms/master/PRSPWSForm';
import { ThemedView } from '@/components/ThemedView';

import { IPRSPWS } from '@/constants/Interfaces';
import { DEFAULT_PRSPWS } from '@/constants/DefaultValues';

import axiosInstance from '@/utils/axiosInstance';

import { useDispatch } from "@/store";
import { addItem } from '@/store/reducers/master';

export default function PRSPWSAddScreen() {
    const router = useRouter();
    const dispatch = useDispatch();

    const [formData, setFormData] = useState<IPRSPWS>(DEFAULT_PRSPWS);

    const handleSubmit = async () => {
        try {
            const response = await axiosInstance.post('master/PRSPWS/', formData);
            dispatch(addItem(response.data))
            router.navigate('/master/PRSPWS/list');
        } catch (error) {
            console.error('Fetch Error:', error);
        }
    }

    return (
        <ScrollView>
            <ThemedView style={styles.container}>
                <PRSPWSForm
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
