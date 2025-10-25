import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

import PRSVForm from '@/components/Forms/master/PRSVForm';
import { ThemedView } from '@/components/ThemedView';

import { IPRSV } from '@/constants/Interfaces';
import { DEFAULT_PRSV } from '@/constants/DefaultValues';

import axiosInstance from '@/utils/axiosInstance';

import { useDispatch } from "@/store";
import { updateItem } from '@/store/reducers/master';

const PRSVDetailScreen = () => {
    const router = useRouter();
    const { _id } = useLocalSearchParams();
    const dispatch = useDispatch();

    const [formData, setFormData] = useState<IPRSV>(DEFAULT_PRSV);

    useEffect(() => {
        getPRSV();
    }, [_id])

    const getPRSV = async () => {
        try {
            const response = await axiosInstance.get('master/PRSV/' + _id,);
            setFormData(response.data);
        } catch (error) {
            console.error('Fetch Error:', error);
        }
    }

    const handleSubmit = async () => {
        try {
            const response = await axiosInstance.put('master/PRSV/' + _id, formData);
            dispatch(updateItem(response.data))
            router.navigate('/master/PRSV/list');
        } catch (error) {
            console.error('Fetch Error:', error);
        }
    }

    return (
        <ScrollView>
            <ThemedView style={styles.container}>
                <PRSVForm
                    formData={formData}
                    setFormData={setFormData}
                    handleSubmit={handleSubmit}
                />
            </ThemedView>
        </ScrollView>
    );
};

export default PRSVDetailScreen;

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
});