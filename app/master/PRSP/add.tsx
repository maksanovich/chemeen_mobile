import React, { useState } from 'react';
import {
    StyleSheet,
    ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';

import PRSPForm from '@/components/Forms/master/PRSPForm';
import { ThemedView } from '@/components/ThemedView';

import { IPRSP } from '@/constants/Interfaces';
import { DEFAULT_PRSP } from '@/constants/DefaultValues';

import axiosInstance from '@/utils/axiosInstance';

import { useDispatch } from "@/store";
import { addItem } from '@/store/reducers/master';

export default function PRSPAddScreen() {
    const router = useRouter();
    const dispatch = useDispatch();

    const [formData, setFormData] = useState<IPRSP>(DEFAULT_PRSP);

    const handleSubmit = async () => {
        try {
            const response = await axiosInstance.post('master/PRSP/', formData);
            dispatch(addItem(response.data))
            router.navigate('/master/PRSP/list');
        } catch (error) {
            console.error('Fetch Error:', error);
        }
    }

    return (
        <ScrollView>
            <ThemedView style={styles.container}>
                <PRSPForm
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
