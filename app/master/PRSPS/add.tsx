import React, { useState } from 'react';
import {
    StyleSheet,
    ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';

import PRSPSForm from '@/components/Forms/master/PRSPSForm';
import { ThemedView } from '@/components/ThemedView';

import { IPRSPS } from '@/constants/Interfaces';
import { DEFAULT_PRSPS } from '@/constants/DefaultValues';

import axiosInstance from '@/utils/axiosInstance';

import { useDispatch } from "@/store";
import { addItem } from '@/store/reducers/master';

export default function PRSPSAddScreen() {
    const router = useRouter();
    const dispatch = useDispatch();

    const [formData, setFormData] = useState<IPRSPS>(DEFAULT_PRSPS);

    const handleSubmit = async () => {
        try {
            const response = await axiosInstance.post('master/PRSPS/', formData);
            dispatch(addItem(response.data))
            router.navigate('/master/PRSPS/list');
        } catch (error) {
            console.error('Fetch Error:', error);
        }
    }

    return (
        <ScrollView>
            <ThemedView style={styles.container}>
                <PRSPSForm
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
