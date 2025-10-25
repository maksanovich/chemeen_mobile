import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

import PRSGForm from '@/components/Forms/master/PRSGForm';
import { ThemedView } from '@/components/ThemedView';

import { IPRSG } from '@/constants/Interfaces';
import { DEFAULT_PRSG } from '@/constants/DefaultValues';

import axiosInstance from '@/utils/axiosInstance';

import { useDispatch } from "@/store";
import { updateItem } from '@/store/reducers/master';

const PRSGDetailScreen = () => {
    const router = useRouter();
    const { _id } = useLocalSearchParams();
    const dispatch = useDispatch();

    const [formData, setFormData] = useState<IPRSG>(DEFAULT_PRSG);

    useEffect(() => {
        getPRSG();
    }, [_id])

    const getPRSG = async () => {
        try {
            const response = await axiosInstance.get('master/PRSG/' + _id,);
            setFormData(response.data);
        } catch (error) {
            console.error('Fetch Error:', error);
        }
    }

    const handleSubmit = async () => {
        try {
            const response = await axiosInstance.put('master/PRSG/' + _id, formData);
            dispatch(updateItem(response.data))
            router.navigate('/master/PRSG/list');
        } catch (error) {
            console.error('Fetch Error:', error);
        }
    }

    return (
        <ScrollView>
            <ThemedView style={styles.container}>
                <PRSGForm
                    formData={formData}
                    setFormData={setFormData}
                    handleSubmit={handleSubmit}
                />
            </ThemedView>
        </ScrollView>
    );
};

export default PRSGDetailScreen;

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
});