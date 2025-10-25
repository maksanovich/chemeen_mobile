import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

import PRFForm from '@/components/Forms/master/PRFForm';
import { ThemedView } from '@/components/ThemedView';

import { IPRF } from '@/constants/Interfaces';
import { DEFAULT_PRF } from '@/constants/DefaultValues';

import axiosInstance from '@/utils/axiosInstance';

import { useDispatch } from "@/store";
import { updateItem } from '@/store/reducers/master';

const PRFDetailScreen = () => {
    const router = useRouter();
    const { _id } = useLocalSearchParams();
    const dispatch = useDispatch();

    const [formData, setFormData] = useState<IPRF>(DEFAULT_PRF);

    useEffect(() => {
        getPRF();
    }, [_id])

    const getPRF = async () => {
        try {
            const response = await axiosInstance.get('master/PRF/' + _id,);
            setFormData(response.data);
        } catch (error) {
            console.error('Fetch Error:', error);
        }
    }

    const handleSubmit = async () => {
        try {
            const response = await axiosInstance.put('master/PRF/' + _id, formData);
            dispatch(updateItem(response.data))
            router.navigate('/master/PRF/list');
        } catch (error) {
            console.error('Fetch Error:', error);
        }
    }

    return (
        <ScrollView>
            <ThemedView style={styles.container}>
                <PRFForm
                    formData={formData}
                    setFormData={setFormData}
                    handleSubmit={handleSubmit}
                />
            </ThemedView>
        </ScrollView>
    );
};

export default PRFDetailScreen;

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
});