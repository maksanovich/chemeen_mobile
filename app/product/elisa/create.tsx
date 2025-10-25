import React, { useState } from 'react';
import {
    StyleSheet,
    ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';

import ELISAForm from '@/components/Forms/product/ELISAForm';
import { ThemedView } from '@/components/ThemedView';

import axiosInstance from '@/utils/axiosInstance';

import { DEFAULT_ELISA } from '@/constants/DefaultValues';

import { useSelector } from "@/store";

export default function ELISACreateScreen() {
    const router = useRouter();
    const selectedPI: any = useSelector((state) => state.selectedPI.data);

    const [formData, setFormData] = useState<any>(DEFAULT_ELISA);
    const [details, setDetails] = useState<any[]>([]);

    const handleSubmit = async () => {
        try {
            const response = await axiosInstance.post(`product/elisa`, {
                PIId: selectedPI.PIId,
                data: formData
            });

            const detailsWithId = details.map((d: any) => ({
                ...d,
                elisaId: response.data.elisaId, 
            }));
  
            if (details && details.length > 0) {
                try {
                    await axiosInstance.post(`product/elisaDetail`, {
                        PIId: selectedPI.PIId,
                        data: detailsWithId
                    });
                } catch (detailError) {
                    console.error('Failed to save test details:', detailError);
                }
            }

            // Navigate back to edit screen - data will be refreshed from database
            router.navigate('/product/elisa/edit');
        } catch (error) {
            console.error('Fetch Error:', error);
        }
    }

    return (
        <ScrollView>
            <ThemedView style={styles.container}>
                <ELISAForm
                    formData={formData}
                    setFormData={setFormData}
                    handleSubmit={handleSubmit}
                    setDetails={setDetails}
                    details={details}
                    PIId={selectedPI.PIId}
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
