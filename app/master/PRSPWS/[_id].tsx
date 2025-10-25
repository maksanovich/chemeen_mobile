import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

import PRSPWSForm from '@/components/Forms/master/PRSPWSForm';
import { ThemedView } from '@/components/ThemedView';

import { IPRSPWS } from '@/constants/Interfaces';
import { DEFAULT_PRSPWS } from '@/constants/DefaultValues';

import axiosInstance from '@/utils/axiosInstance';

import { useDispatch } from "@/store";
import { updateItem } from '@/store/reducers/master';

const PRSPWSDetailScreen = () => {
    const router = useRouter();
    const { _id } = useLocalSearchParams();
    const dispatch = useDispatch();

    const [formData, setFormData] = useState<IPRSPWS>(DEFAULT_PRSPWS);

    useEffect(() => {
        getPRSPWS();
    }, [_id])

    const getPRSPWS = async () => {
        try {
            const response = await axiosInstance.get('master/PRSPWS/' + _id,);
            setFormData(response.data);
        } catch (error) {
            console.error('Fetch Error:', error);
        }
    }

    const handleSubmit = async () => {
        try {
            const response = await axiosInstance.put('master/PRSPWS/' + _id, formData);
            dispatch(updateItem(response.data))
            router.navigate('/master/PRSPWS/list');
        } catch (error) {
            console.error('Fetch Error:', error);
        }
    }

    return (
        <ScrollView>
            <ThemedView style={styles.container}>
                <PRSPWSForm
                    formData={formData}
                    setFormData={setFormData}
                    handleSubmit={handleSubmit}
                />
            </ThemedView>
        </ScrollView>
    );
};

export default PRSPWSDetailScreen;

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
});