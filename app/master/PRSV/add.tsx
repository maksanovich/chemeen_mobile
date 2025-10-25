import React, { useState } from 'react';
import {
    StyleSheet,
    ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';

import PRSVForm from '@/components/Forms/master/PRSVForm';
import { ThemedView } from '@/components/ThemedView';

import { IPRSV } from '@/constants/Interfaces';
import { DEFAULT_PRSV } from '@/constants/DefaultValues';

import axiosInstance from '@/utils/axiosInstance';

import { useDispatch } from "@/store";
import { addItem } from '@/store/reducers/master';

export default function PRSVAddScreen() {
    const router = useRouter();
    const dispatch = useDispatch();

    const [formData, setFormData] = useState<IPRSV>(DEFAULT_PRSV);

    const handleSubmit = async () => {
        try {
            const response = await axiosInstance.post('master/PRSV/', formData);
            dispatch(addItem(response.data))
            router.navigate('/master/PRSV/list');
        } catch (error) {
            console.error('Fetch Error:', error);
        }
    }

    return (
        <ScrollView>
            <ThemedView style={styles.container}>
                <PRSVForm
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
