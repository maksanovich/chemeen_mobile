import React, { useState } from 'react';
import {
    StyleSheet,
    ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';

import PRSForm from '@/components/Forms/master/PRSForm';
import { ThemedView } from '@/components/ThemedView';

import { IPRS } from '@/constants/Interfaces';
import { DEFAULT_PRS } from '@/constants/DefaultValues';

import axiosInstance from '@/utils/axiosInstance';

import { useDispatch } from "@/store";
import { addItem } from '@/store/reducers/master';

export default function PRSAddScreen() {
    const router = useRouter();
    const dispatch = useDispatch();

    const [formData, setFormData] = useState<IPRS>(DEFAULT_PRS);

    const handleSubmit = async () => {
        try {
            const response = await axiosInstance.post('master/PRS/', formData);
            dispatch(addItem(response.data))
            router.navigate('/master/PRS/list');
        } catch (error) {
            console.error('Fetch Error:', error);
        }
    }

    return (
        <ScrollView>
            <ThemedView style={styles.container}>
                <PRSForm
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
