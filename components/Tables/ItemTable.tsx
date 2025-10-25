import React, { useEffect, useState } from 'react';
import { TextInput, StyleSheet, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedButton } from '../ThemedButton';
import { TabBarIcon } from '@/components/ThemedIcon';

import { useSelector, useDispatch } from "@/store";
import { setSelectedPIItem } from '@/store/reducers/selectedPI';
import axiosInstance from '@/utils/axiosInstance';

interface TraceAbilityProps {
    editable: boolean
}

const ItemTable: React.FC<TraceAbilityProps> = ({ editable }) => {
    const router = useRouter();
    const dispatch = useDispatch();

    const selectedPI: any = useSelector((state) => state.selectedPI.data);
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    // Fetch merged data from database when component mounts or PIId changes
    useEffect(() => {
        const fetchMergedData = async () => {
            if (selectedPI.PIId) {
                setLoading(true);
                try {
                    const response = await axiosInstance.get(`product/item/merged/${selectedPI.PIId}`);
                    setItems(response.data);
                } catch (error) {
                    console.error('Error fetching merged item data:', error);
                    Alert.alert('Error', 'Failed to load item data');
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchMergedData();
    }, [selectedPI.PIId]);

    const handleDelete = (index: number) => {
        Alert.alert(
            'Delete Item',
            'Are you sure you want to delete this item?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        const itemToDelete = items[index];

                        try {
                            await axiosInstance.delete(`product/item/${itemToDelete.ItemId}`);
                            
                            // Refresh data from database after successful deletion
                            const response = await axiosInstance.get(`product/item/merged/${selectedPI.PIId}`);
                            setItems(response.data);
                            
                        } catch (error) {
                            console.log(error, 'handle delete item===');
                            Alert.alert('Error', "This product cannot be deleted because it is associated with other records in the system.")
                        }
                    },
                },
            ]
        );
    };

    const renderItem = ({ item, index }: { item: any; index: number }) => (
        <ThemedView style={styles.row} key={index}>
            {editable && (
                <Pressable
                    style={styles.deleteBtn}
                    onPress={() => handleDelete(index)}
                >
                    <TabBarIcon name="trash" color="#c15153" />
                </Pressable>
            )}
            <Pressable onPress={() => router.push(`/product/item/${item.ItemId}`)}>
                <ThemedText
                    style={[styles.productCodeCell, { color: 'blue' }]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                >
                    {item.productCode}
                </ThemedText>
            </Pressable>
            <ThemedText style={styles.cell}>{item.totalCarton}</ThemedText>
            <ThemedText style={styles.cell}>{item.totalKgQty}</ThemedText>
            <ThemedText style={styles.cell}>{item.totalAmount}</ThemedText>
        </ThemedView>
    );


    const handleAdd = () => {
        router.navigate('/product/item/create');
    }

    return (
        <ThemedView style={styles.container}>
            <ThemedView style={[!editable && styles.hidden]}>
                <ThemedButton text="Add" onPressEvent={handleAdd} />
            </ThemedView>

            <ThemedView style={styles.row}>
                {editable && (
                    <ThemedText style={styles.actionHeaderCell}>Action</ThemedText>
                )}
                <ThemedText style={styles.productCodeHeader}>Product code</ThemedText>
                <ThemedText style={styles.headerCell}>Cartons</ThemedText>
                <ThemedText style={styles.headerCell}>KgQTY</ThemedText>
                <ThemedText style={styles.headerCell}>Amount</ThemedText>
            </ThemedView>

            {loading ? (
                <ThemedText style={styles.loadingText}>Loading items...</ThemedText>
            ) : items.length > 0 ? (
                items.map((item, index) => renderItem({ item, index }))
            ) : (
                <ThemedText style={styles.noDataText}>No items found</ThemedText>
            )}
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 10,
        marginHorizontal: 10,
        marginVertical: 20,
        elevation: 5,
        backgroundColor: '#fff',
        borderRadius: 10,
        minWidth: 500, // Set minimum width to prevent 100% width
    },
    row: {
        flexDirection: 'row',
        marginBottom: 10,
        justifyContent: 'space-between',
        padding: 5,
    },
    itemRow: {
        flexDirection: 'row',
        marginBottom: 4,
        padding: 5,
    },
    actionHeaderCell: {
        fontSize: 15,
        width: 60,
        padding: 5,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    headerCell: {
        fontSize: 16,
        width: 100,
        padding: 5,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    productCodeHeader: {
        width: 200,
        padding: 5,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    deleteBtn: {
        width: 60,
        padding: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    productCodeCell: {
        width: 200,
        textDecorationLine: 'underline',
        color: '#007AFF',
    },
    footerCell: {
        width: 100,
        padding: 5,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    cell: {
        width: 100,
        textAlign: 'center',
        color: '#000',
    },
    editableCell: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 8,
        marginHorizontal: 5,
        textAlign: 'center',
        color: '#000',
    },
    datePicker: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    hidden: {
        display: 'none',
    },
    loadingText: {
        textAlign: 'center',
        padding: 20,
        fontSize: 16,
        color: '#666',
    },
    noDataText: {
        textAlign: 'center',
        padding: 20,
        fontSize: 16,
        color: '#999',
    },
});

export default ItemTable;
