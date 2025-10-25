import React, { useState } from 'react';
import {
    StyleSheet,
    ScrollView,
    Alert
} from 'react-native';
import { useRouter } from 'expo-router';

import BankForm from '@/components/Forms/master/bankForm';
import { ThemedView } from '@/components/ThemedView';

import { IBank } from '@/constants/Interfaces';
import { DEFAULT_BANK } from '@/constants/DefaultValues';

import axiosInstance from '@/utils/axiosInstance';

import { useDispatch } from "@/store";
import { addItem } from '@/store/reducers/master';

export default function BankAddScreen() {
    const router = useRouter();
    const dispatch = useDispatch();

    const [formData, setFormData] = useState<IBank>(DEFAULT_BANK);

    const handleSubmit = async () => {
        try {
            const response = await axiosInstance.post('master/bank/', formData);
            dispatch(addItem(response.data));
            Alert.alert('Success', 'Bank created successfully!');
            router.navigate('/master/bank/list');
        } catch (error: any) {
            console.error('Fetch Error:', error);
            const errorMsg = error.response?.data?.message || 'Failed to create bank';
            Alert.alert('Error', errorMsg);
        }
    }

    return (
        <ScrollView>
            <ThemedView style={styles.container}>
                <BankForm
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
