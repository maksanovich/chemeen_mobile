import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    ScrollView,
    Alert
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

import BankForm from '@/components/Forms/master/bankForm';
import { ThemedView } from '@/components/ThemedView';

import { IBank } from '@/constants/Interfaces';
import { DEFAULT_BANK } from '@/constants/DefaultValues';

import axiosInstance from '@/utils/axiosInstance';

import { useDispatch } from "@/store";
import { updateItem } from '@/store/reducers/master';

const BankDetailScreen = () => {
    const router = useRouter();
    const { _id } = useLocalSearchParams();
    const dispatch = useDispatch();

    const [formData, setFormData] = useState<IBank>(DEFAULT_BANK);
    const [originalData, setOriginalData] = useState<IBank>(DEFAULT_BANK);

    useEffect(() => {
        getBank();
    }, [_id])

    const getBank = async () => {
        try {
            const response = await axiosInstance.get('master/bank/' + _id,);
            setFormData(response.data);
            setOriginalData(response.data);
        } catch (error: any) {
            console.error('Fetch Error:', error);
            Alert.alert('Error', 'Failed to load bank data');
        }
    }

    const hasChanges = () => {
        return JSON.stringify(formData) !== JSON.stringify(originalData);
    }

    const handleSubmit = async () => {
        if (!hasChanges()) {
            Alert.alert('No Changes', 'You have not made any changes to update.');
            return;
        }

        try {
            const response = await axiosInstance.put('master/bank/' + _id, formData);
            dispatch(updateItem(response.data));
            Alert.alert('Success', 'Bank updated successfully!');
            router.navigate('/master/bank/list');
        } catch (error: any) {
            console.error('Fetch Error:', error);
            const errorMsg = error.response?.data?.message || 'Failed to update bank';
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
};

export default BankDetailScreen;

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
});