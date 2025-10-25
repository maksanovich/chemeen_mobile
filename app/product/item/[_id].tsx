import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    ScrollView
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useLocalSearchParams } from "expo-router";

import ItemForm from '@/components/Forms/product/ItemForm';
import { ThemedView } from '@/components/ThemedView';

import { IItem, IPIDetail } from '@/constants/Interfaces';
import { DEFAULT_ITEM } from '@/constants/DefaultValues';

import axiosInstance from '@/utils/axiosInstance';

import { useSelector } from "@/store";
import { navigateBackWithFlow } from '@/utils/navigationHelper';

export default function ItemIdEditScreen() {
    const router = useRouter();
    const selectedPI: any = useSelector((state) => state.selectedPI.data);
    const { _id } = useLocalSearchParams();

    const [formData, setFormData] = useState<any>(DEFAULT_ITEM);
    const [details, setDetails] = useState<IPIDetail[]>([]);

    useEffect(() => {
        const fetchItemData = async () => {
            if (selectedPI.PIId && _id) {
                try {
                    const response = await axiosInstance.get(`product/item/${selectedPI.PIId}/${_id}`);
                    const { item, details: itemDetails } = response.data;
                    setFormData(item || {});
                    setDetails(itemDetails || []);
                } catch (error) {
                    console.error('Error fetching item data:', error);
                }
            }
        };

        fetchItemData();
    }, [_id, selectedPI.PIId]);

    const handleSubmit = async () => {
        try {
            const { ItemId, ...rest } = formData;

            let response = await axiosInstance.put(`product/item`, { ItemId, data: rest });
            const updatedItem = response.data;

            response = await axiosInstance.put(`product/itemDetail`, { ItemId, details });
            const updatedItemDetail = response.data;

            // Navigate back to item list - data will be refreshed from backend
            navigateBackWithFlow(`/product/item/edit`);
        } catch (error) {
            console.error("Fetch Error:", error);
        }
    };

    return (
        <>
            <Stack.Screen
                options={{
                    title: 'Edit Product',
                    headerShown: true
                }}
            />
            <ScrollView>
                <ThemedView style={styles.container}>
                    <ItemForm
                        formData={formData}
                        setFormData={setFormData}
                        details={details}
                        setDetails={setDetails}
                        handleSubmit={handleSubmit}
                        PRSPEnable={false}
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
});
