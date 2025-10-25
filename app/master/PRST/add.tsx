import React, { useState } from 'react';
import {
    StyleSheet,
    ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';

import PRSTForm from '@/components/Forms/master/PRSTForm';
import { ThemedView } from '@/components/ThemedView';

import { IPRST } from '@/constants/Interfaces';
import { DEFAULT_PRST } from '@/constants/DefaultValues';

import axiosInstance from '@/utils/axiosInstance';

import { useDispatch } from "@/store";
import { addItem } from '@/store/reducers/master';

export default function PRSTAddScreen() {
    const router = useRouter();
    const dispatch = useDispatch();

    const [formData, setFormData] = useState<IPRST>(DEFAULT_PRST);

    const handleSubmit = async () => {
        try {
            const response = await axiosInstance.post('master/PRST/', formData);
            dispatch(addItem(response.data))
            router.navigate('/master/PRST/list');
        } catch (error) {
            console.error('Fetch Error:', error);
        }
    }

    return (
        <ScrollView>
            <ThemedView style={styles.container}>
                <PRSTForm
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
