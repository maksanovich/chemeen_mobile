import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    ScrollView,
    Alert
} from 'react-native';
import { useRouter } from 'expo-router';

import PIForm from '@/components/Forms/product/PIForm';
import { ThemedView } from '@/components/ThemedView';

import { IPI } from '@/constants/Interfaces';
import { DEFAULT_PI } from '@/constants/DefaultValues';

import axiosInstance from '@/utils/axiosInstance';

import { useDispatch, useSelector } from "@/store";
import { addItem, updateItem } from '@/store/reducers/PIList';
import { setSelectedPIItem, updateSelectedPIItem } from '@/store/reducers/selectedPI';

export default function PIDetailEditScreen() {
    const router = useRouter();
    const selectedPI: any = useSelector((state) => state.selectedPI.data);

    const dispatch = useDispatch();

    const [formData, setFormData] = useState<IPI>(DEFAULT_PI);

    useEffect(() => {
        if (selectedPI.PIId) {
            setFormData(selectedPI.PI);
        }
    }, [selectedPI])

    const handleSubmit = async () => {
        try {
            let result: any = {};
            if (selectedPI.PIId) {
                let response = await axiosInstance.put('product/PI/' + selectedPI.PIId, formData);
                dispatch(updateItem(response.data));
                result.PI = response.data;
                dispatch(updateSelectedPIItem({ key: "PI", data: response.data }));
                Alert.alert("Success", "PI updated successfully");
            } else {
                let response = await axiosInstance.post('product/PI/', formData);
                dispatch(addItem(response.data));
                result.PI = response.data;
                result.PIId = response.data._id;
                dispatch(setSelectedPIItem(result));
                Alert.alert("Success", "PI created successfully");
            }
            router.navigate('/product');
        } catch (error: any) {
            console.error('Fetch Error:', error);
            Alert.alert("Error", error.response?.data?.message || "Something went wrong");
        }
    };


    return (
        <ScrollView>
            <ThemedView style={styles.container}>
                <PIForm
                    formData={formData}
                    setFormData={setFormData}
                    handleSubmit={handleSubmit}
                />
            </ThemedView>
        </ScrollView>
    );
} 

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
});
