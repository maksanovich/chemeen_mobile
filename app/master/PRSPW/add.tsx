import React, { useState } from 'react';
import {
    StyleSheet,
    ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';

import PRSPWForm from '@/components/Forms/master/PRSPWForm';
import { ThemedView } from '@/components/ThemedView';

import { IPRSPW } from '@/constants/Interfaces';
import { DEFAULT_PRSPW } from '@/constants/DefaultValues';

import axiosInstance from '@/utils/axiosInstance';

import { useDispatch } from "@/store";
import { addItem } from '@/store/reducers/master';

export default function PRSPWAddScreen() {
    const router = useRouter();
    const dispatch = useDispatch();

    const [formData, setFormData] = useState<IPRSPW>(DEFAULT_PRSPW);

    const handleSubmit = async () => {
        try {
            const response = await axiosInstance.post('master/PRSPW/', formData);
            dispatch(addItem(response.data))
            router.navigate('/master/PRSPW/list');
        } catch (error) {
            console.error('Fetch Error:', error);
        }
    }

    return (
        <ScrollView>
            <ThemedView style={styles.container}>
                <PRSPWForm
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
