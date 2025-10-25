import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

import PRSPForm from '@/components/Forms/master/PRSPForm';
import { ThemedView } from '@/components/ThemedView';

import { IPRSP } from '@/constants/Interfaces';
import { DEFAULT_PRSP } from '@/constants/DefaultValues';

import axiosInstance from '@/utils/axiosInstance';

import { useDispatch } from "@/store";
import { updateItem } from '@/store/reducers/master';

const PRSPDetailScreen = () => {
    const router = useRouter();
    const { _id } = useLocalSearchParams();
    const dispatch = useDispatch();

    const [formData, setFormData] = useState<IPRSP>(DEFAULT_PRSP);

    useEffect(() => {
        getPRSP();
    }, [_id])

    const getPRSP = async () => {
        try {
            const response = await axiosInstance.get('master/PRSP/' + _id,);
            setFormData(response.data);
        } catch (error) {
            console.error('Fetch Error:', error);
        }
    }

    const handleSubmit = async () => {
        try {
            const response = await axiosInstance.put('master/PRSP/' + _id, formData);
            dispatch(updateItem(response.data))
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
};

export default PRSPDetailScreen;

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
});