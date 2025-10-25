import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

import PRSForm from '@/components/Forms/master/PRSForm';
import { ThemedView } from '@/components/ThemedView';

import { IPRS } from '@/constants/Interfaces';
import { DEFAULT_PRS } from '@/constants/DefaultValues';

import axiosInstance from '@/utils/axiosInstance';

import { useDispatch } from "@/store";
import { updateItem } from '@/store/reducers/master';

const PRSDetailScreen = () => {
    const router = useRouter();
    const { _id } = useLocalSearchParams();
    const dispatch = useDispatch();

    const [formData, setFormData] = useState<IPRS>(DEFAULT_PRS);

    useEffect(() => {
        getPRS();
    }, [_id])

    const getPRS = async () => {
        try {
            const response = await axiosInstance.get('master/PRS/' + _id,);
            setFormData(response.data);
        } catch (error) {
            console.error('Fetch Error:', error);
        }
    }

    const handleSubmit = async () => {
        try {
            const response = await axiosInstance.put('master/PRS/' + _id, formData);
            dispatch(updateItem(response.data))
            router.navigate('/master/PRS/list');
        } catch (error) {
            console.error('Fetch Error:', error);
        }
    }

    return (
        <ScrollView>
            <ThemedView style={styles.container}>
                <PRSForm
                    formData={formData}
                    setFormData={setFormData}
                    handleSubmit={handleSubmit}
                />
            </ThemedView>
        </ScrollView>
    );
};

export default PRSDetailScreen;

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
});