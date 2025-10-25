import React, { useEffect, useState } from 'react';
import { StyleSheet, Alert, Pressable, Text } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedButton } from '../ThemedButton';
import { TabBarIcon } from '@/components/ThemedIcon';

import axiosInstance from '@/utils/axiosInstance';

import { useSelector } from "@/store";

interface ELISAProps {
    editable: boolean
}

interface IELISA {
    elisaId: string,
    code: string,
    productionCode: string,
    testReportNo: string,
    testReportDate: string,
    rawMeterialDate: string,
    samplingReceiptDate: string,
    testedBy: string,
    pondId?: string,
    rawMaterialReceived?: string,
    rawMaterialType?: string,
    sampleDrawnBy?: string,
    sampleId?: string,
    samplingDate?: string,
    PIId?: number,
    createdAt?: string,
    updatedAt?: string,
}

const DEFAULT_ELISA = {
    elisaId: '',
    code: '',
    productionCode: '',
    testReportNo: '',
    testReportDate: '',
    rawMeterialDate: '',
    samplingReceiptDate: '',
    testedBy: '',
}

const ElisaDetailTable: React.FC<ELISAProps> = ({ editable }) => {
    const router = useRouter();

    const selectedPI: any = useSelector((state) => state.selectedPI.data);

    const [items, setItems] = useState<any[]>([]);
    const [productCodeOptions, setProductCodeOptions] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    // Fetch ELISA data from database when component mounts or PIId changes
    useEffect(() => {
        const fetchElisaData = async () => {
            if (selectedPI.PIId) {
                setLoading(true);
                try {
                    const response = await axiosInstance.get(`product/elisa/${selectedPI.PIId}`);
                    setItems(response.data || []);
                } catch (error) {
                    console.error('Error fetching ELISA data:', error);
                    setItems([]);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchElisaData();
    }, [selectedPI.PIId]);

    // Fetch product code options
    useEffect(() => {
        getProductCodeList();
    }, [selectedPI.PIId]);


    const getProductCodeList = async () => {
        try {
            const response = await axiosInstance.get(`product/item/${selectedPI.PIId}`);
            const codeOptions = response.data.map((code: any) => ({
                label: code.PRSName + ' ' + code.PRSTName,
                value: code.ItemId
            }));
            setProductCodeOptions(codeOptions);
        } catch (error) {
            console.error('Failed to fetch product code list:', error);
        }
    };

    const handleAdd = () => {
        router.push('/product/elisa/create');
    };

    const handleDelete = async (index: number) => {
        try {
            const itemToDelete = items[index];
            if (itemToDelete.elisaId) {
                // Delete from backend
                await axiosInstance.delete(`product/elisa/${itemToDelete.elisaId}`);
                
                // Refresh data from database after successful deletion
                const response = await axiosInstance.get(`product/elisa/${selectedPI.PIId}`);
                setItems(response.data || []);
                
                console.log('Item deleted successfully');
            } else {
                // If no elisaId, just remove from local state (new item not saved yet)
                const updatedItems = items.filter((_, i) => i !== index);
                setItems(updatedItems);
            }
        } catch (error) {
            console.error('Failed to delete item:', error);
            Alert.alert('Error', 'Failed to delete ELISA item');
        }
    };

    const renderItem = ({ item, index }: { item: any; index: number }) => (
        <ThemedView style={styles.row} key={index}>
            {editable && (
                <ThemedView style={styles.actionButtonsContainer}>
                    <Pressable
                        style={styles.iconBtn}
                        onPress={() => handleDelete(index)}
                    >
                        <TabBarIcon name="trash" color="#c15153" />
                    </Pressable>
                    <Pressable
                        style={styles.iconBtn}
                        onPress={() => {
                            router.push(`/product/elisa/${item.elisaId || 'new'}` as any);
                        }}
                    >
                        <TabBarIcon name="pencil" color="#4a90e2" />
                    </Pressable>
                </ThemedView>
            )}

            <Text style={styles.cell}>
                {item.code || 'N/A'}
            </Text>

            <Pressable
                style={styles.testReportContainer}
                onPress={() => {
                    router.push(`/product/item/${item.ItemId || 'new'}` as any);
                }}
            >
                <Text
                    style={[styles.cell, styles.productCodeLink]}
                    numberOfLines={1}
                    ellipsizeMode='tail'
                >
                    {productCodeOptions.find(opt => opt.value === item.ItemId)?.label || 'N/A'}
                </Text>
            </Pressable>

            <Text style={styles.cell}>
                {item.testReportNo || 'N/A'}
            </Text>

            <Text style={styles.cell}>
                {item.testReportDate ? new Date(item.testReportDate).toLocaleDateString() : 'N/A'}
            </Text>

            <Text style={styles.cell}>
                {item.rawMeterialDate ? new Date(item.rawMeterialDate).toLocaleDateString() : 'N/A'}
            </Text>

            <Text style={styles.cell}>
                {item.samplingReceiptDate ? new Date(item.samplingReceiptDate).toLocaleDateString() : 'N/A'}
            </Text>

            <Text style={styles.cell}>
                {item.testedBy || 'N/A'}
            </Text>
        </ThemedView>
    );

    return (
        <ThemedView style={styles.container}>
            <ThemedView style={[styles.buttonContainer, !editable && styles.hidden]}>
                <ThemedButton text="Add" onPressEvent={handleAdd} />
            </ThemedView>

            <ThemedView style={styles.row}>
                <ThemedView style={[styles.actionHeaderCell, !editable && styles.hidden]}>
                    <ThemedText style={styles.headerText}>Actions</ThemedText>
                </ThemedView>
                <ThemedText style={styles.headerCell}>Code</ThemedText>
                <ThemedText style={styles.headerCell}>Product Code</ThemedText>
                <ThemedText style={styles.headerCell}>Test Report No</ThemedText>
                <ThemedText style={styles.headerCell}>Test Report Date</ThemedText>
                <ThemedText style={styles.headerCell}>Raw Material Date</ThemedText>
                <ThemedText style={styles.headerCell}>Sample Receipt Date</ThemedText>
                <ThemedText style={styles.headerCell}>Tested By</ThemedText>
            </ThemedView>

            {loading ? (
                <ThemedView style={styles.row}>
                    <ThemedText style={styles.loadingText}>Loading ELISA data...</ThemedText>
                </ThemedView>
            ) : items && Array.isArray(items) && items.length > 0 ? (
                items.map((item, index) => {
                    return renderItem({ item, index });
                })
            ) : (
                <ThemedView style={styles.row}>
                    <ThemedText style={styles.noDataText}>No ELISA data available. Click "Add" to create new entries.</ThemedText>
                </ThemedView>
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
        minWidth: 950,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 10,
        padding: 5,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    headerCell: {
        width: 150,
        padding: 5,
        fontWeight: 'bold',
        textAlign: 'center',
        flex: 0,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginBottom: 15,
        gap: 10,
    },
    actionButtonsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: 100,
        flex: 0,
    },
    actionHeaderCell: {
        width: 100,
        padding: 5,
        flex: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerText: {
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 12,
    },
    cell: {
        width: 150,
        textAlign: 'center',
        color: '#000',
        flex: 0,
        padding: 8,
        fontSize: 15,
    },
    iconBtn: {
        width: 40,
        padding: 8,
        alignItems: 'center',
        justifyContent: 'center',
        flex: 0,
        marginHorizontal: 2,
    },
    productCodeCell: {
        width: 150,
        textAlign: 'left',
        color: '#000',
        flex: 0,
        padding: 8,
        fontSize: 12,
    },
    testReportContainer: {
        width: 150,
        padding: 5,
        flex: 0,
    },
    productCodeLink: {
        fontSize: 15,
        color: '#007AFF',
        textDecorationLine: 'underline',
        fontWeight: '500',
    },
    pickerContainer: {
        width: 150,
        padding: 5,
        flex: 0,
    },
    clickableText: {
        color: '#007AFF',
        textDecorationLine: 'underline',
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
        justifyContent: 'center',
        width: 150,
    },
    hidden: {
        display: 'none',
    },
    noDataText: {
        textAlign: 'center',
        color: '#666',
        fontStyle: 'italic',
        padding: 20,
    },
    loadingText: {
        textAlign: 'center',
        padding: 20,
        fontSize: 16,
        color: '#666',
    },
});

export default ElisaDetailTable;