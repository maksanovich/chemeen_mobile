import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    ScrollView,
    Alert
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

import CompanyForm from '@/components/Forms/master/companyForm';
import { ThemedView } from '@/components/ThemedView';

import { ICompany } from '@/constants/Interfaces';
import { DEFAULT_COMPANY } from '@/constants/DefaultValues';

import axiosInstance from '@/utils/axiosInstance';

import { useDispatch } from "@/store";
import { updateItem } from '@/store/reducers/master';

const CompanyDetailScreen = () => {
    const router = useRouter();
    const { _id } = useLocalSearchParams();
    const dispatch = useDispatch();

    const [formData, setFormData] = useState<ICompany>(DEFAULT_COMPANY);
    const [originalData, setOriginalData] = useState<ICompany>(DEFAULT_COMPANY);

    useEffect(() => {
        getCompany();
    }, [_id])

    const getCompany = async () => {
        try {
            const response = await axiosInstance.get('master/company/' + _id,);
            setFormData(response.data);
            setOriginalData(response.data);
        } catch (error: any) {
            console.error('Fetch Error:', error);
            Alert.alert('Error', 'Failed to load company data');
        }
    }

    const hasChanges = () => {
        return JSON.stringify(formData) !== JSON.stringify(originalData);
    }

    const handleSubmit = async () => {
        if (!hasChanges()) {
            Alert.alert('No Changes', 'You have not made any changes to update.');
            return;
        }

        try {
            const response = await axiosInstance.put('master/company/' + _id, formData);
            dispatch(updateItem(response.data));
            Alert.alert('Success', 'Company updated successfully!');
            router.navigate('/master/company/list');
        } catch (error: any) {
            console.error('Fetch Error:', error);
            const errorMsg = error.response?.data?.message || 'Failed to update company';
            Alert.alert('Error', errorMsg);
        }
    }

    return (
        <ScrollView>
            <ThemedView style={styles.container}>
                <CompanyForm
                    formData={formData}
                    setFormData={setFormData}
                    handleSubmit={handleSubmit}
                />
            </ThemedView>
        </ScrollView>
    );
};

export default CompanyDetailScreen;

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
});