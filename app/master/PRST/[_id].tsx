import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

import PRSTForm from '@/components/Forms/master/PRSTForm';
import { ThemedView } from '@/components/ThemedView';

import { IPRST } from '@/constants/Interfaces';
import { DEFAULT_PRST } from '@/constants/DefaultValues';

import axiosInstance from '@/utils/axiosInstance';

import { useDispatch } from "@/store";
import { updateItem } from '@/store/reducers/master';

const PRSTDetailScreen = () => {
    const router = useRouter();
    const { _id } = useLocalSearchParams();
    const dispatch = useDispatch();

    const [formData, setFormData] = useState<IPRST>(DEFAULT_PRST);

    useEffect(() => {
        getPRST();
    }, [_id])

    const getPRST = async () => {
        try {
            const response = await axiosInstance.get('master/PRST/' + _id,);
            setFormData(response.data);
        } catch (error) {
            console.error('Fetch Error:', error);
        }
    }

    const handleSubmit = async () => {
        try {
            const response = await axiosInstance.put('master/PRST/' + _id, formData);
            dispatch(updateItem(response.data))
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
};

export default PRSTDetailScreen;

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
});