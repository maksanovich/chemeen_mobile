import React, { useState } from 'react';
import {
    StyleSheet,
    ScrollView
} from 'react-native';
import { navigateWithFlow } from '@/utils/navigationHelper';

import ItemForm from '@/components/Forms/product/ItemForm';
import { ThemedView } from '@/components/ThemedView';

import { IItem, IPIDetail } from '@/constants/Interfaces';
import { DEFAULT_ITEM } from '@/constants/DefaultValues';

import axiosInstance from '@/utils/axiosInstance';

import { useSelector } from "@/store";

export default function ItemCreateScreen() {
    const selectedPI: any = useSelector((state) => state.selectedPI.data);

    const [formData, setFormData] = useState<IItem>(DEFAULT_ITEM);
    const [details, setDetails] = useState<IPIDetail[]>([]);

    const handleSubmit = async () => {
        try {
            let response = await axiosInstance.post(`product/item`, { PIId: selectedPI.PIId, data: formData });
            const newItem = response.data;

            response = await axiosInstance.post(`product/itemDetail`, { ItemId: newItem.ItemId, details });

            // Navigate back to item list - data will be refreshed from backend
            navigateWithFlow("/product/item/edit", true);
        } catch (error) {
            console.error("Fetch Error:", error);
        }
    };

    return (
        <ScrollView>
            <ThemedView style={styles.container}>
                <ItemForm
                    formData={formData}
                    setFormData={setFormData}
                    details={details}
                    setDetails={setDetails}
                    handleSubmit={handleSubmit}
                    PRSPEnable={true}
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
