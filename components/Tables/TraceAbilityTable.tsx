import React, { useEffect, useState } from 'react';
import { TextInput, StyleSheet, Alert, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedButton } from '../ThemedButton';

import axiosInstance from '@/utils/axiosInstance';
import { showBalanceError, showSaveValidationError, showSuccessToast, showError, showWarning } from '@/utils/alertHelper';

import { useSelector } from "@/store";
import { ThemedDatePicker } from '../ThemedDatePicker';

interface TraceAbilityProps {
    editable: boolean
}

interface ITraceAbility {
    ItemId: number,
    productDate: string,
    rawMaterialQty: string,
    headlessQty: string,
    code: string,
    productCode: string,
    total: string,
    usedCase: string,
    ballanceCase: string,
    farmName: string,
    beforeDate: string,
}

const TraceAbilityTable: React.FC<TraceAbilityProps> = ({ editable }) => {
    const router = useRouter();

    const selectedPI: any = useSelector((state) => state.selectedPI.data);

    const [items, setItems] = useState<ITraceAbility[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    // Fetch traceability data from database when component mounts or PIId changes
    useEffect(() => {
        const fetchTraceAbilityData = async () => {
            if (selectedPI.PIId) {
                setLoading(true);
                try {
                    const response = await axiosInstance.get(`product/traceAbility?type=formatted&PIId=${selectedPI.PIId}`);
                    setItems(response.data);
        } catch (error) {
                    console.error('Error fetching traceability data:', error);
                } finally {
                    setLoading(false);
                }
        }
    };

        fetchTraceAbilityData();
    }, [selectedPI.PIId]);


    const calculateFooterTotals = () => {
        if (items.length === 0) {
            return {
                totalRawMaterialQty: 0,
                totalHeadlessQty: 0,
                total: 0,
                totalUsedcase: 0,
                totalBallance: 0,
            };
        }

        const totalRawMaterialQty = items.reduce((sum, row) => sum + (parseFloat(row.rawMaterialQty) || 0), 0);
        const totalHeadlessQty = items.reduce((sum, row) => sum + (parseFloat(row.headlessQty) || 0), 0);
        const total = items.reduce((sum, row) => sum + (parseFloat(row.total) || 0), 0);
        const totalUsedcase = items.reduce((sum, row) => sum + (parseFloat(row.usedCase) || 0), 0);
        const totalBallance = items.reduce((sum, row) => sum + (parseFloat(row.ballanceCase) || 0), 0);

        return {
            totalRawMaterialQty,
            totalHeadlessQty,
            total,
            totalUsedcase,
            totalBallance,
        };
    };

    const handleChange = (value: string, index: number, field: keyof ITraceAbility) => {
        // Clean and validate numeric inputs
        if (field === 'rawMaterialQty' || field === 'headlessQty' || field === 'usedCase') {
            // Remove any non-numeric characters except decimal point
            value = value.replace(/[^0-9.]/g, '');
            
            // Prevent multiple decimal points
            const parts = value.split('.');
            if (parts.length > 2) {
                value = parts[0] + '.' + parts.slice(1).join('');
            }
            
            // Handle empty string
            if (value === '' || value === '.') {
                value = '0';
            }
        }

        if (field === 'productDate') {
            const parsedDate = new Date(value);

            parsedDate.setDate(parsedDate.getDate() - 1);

            const updatedItems = [...items];
            updatedItems[index] = {
                ...updatedItems[index],
                [field]: value,
                beforeDate: parsedDate.toISOString().split('T')[0],
            };
            setItems(updatedItems);
        } else {
            const updatedItems = [...items];
            
            // Special validation for usedCase
            if (field === 'usedCase') {
                const total = parseFloat(updatedItems[index].total) || 0;
                const usedCase = parseFloat(value) || 0;
                
                // Check if usedCase exceeds total
                if (usedCase > total) {
                    showBalanceError(usedCase, total, updatedItems[index].productCode);
                    // Cap the value at total (max limit)
                    value = total.toString();
                }
                
                const cappedUsedCase = parseFloat(value) || 0;
                const balance = total - cappedUsedCase;
                
                updatedItems[index] = {
                    ...updatedItems[index],
                    [field]: value,
                    ballanceCase: balance.toString(),
                };
            } else {
                updatedItems[index] = {
                    ...updatedItems[index],
                    [field]: value,
                };
            }
            
            setItems(updatedItems);
        }
    };

    const handleSave = async () => {
        let bValid = false;
        const negativeBalanceItems: string[] = [];
        
        for (let item of items) {
            if (!item.productDate || !item.rawMaterialQty || !item.headlessQty) {
                bValid = true;
            }
            
            // Check for negative balance
            const balance = parseFloat(item.ballanceCase) || 0;
            if (balance < 0) {
                negativeBalanceItems.push(`${item.productCode} (Code: ${item.code}): Balance = ${balance}`);
            }
        }

        if (negativeBalanceItems.length > 0) {
            showSaveValidationError(negativeBalanceItems);
            return;
        }

        if (bValid) {
            showWarning('Missing Required Fields', 'Please fill in Production Date, Raw Material Qty, and Headless Qty for all items.');
            return;
        }

        try {
            const newItems = items.map((it: any) => {
                const { PRSId, PRSName, PRSTId, PRSTName, productCode, ...rest } = it;
                return {
                    ...rest,
                    total: rest.totalCartons || '0',
                    productDate: rest.productDate || '',
                    rawMaterialQty: rest.rawMaterialQty || '0',
                    headlessQty: rest.headlessQty || '0',
                    ballanceCase: rest.ballanceCase || '0',
                    usedCase: rest.usedCase || '0',
                    beforeDate: rest.beforeDate || '',
                };
            });

            // Check if traceability data exists by trying to fetch it
            try {
                await axiosInstance.get(`product/traceAbility?type=formatted&PIId=${selectedPI.PIId}`);
                // If we get here, data exists, so update
                await axiosInstance.put('product/traceAbility/', {
                    PIId: selectedPI.PIId,
                    data: newItems
                });
            } catch (error) {
                // If error, data doesn't exist, so create
                await axiosInstance.post('product/traceAbility/', {
                    PIId: selectedPI.PIId,
                    data: newItems
                });
            }

            // Refresh data from database after successful save
            const response = await axiosInstance.get(`product/traceAbility?type=formatted&PIId=${selectedPI.PIId}`);
            setItems(response.data);

            showSuccessToast('Traceability data saved successfully!');
            router.navigate('/product');
        } catch (error: any) {
            console.error('Fetch Error:', error);
            const errorMsg = error.response?.data?.details || error.response?.data?.error || 'Failed to save traceability data';
            showError('Save Failed', errorMsg);
        }
    };

    const renderItem = ({ item, index }: { item: ITraceAbility; index: number }) => (
        <ThemedView style={styles.row} key={index}>
            <ThemedDatePicker
                style={[styles.datePickerCell, styles.datePicker, editable && styles.editableCell]}
                label={''}
                require={false}
                name={'productDate'}
                selectedValue={item.productDate}
                handleChange={(name: keyof ITraceAbility, value: string) => handleChange(value, index, name)}
                editable={editable}
            />
            <TextInput
                style={[styles.cell, editable && styles.editableCell]}
                value={item.rawMaterialQty}
                onChangeText={(text) => handleChange(text, index, 'rawMaterialQty')}
                placeholder="0"
                keyboardType="numeric"
                editable={editable}
            />
            <TextInput
                style={[styles.cell, editable && styles.editableCell]}
                value={item.headlessQty}
                onChangeText={(text) => handleChange(text, index, 'headlessQty')}
                placeholder="0"
                keyboardType="numeric"
                editable={editable}
            />
            <TextInput
                style={styles.cell}
                value={item.code}
                editable={false}
            />
            <Pressable onPress={() => router.push(`/product/item/${item.ItemId}`)}>
                <Text
                    style={[styles.productCodeCell, styles.clickableText]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                >
                    {item.productCode}
                </Text>
            </Pressable>
            <TextInput
                style={styles.cell}
                value={item.total || '0'}
                editable={false}
            />
            <TextInput
                style={[styles.cell, editable && styles.editableCell]}
                value={item.usedCase}
                onChangeText={(text) => handleChange(text, index, 'usedCase')}
                placeholder="0"
                keyboardType="numeric"
                editable={editable}
            />
            <TextInput
                style={[
                    styles.cell, 
                    styles.disabledCell,
                    parseFloat(item.ballanceCase) < 0 && styles.negativeBalance
                ]}
                value={item.ballanceCase}
                placeholder="0"
                keyboardType="numeric"
                editable={false}
            />
            <TextInput
                style={styles.cell}
                value={item.farmName}
                editable={false}
            />
            <TextInput
                style={styles.cell}
                value={item.beforeDate}
                editable={false}
            />
        </ThemedView>
    );

    const { totalRawMaterialQty, totalHeadlessQty, total, totalUsedcase, totalBallance } = calculateFooterTotals();

    return (
        <ThemedView style={styles.container}>
            <ThemedView style={[!editable && styles.hidden]}>
                <ThemedButton text="Save" onPressEvent={handleSave} />
            </ThemedView>

            <ThemedView style={styles.row}>
                <ThemedText style={[styles.headerCell, { width: 140 }]}>Production Date</ThemedText>
                <ThemedText style={styles.headerCell}>Raw Material Qty</ThemedText>
                <ThemedText style={styles.headerCell}>Headless Qty</ThemedText>
                <ThemedText style={styles.headerCell}>Code</ThemedText>
                <ThemedText style={styles.productCodeHeader}>Product Code</ThemedText>
                <ThemedText style={styles.headerCell}>Total</ThemedText>
                <ThemedText style={styles.headerCell}>Used Case</ThemedText>
                <ThemedText style={styles.headerCell}>Balance Case (Calc)</ThemedText>
                <ThemedText style={styles.headerCell}>Traceability</ThemedText>
                <ThemedText style={styles.headerCell}>Before Date</ThemedText>
            </ThemedView>

            {loading ? (
                <ThemedText style={styles.loadingText}>Loading traceability data...</ThemedText>
            ) : items.length > 0 ? (
                items.map((item, index) => renderItem({ item, index }))
            ) : (
                <ThemedText style={styles.noDataText}>No traceability data found</ThemedText>
            )}

            <ThemedView style={styles.row}>
                <ThemedText style={[styles.footerCell, { width: 140 }]}>TOTAL</ThemedText>
                <ThemedText style={styles.footerCell}>{totalRawMaterialQty.toFixed(2)}</ThemedText>
                <ThemedText style={styles.footerCell}>{totalHeadlessQty.toFixed(2)}</ThemedText>
                <ThemedText style={styles.footerCell}></ThemedText>
                <ThemedText style={styles.productCodeFooter}></ThemedText>
                <ThemedText style={styles.footerCell}>{total.toFixed(0)}</ThemedText>
                <ThemedText style={styles.footerCell}>{totalUsedcase.toFixed(0)}</ThemedText>
                <ThemedText style={styles.footerCell}>{totalBallance.toFixed(0)}</ThemedText>
                <ThemedText style={styles.footerCell}></ThemedText>
                <ThemedText style={styles.footerCell}></ThemedText>
            </ThemedView>
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
        minWidth: 1200,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 10,
        padding: 5,
        alignItems: 'center',
    },
    itemRow: {
        flexDirection: 'row',
        marginBottom: 4,
        padding: 5,
    },
    headerCell: {
        width: 100,
        padding: 5,
        fontWeight: 'bold',
        textAlign: 'center',
        flex: 0,
    },
    productCodeHeader: {
        width: 200,
        padding: 5,
        fontWeight: 'bold',
        textAlign: 'left',
        flex: 0,
    },
    footerCell: {
        width: 100,
        padding: 5,
        fontWeight: 'bold',
        textAlign: 'center',
        flex: 0,
    },
    productCodeFooter: {
        width: 200,
        padding: 5,
        fontWeight: 'bold',
        textAlign: 'left',
        flex: 0,
    },
    cell: {
        width: 100,
        textAlign: 'center',
        color: '#000',
        flex: 0,
    },
    datePickerCell: {
        width: 100,
        textAlign: 'center',
        color: '#000',
        flex: 0,
    },
    productCodeCell: {
        width: 200,
        textAlign: 'left',
        color: '#000',
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
    disabledCell: {
        backgroundColor: '#f5f5f5',
        color: '#666',
        padding: 8,
        marginHorizontal: 5,
        textAlign: 'center',
    },
    negativeBalance: {
        backgroundColor: '#ffebee',
        color: '#c62828',
        borderColor: '#ef5350',
        borderWidth: 2,
        fontWeight: 'bold',
    },
    datePicker: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: 100,
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

export default TraceAbilityTable;
