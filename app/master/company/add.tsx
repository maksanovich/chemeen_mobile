import React, { useState } from 'react';
import {
    StyleSheet,
    ScrollView,
    Alert
} from 'react-native';
import { useRouter } from 'expo-router';

import CompanyForm from '@/components/Forms/master/companyForm';
import { ThemedView } from '@/components/ThemedView';

import { ICompany } from '@/constants/Interfaces';
import { DEFAULT_COMPANY } from '@/constants/DefaultValues';

import axiosInstance from '@/utils/axiosInstance';

import { useDispatch } from "@/store";
import { addItem } from '@/store/reducers/master';

export default function CompanyAddScreen() {
    const router = useRouter();
    const dispatch = useDispatch();

    const [formData, setFormData] = useState<ICompany>(DEFAULT_COMPANY);

    const handleSubmit = async () => {
        try {
            const response = await axiosInstance.post('master/company/', formData);
            dispatch(addItem(response.data));
            Alert.alert('Success', 'Company created successfully!');
            router.navigate('/master/company/list');
        } catch (error: any) {
            console.error('Fetch Error:', error);
            const errorMsg = error.response?.data?.message || 'Failed to create company';
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
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
});
