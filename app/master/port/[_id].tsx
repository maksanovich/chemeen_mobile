import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    ScrollView,
    Alert
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

import PortForm from '@/components/Forms/master/portForm';
import { ThemedView } from '@/components/ThemedView';

import { IPort } from '@/constants/Interfaces';
import { DEFAULT_PORT } from '@/constants/DefaultValues';

import axiosInstance from '@/utils/axiosInstance';

import { useDispatch } from "@/store";
import { updateItem } from '@/store/reducers/master';

const PortDetailScreen = () => {
    const router = useRouter();
    const { _id } = useLocalSearchParams();
    const dispatch = useDispatch();

    const [formData, setFormData] = useState<IPort>(DEFAULT_PORT);
    const [originalData, setOriginalData] = useState<IPort>(DEFAULT_PORT);

    useEffect(() => {
        getPort();
    }, [_id])

    const getPort = async () => {
        try {
            const response = await axiosInstance.get('master/port/' + _id,);
            setFormData(response.data);
            setOriginalData(response.data);
        } catch (error: any) {
            console.error('Fetch Error:', error);
            Alert.alert('Error', 'Failed to load port data');
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
            const response = await axiosInstance.put('master/port/' + _id, formData);
            dispatch(updateItem(response.data));
            Alert.alert('Success', 'Port updated successfully!');
            router.navigate('/master/port/list');
        } catch (error: any) {
            console.error('Fetch Error:', error);
            const errorMsg = error.response?.data?.message || 'Failed to update port';
            Alert.alert('Error', errorMsg);
        }
    }

    return (
        <ScrollView>
            <ThemedView style={styles.container}>
                <PortForm
                    formData={formData}
                    setFormData={setFormData}
                    handleSubmit={handleSubmit}
                />
            </ThemedView>
        </ScrollView>
    );
};

export default PortDetailScreen;

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
});