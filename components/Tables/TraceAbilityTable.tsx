import React, { useEffect, useState } from 'react';
import { TextInput, StyleSheet, Text, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedButton } from '../ThemedButton';

import axiosInstance from '@/utils/axiosInstance';
import { showBalanceError, showValidationError, showSuccessToast, showError, showWarning, showSimpleAlert } from '@/utils/alertHelper';

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
                    console.log('Traceability data received:', response.data);
                    // Ensure each item has its own unique object reference
                    const itemsWithUniqueRefs = response.data.map((item: ITraceAbility) => ({ ...item }));
                    setItems(itemsWithUniqueRefs);
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
        if (field === 'rawMaterialQty' || field === 'headlessQty' || field === 'usedCase' || field === 'ballanceCase') {
            // Remove any non-numeric characters except decimal point
            value = value.replace(/[^0-9.]/g, '');

            // Prevent multiple decimal points
            const parts = value.split('.');
            if (parts.length > 2) {
                value = parts[0] + '.' + parts.slice(1).join('');
            }

            // Remove leading zeros (e.g., "023" -> "23", "0.5" -> "0.5")
            if (value.length > 1 && value[0] === '0' && value[1] !== '.') {
                value = value.replace(/^0+/, '') || '0';
            }

            // Handle empty string
            if (value === '' || value === '.') {
                value = '0';
            }
        }

        // Update only the specific item at the specified index
        setItems((prevItems) => {
            // Create a new array
            const updatedItems = [...prevItems];

            // Only update the item at the specified index
            if (field === 'productDate') {
                const parsedDate = new Date(value);
                parsedDate.setFullYear(parsedDate.getFullYear() + 2);

                // Create a new object with updated fields for the changed item only
                updatedItems[index] = {
                    ...prevItems[index],
                    [field]: value,
                    beforeDate: parsedDate.toISOString().split('T')[0],
                };
            } else {
                // Special validation for usedCase
                if (field === 'usedCase') {
                    const total = parseFloat(prevItems[index].total) || 0;
                    const usedCase = parseFloat(value) || 0;

                    // Check if usedCase exceeds total
                    if (usedCase > total) {
                        showBalanceError(usedCase, total, prevItems[index].productCode);
                        // Cap the value at total (max limit)
                        value = total.toString();
                    }
                }

                // Create a new object with updated field for the changed item only
                updatedItems[index] = {
                    ...prevItems[index],
                    [field]: value,
                };
            }

            return updatedItems;
        });
    };

    const handleSave = async () => {
        console.log('Save button clicked, validating items:', items);

        // Check for missing dates specifically
        const missingDates: string[] = [];
        const missingFields: string[] = [];

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const rowNumber = i + 1;

            console.log(`Row ${rowNumber}:`, {
                productDate: item.productDate,
                rawMaterialQty: item.rawMaterialQty,
                headlessQty: item.headlessQty,
                code: item.code
            });

            // Check for missing production date
            if (!item.productDate || item.productDate === '' || item.productDate === 'Select Date') {
                missingDates.push(`Row ${rowNumber} (Code: ${item.code})`);
            }

            // Check for missing quantities (including 0 values)
            const rawMaterialQty = parseFloat(item.rawMaterialQty) || 0;
            const headlessQty = parseFloat(item.headlessQty) || 0;

            if (rawMaterialQty <= 0) {
                missingFields.push(`Row ${rowNumber} (Code: ${item.code}): Raw Material Qty`);
            }

            if (headlessQty <= 0) {
                missingFields.push(`Row ${rowNumber} (Code: ${item.code}): Headless Qty`);
            }
        }

        console.log('Validation results:', { missingDates, missingFields });

        // Show specific error for missing dates
        if (missingDates.length > 0) {
            console.log('Showing date error...');
            showError('Date is not selected', `Please select Production Date for the following items:\n\n${missingDates.join('\n')}`);
            return;
        }

        // Show error for missing quantities
        if (missingFields.length > 0) {
            console.log('Showing quantity error...');
            showError('Missing Required Fields', `Please fill in the following fields:\n\n${missingFields.join('\n')}`);
            return;
        }

        try {
            const newItems = items.map((it: any) => {
                const { PRSId, PRSName, PRSTId, PRSTName, productCode, ...rest } = it;
                return {
                    ...rest,
                    ItemId: it.ItemId, // Explicitly include ItemId
                    code: it.code, // Explicitly include code to ensure proper identification
                    total: rest.totalCartons || '0',
                    productDate: rest.productDate || '',
                    rawMaterialQty: rest.rawMaterialQty || '0',
                    headlessQty: rest.headlessQty || '0',
                    ballanceCase: rest.ballanceCase || '',
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
            // Ensure each item has its own unique object reference
            const itemsWithUniqueRefs = response.data.map((item: ITraceAbility) => ({ ...item }));
            setItems(itemsWithUniqueRefs);

            console.log('Save successful, showing success message');
            showSuccessToast('Traceability data saved successfully!');
        } catch (error: any) {
            console.error('Fetch Error:', error);
            const errorMsg = error.response?.data?.details || error.response?.data?.error || 'Failed to save traceability data';
            showError('Save Failed', errorMsg);
        }
    };

    const renderItem = ({ item, index }: { item: ITraceAbility; index: number }) => {
        const rowKey = `traceability-row-${item.ItemId}-${item.code}-${index}`;
        return (
            <ThemedView key={rowKey} style={styles.row}>
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
                    key={`rawMaterialQty-${item.ItemId}-${item.code}-${index}`}
                    style={[styles.cell, editable && styles.editableCell]}
                    value={item.rawMaterialQty || ''}
                    onChangeText={(text) => handleChange(text, index, 'rawMaterialQty')}
                    placeholder="0"
                    keyboardType="numeric"
                    editable={editable}
                />
                <TextInput
                    key={`headlessQty-${item.ItemId}-${item.code}-${index}`}
                    style={[styles.cell, editable && styles.editableCell]}
                    value={item.headlessQty || ''}
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
                    key={`usedCase-${item.ItemId}-${item.code}-${index}`}
                    style={[styles.cell, editable && styles.editableCell]}
                    value={item.usedCase || ''}
                    onChangeText={(text) => handleChange(text, index, 'usedCase')}
                    placeholder="0"
                    keyboardType="numeric"
                    editable={editable}
                />
                <TextInput
                    key={`ballanceCase-${item.ItemId}-${item.code}-${index}`}
                    style={[
                        styles.cell,
                        editable && styles.editableCell
                    ]}
                    value={item.ballanceCase || ''}
                    onChangeText={(text) => {
                        console.log('Balance Case changed:', text, 'for item:', item.code);
                        handleChange(text, index, 'ballanceCase');
                    }}
                    placeholder=""
                    keyboardType="numeric"
                    editable={editable}
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
    };

    const { totalRawMaterialQty, totalHeadlessQty, total, totalUsedcase, totalBallance } = calculateFooterTotals();

    return (
        <ThemedView style={styles.container}>
            <ThemedView style={[!editable && styles.hidden]}>
                <ThemedText style={styles.noteText}>
                    Balance Case is MANUAL ENTRY ONLY. Users must calculate and enter values since Code Totals are not tracked in the system.
                </ThemedText>
                <ThemedButton text="Save" onPressEvent={handleSave} />
            </ThemedView>

            <ThemedView style={styles.row}>
                <ThemedText style={[styles.headerCell, { width: 140 }]}>Production Date</ThemedText>
                <ThemedText style={styles.headerCell}>Raw Material Qty</ThemedText>
                <ThemedText style={styles.headerCell}>Headless Qty</ThemedText>
                <ThemedText style={styles.headerCell}>Code</ThemedText>
                <ThemedText style={styles.productCodeHeader}>Product Description</ThemedText>
                <ThemedText style={styles.headerCell}>Total</ThemedText>
                <ThemedText style={styles.headerCell}>Used Case</ThemedText>
                <ThemedText style={styles.headerCell}>Balance Case (Manual)</ThemedText>
                <ThemedText style={styles.headerCell}>Traceability</ThemedText>
                <ThemedText style={styles.headerCell}>Best Before Date</ThemedText>
            </ThemedView>
            <ScrollView>
                {loading ? (
                    <ThemedText style={styles.loadingText}>Loading traceability data...</ThemedText>
                ) : items.length > 0 ? (
                    items.map((item, index) => renderItem({ item, index }))
                ) : (
                    <ThemedText style={styles.noDataText}>No traceability data found</ThemedText>
                )}
            </ScrollView>
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
    noteText: {
        fontSize: 12,
        color: '#666',
        fontStyle: 'italic',
        textAlign: 'center',
        marginBottom: 10,
        paddingHorizontal: 20,
    },
});

export default TraceAbilityTable;

