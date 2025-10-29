import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    ScrollView
} from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';

import ELISAForm from '@/components/Forms/product/ELISAForm';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedButton } from '@/components/ThemedButton';

import axiosInstance from '@/utils/axiosInstance';
import { showError, showSuccessToast } from '@/utils/alertHelper';

import { IElisa } from '@/constants/Interfaces';
import { DEFAULT_ELISA } from '@/constants/DefaultValues';

import { useSelector } from "@/store";

export default function ELISAItemScreen() {
    const router = useRouter();
    const { _id } = useLocalSearchParams();
    const selectedPI: any = useSelector((state) => state.selectedPI.data);

    const [formData, setFormData] = useState<IElisa>(DEFAULT_ELISA);
    const [details, setDetails] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (_id && _id !== 'new') {
            loadELISAItem();
        } else {
            setLoading(false);
        }
    }, [_id, selectedPI]);

    const loadELISAItem = async () => {
        try {
            setLoading(true);

            // Fetch ELISA data from database
            const elisaResponse = await axiosInstance.get(`product/elisa/${selectedPI.PIId}`);
            const elisaItems = Array.isArray(elisaResponse.data) ? elisaResponse.data : [];

            const elisaItem = elisaItems.find((item: any) => item.elisaId?.toString() === _id);
            if (elisaItem) {
                setFormData(elisaItem);
            }

            // Fetch ELISA detail data from database
            try {
                const detailResponse = await axiosInstance.get(`product/elisaDetail/${_id}`);
                const elisaDetailItems = detailResponse.data || [];
                setDetails(elisaDetailItems);
            } catch (detailError) {
                console.log('No ELISA details found for this item');
                setDetails([]);
            }

        } catch (error) {
            console.error('Failed to load ELISA item:', error);
            showError('Error', 'Failed to load ELISA data');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        try {
            const response = await axiosInstance.put(`product/elisa/${_id}`, {
                PIId: selectedPI.PIId,
                data: formData
            });

            const resDetail = await axiosInstance.put(`product/elisaDetail/${_id}`, {
                PIId: selectedPI.PIId,
                data: details
            });

            // Navigate back to edit screen - data will be refreshed from database
            showSuccessToast('ELISA data saved successfully!');
            router.navigate('/product/elisa/edit');
        } catch (error) {
            console.error('Fetch Error:', error);
            showError('Error', 'Failed to save ELISA data');
        }
    };


    if (loading) {
        return (
            <>
                <Stack.Screen
                    options={{
                        title: 'Edit Elisa Item',
                        headerShown: true
                    }}
                />
                <ScrollView>
                    <ThemedView style={styles.container}>
                        <ThemedView style={styles.loadingContainer}>
                            <ThemedText style={styles.loadingText}>Loading...</ThemedText>
                        </ThemedView>
                    </ThemedView>
                </ScrollView>
            </>
        );
    }

    return (
        <>
            <Stack.Screen
                options={{
                    title: 'Edit Elisa Item',
                    headerShown: true
                }}
            />
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
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    titleContainer: {
        flex: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 50,
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
    },
});
