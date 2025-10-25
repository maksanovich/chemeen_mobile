import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

import PRSPWForm from '@/components/Forms/master/PRSPWForm';
import { ThemedView } from '@/components/ThemedView';

import { IPRSPW } from '@/constants/Interfaces';
import { DEFAULT_PRSPW } from '@/constants/DefaultValues';

import axiosInstance from '@/utils/axiosInstance';

import { useDispatch } from "@/store";
import { updateItem } from '@/store/reducers/master';

const PRSPWDetailScreen = () => {
    const router = useRouter();
    const { _id } = useLocalSearchParams();
    const dispatch = useDispatch();

    const [formData, setFormData] = useState<IPRSPW>(DEFAULT_PRSPW);

    useEffect(() => {
        getPRSPW();
    }, [_id])

    const getPRSPW = async () => {
        try {
            const response = await axiosInstance.get('master/PRSPW/' + _id,);
            setFormData(response.data);
        } catch (error) {
            console.error('Fetch Error:', error);
        }
    }

    const handleSubmit = async () => {
        try {
            const response = await axiosInstance.put('master/PRSPW/' + _id, formData);
            dispatch(updateItem(response.data))
            router.navigate('/master/PRSPW/list');
        } catch (error) {
            console.error('Fetch Error:', error);
        }
    }

    return (
        <ScrollView>
            <ThemedView style={styles.container}>
                <PRSPWForm
                    formData={formData}
                    setFormData={setFormData}
                    handleSubmit={handleSubmit}
                />
            </ThemedView>
        </ScrollView>
    );
};

export default PRSPWDetailScreen;

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
});