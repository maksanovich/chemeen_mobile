import React, { useState } from 'react';
import {
    StyleSheet,
    ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';

import PRFForm from '@/components/Forms/master/PRFForm';
import { ThemedView } from '@/components/ThemedView';

import { IPRF } from '@/constants/Interfaces';
import { DEFAULT_PRF } from '@/constants/DefaultValues';

import axiosInstance from '@/utils/axiosInstance';

import { useDispatch } from "@/store";
import { addItem } from '@/store/reducers/master';

export default function PRFAddScreen() {
    const router = useRouter();
    const dispatch = useDispatch();

    const [formData, setFormData] = useState<IPRF>(DEFAULT_PRF);

    const handleSubmit = async () => {
        try {
            const response = await axiosInstance.post('master/PRF/', formData);
            dispatch(addItem(response.data))
            router.navigate('/master/PRF/list');
        } catch (error) {
            console.error('Fetch Error:', error);
        }
    }

    return (
        <ScrollView>
            <ThemedView style={styles.container}>
                <PRFForm
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
