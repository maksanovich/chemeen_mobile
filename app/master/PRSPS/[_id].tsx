import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

import PRSPSForm from '@/components/Forms/master/PRSPSForm';
import { ThemedView } from '@/components/ThemedView';

import { IPRSPS } from '@/constants/Interfaces';
import { DEFAULT_PRSPS } from '@/constants/DefaultValues';

import axiosInstance from '@/utils/axiosInstance';

import { useDispatch } from "@/store";
import { updateItem } from '@/store/reducers/master';

const PRSPSDetailScreen = () => {
    const router = useRouter();
    const { _id } = useLocalSearchParams();
    const dispatch = useDispatch();

    const [formData, setFormData] = useState<IPRSPS>(DEFAULT_PRSPS);

    useEffect(() => {
        getPRSPS();
    }, [_id])

    const getPRSPS = async () => {
        try {
            const response = await axiosInstance.get('master/PRSPS/' + _id,);
            setFormData(response.data);
        } catch (error) {
            console.error('Fetch Error:', error);
        }
    }

    const handleSubmit = async () => {
        try {
            const response = await axiosInstance.put('master/PRSPS/' + _id, formData);
            dispatch(updateItem(response.data))
            router.navigate('/master/PRSPS/list');
        } catch (error) {
            console.error('Fetch Error:', error);
        }
    }

    return (
        <ScrollView>
            <ThemedView style={styles.container}>
                <PRSPSForm
                    formData={formData}
                    setFormData={setFormData}
                    handleSubmit={handleSubmit}
                />
            </ThemedView>
        </ScrollView>
    );
};

export default PRSPSDetailScreen;

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
});