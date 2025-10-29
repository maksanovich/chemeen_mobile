import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';

import PIForm from '@/components/Forms/product/PIForm';
import { ThemedView } from '@/components/ThemedView';

import { IPI } from '@/constants/Interfaces';
import { DEFAULT_PI } from '@/constants/DefaultValues';

import axiosInstance from '@/utils/axiosInstance';
import { showError, showSuccessToast } from '@/utils/alertHelper';

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
            console.log('Loading PI data:', selectedPI.PI);
            console.log('POQuality in loaded data:', selectedPI.PI?.POQuality);
            setFormData(selectedPI.PI);
        }
    }, [selectedPI])

    const handleSubmit = async () => {
        try {
            console.log('Form data being submitted:', formData);
            console.log('POQuality value:', formData.POQuality);
            
            let result: any = {};
            if (selectedPI.PIId) {
                let response = await axiosInstance.put('product/PI/' + selectedPI.PIId, formData);
                console.log('Response from backend:', response.data);
                dispatch(updateItem(response.data));
                result.PI = response.data;
                dispatch(updateSelectedPIItem({ key: "PI", data: response.data }));
                showSuccessToast("PI updated successfully");
                router.navigate('/product');
            } else {
                let response = await axiosInstance.post('product/PI/', formData);
                dispatch(addItem(response.data));
                result.PI = response.data;
                result.PIId = response.data._id;
                dispatch(setSelectedPIItem(result));
                showSuccessToast("PI created successfully");
                router.navigate('/product');
            }
        } catch (error: any) {
            console.error('Fetch Error:', error);
            showError("Error", error.response?.data?.message || "Something went wrong");
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
