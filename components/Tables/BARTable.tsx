import React, { useEffect, useState, useCallback } from 'react';
import { TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedButton } from '@/components/ThemedButton';
import { TabBarIcon } from '@/components/ThemedIcon';
import { ThemedPicker } from '@/components/ThemedPicker';

import axiosInstance from '@/utils/axiosInstance';
import {
    showSuccessToast,
    showError,
    showWarning,
    showDateValidationError,
    showInfo
} from '@/utils/alertHelper';

import { useSelector } from "@/store";
import { ThemedDatePicker } from '../ThemedDatePicker';

interface BARProps {
    editable: boolean
}

interface IBAR {
    BARId: string,
    code: string,
    ItemId: string,
    analysisDate: string,
    completionDate: string,
    totalPlateCnt: string,
    ECFU: string,
    SCFU: string,
    salmone: string,
    vibrioC: string,
    vibrioP: string,
    listeria: string,
}

const DEFAULT_BAR = {
    BARId: '',
    code: '',
    ItemId: '',
    analysisDate: '',
    completionDate: '',
    totalPlateCnt: '',
    ECFU: 'Nil',
    SCFU: 'Nil',
    salmone: 'Absent',
    vibrioC: 'Absent',
    vibrioP: 'Absent',
    listeria: 'Absent',
}

const BARTable: React.FC<BARProps> = ({ editable }) => {
    const router = useRouter();

    const selectedPI: any = useSelector((state) => state.selectedPI.data);

    const [items, setItems] = useState<IBAR[]>([]);
    const [codes, setCodes] = useState<any[]>([]);
    const [data, setData] = useState<any[]>([]);
    const [productCodeOptions, setProductCodeOptions] = useState<{ [key: number]: any[] }>({});
    const [loading, setLoading] = useState<boolean>(false);
    const [traceabilityData, setTraceabilityData] = useState<any[]>([]); // Store traceability data for date validation

    // Fetch BAR data from database when component mounts or PIId changes
    useEffect(() => {
        const fetchBARData = async () => {
            if (selectedPI.PIId) {
                setLoading(true);
                try {
                    // Fetch existing BAR data
                    const barResponse = await axiosInstance.get(`product/bar/${selectedPI.PIId}`);
                    setItems(barResponse.data || []);

                    // Fetch traceability data for date validation
                    try {
                        const traceResponse = await axiosInstance.get(`product/traceAbility?type=formatted&PIId=${selectedPI.PIId}`);
                        setTraceabilityData(traceResponse.data || []);
                    } catch (traceError) {
                        console.log('No traceability data found for date validation');
                        setTraceabilityData([]);
                    }
                } catch (error) {
                    console.error('Error fetching BAR data:', error);
                    setItems([]);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchBARData();
    }, [selectedPI.PIId]);

    // Fetch code list data for dropdowns
    useEffect(() => {
        getBARList();
    }, [selectedPI.PIId]);

    // Load product code options for existing items after data is loaded
    useEffect(() => {
        console.log('Data loaded:', data.length, 'Items:', items.length);
        if (data.length > 0 && items.length > 0) {
            items.forEach((item: any, index: number) => {
                if (item.code && !productCodeOptions[index]) {
                    console.log(`Loading product codes for row ${index} with code ${item.code}`);
                    updateProductCodeOptions(item.code, index);
                }
            });
        }
    }, [data]);

    const getBARList = async () => {
        try {
            const response = await axiosInstance.get(`product/codeList?type=BAR&PIId=${selectedPI.PIId}`);
            const uniqueCodes = Array.from(
                new Map(response.data.map((item: any) => [item.code, item])).values()
            );

            setData(response.data)
            const tempCodes = uniqueCodes.map((item: any) => ({
                label: item.code,
                value: item.code,
            }));

            setCodes(tempCodes);
        } catch (error) {
            console.error("Failed to fetch code list", error);
        }
    };

    // Function to validate Analysis Date against Production Date
    const validateAnalysisDate = (code: string, analysisDate: string): { isValid: boolean; message: string } => {
        if (!code || !analysisDate) {
            return { isValid: true, message: '' }; // Allow empty values
        }

        // Find the corresponding traceability record for this code
        const traceRecord = traceabilityData.find(trace => trace.code === code);

        if (!traceRecord || !traceRecord.productDate) {
            return { isValid: true, message: '' }; // No traceability data found, allow
        }

        const productionDate = new Date(traceRecord.productDate);
        const analysisDateObj = new Date(analysisDate);

        // Check if analysis date is before production date
        if (analysisDateObj < productionDate) {
            return {
                isValid: false,
                message: `❌ Analysis Date cannot be before Production Date\n\nCode: ${code}\nAnalysis: ${analysisDate}\nProduction: ${traceRecord.productDate}`
            };
        }

        // Check if analysis date is more than 24 hours after production date
        const timeDiff = analysisDateObj.getTime() - productionDate.getTime();
        const hoursDiff = timeDiff / (1000 * 60 * 60);

        if (hoursDiff > 24) {
            return {
                isValid: false,
                message: `⏰ Analysis Date must be within 24 hours\n\nCode: ${code}\nGap: ${Math.round(hoursDiff)} hours\nMax allowed: 24 hours`
            };
        }

        return { isValid: true, message: '' };
    };

    // Function to validate Completion Date against Analysis Date
    const validateCompletionDate = (analysisDate: string, completionDate: string): { isValid: boolean; message: string } => {
        if (!analysisDate || !completionDate) {
            return { isValid: true, message: '' }; // Allow empty values
        }

        const analysisDateObj = new Date(analysisDate);
        const completionDateObj = new Date(completionDate);

        // Check if completion date is before analysis date
        if (completionDateObj < analysisDateObj) {
            return {
                isValid: false,
                message: `❌ Completion Date cannot be before Analysis Date\n\nAnalysis: ${analysisDate}\nCompletion: ${completionDate}`
            };
        }

        // Check if completion date is more than 6 days after analysis date
        // Calculate difference in days (including weekends)
        // Normalize dates to midnight for accurate day-based comparison
        const analysisDateNormalized = new Date(analysisDateObj.getFullYear(), analysisDateObj.getMonth(), analysisDateObj.getDate());
        const completionDateNormalized = new Date(completionDateObj.getFullYear(), completionDateObj.getMonth(), completionDateObj.getDate());
        const timeDiff = completionDateNormalized.getTime() - analysisDateNormalized.getTime();
        const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

        if (daysDiff > 6) {
            return {
                isValid: false,
                message: `⏰ Completion Date must be within 6 days of Analysis Date\n\nAnalysis: ${analysisDate}\nCompletion: ${completionDate}\nGap: ${daysDiff} days\nMax allowed: 6 days`
            };
        }

        return { isValid: true, message: '' };
    };

    const handleAdd = () => {
        setItems((prevItems) => [...prevItems, DEFAULT_BAR]);
    };

    const handleRemove = useCallback(async (index: number) => {
        const itemToRemove = items[index];

        // If the item has a BARId, delete it from the database
        if (itemToRemove.BARId && itemToRemove.BARId !== '') {
            try {
                await axiosInstance.delete(`product/bar/item/${itemToRemove.BARId}`);
            } catch (error) {
                console.error('Error deleting BAR item:', error);
                showError('Error', 'Failed to delete item from database');
                return; // Don't remove from UI if database deletion failed
            }
        }

        setItems((prevItems) => prevItems.filter((_, i) => i !== index));

        // Clean up product code options for removed row and reindex remaining rows
        setProductCodeOptions(prev => {
            const newOptions: { [key: number]: any[] } = {};
            Object.keys(prev).forEach(key => {
                const keyIndex = parseInt(key);
                if (keyIndex < index) {
                    newOptions[keyIndex] = prev[keyIndex];
                } else if (keyIndex > index) {
                    newOptions[keyIndex - 1] = prev[keyIndex];
                }
                // Skip the removed index
            });
            return newOptions;
        });
    }, [items]);

    const handleChange = async (value: string, index: number, field: keyof IBAR) => {
        // Store the original item before any changes
        const originalItem = { ...items[index] };

        // Check for duplicate codes when changing the code field
        if (field === 'code' && value && value.trim() !== '') {
            const duplicateIndex = items.findIndex((item, idx) =>
                idx !== index && item.code && item.code.trim() === value.trim()
            );

            if (duplicateIndex !== -1) {
                showError(
                    '❌ Duplicate Code Error',
                    `Code "${value}" already exists in row ${duplicateIndex + 1}.\n\nEach code can only have one BAR record.`
                );

                // Revert the code field to its original value to prevent UI update
                const updatedItems = [...items];
                updatedItems[index] = {
                    ...updatedItems[index],
                    [field]: originalItem[field], // Revert to original value
                };
                setItems(updatedItems); // Update state to revert UI
                return; // Stop further processing
            }
        }

        // Validate Analysis Date when it's being changed
        if (field === 'analysisDate' && value) {
            const currentItem = items[index];
            const validation = validateAnalysisDate(currentItem.code, value);

            if (!validation.isValid) {
                showError(
                    '📅 Date Validation Error',
                    validation.message
                );
                return; // Don't update the value
            }
        }

        // Validate Completion Date when it's being changed
        if (field === 'completionDate' && value) {
            const currentItem = items[index];
            const validation = validateCompletionDate(currentItem.analysisDate, value);

            if (!validation.isValid) {
                // Extract details from the validation message for better formatting
                const analysisDate = currentItem.analysisDate;
                const completionDate = value;
                const analysisDateObj = new Date(analysisDate);
                const completionDateObj = new Date(completionDate);
                // Normalize dates to midnight for accurate day-based comparison
                const analysisDateNormalized = new Date(analysisDateObj.getFullYear(), analysisDateObj.getMonth(), analysisDateObj.getDate());
                const completionDateNormalized = new Date(completionDateObj.getFullYear(), completionDateObj.getMonth(), completionDateObj.getDate());
                const timeDiff = completionDateNormalized.getTime() - analysisDateNormalized.getTime();
                const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

                showDateValidationError(
                    'Date Validation Error',
                    '⏰ Completion Date must be within 6 days of Analysis Date',
                    {
                        analysisDate: analysisDate,
                        completionDate: completionDate,
                        gap: `${daysDiff} days`,
                        maxAllowed: '6 days'
                    }
                );
                return; // Don't update the value
            }
        }

        const updatedItems = [...items];
        updatedItems[index] = {
            ...updatedItems[index],
            [field]: value,
        };
        setItems(updatedItems);

        if (field === 'code') {
            updatedItems[index] = {
                ...updatedItems[index],
                ItemId: '',
            };
            setItems(updatedItems);
            updateProductCodeOptions(value, index);
        }
    };

    const updateProductCodeOptions = (selectedCode: string, index: number) => {
        if (data.length === 0) {
            console.log('Data not loaded yet, skipping product code options update');
            return;
        }

        const filteredOptions = data
            .filter((product: any) => product.code === selectedCode)
            .map((product: any) => ({
                label: `${product.PRSName} ${product.PRSTName}`,
                value: product.ItemId,
            }));

        setProductCodeOptions(prev => ({
            ...prev,
            [index]: filteredOptions
        }));
    };

    const handleSave = async () => {
        // Check for duplicate codes before saving
        const codes = items.map(item => item.code).filter(code => code && code.trim() !== '');
        const uniqueCodes = [...new Set(codes)];

        if (codes.length !== uniqueCodes.length) {
            showError(
                '❌ Duplicate Code Error',
                'Cannot save: Duplicate codes found in the table.\n\nEach code can only have one BAR record.\n\nPlease remove or change duplicate codes before saving.'
            );
            return;
        }

        // Validate all Analysis Dates before saving
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.code && item.analysisDate) {
                const validation = validateAnalysisDate(item.code, item.analysisDate);
                if (!validation.isValid) {
                    showError(
                        'Date Validation Error',
                        `Row ${i + 1}: ${validation.message}\n\nPlease correct the Analysis Date before saving.`
                    );
                    return;
                }
            }
        }

        // Validate all Completion Dates before saving
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.analysisDate && item.completionDate) {
                const validation = validateCompletionDate(item.analysisDate, item.completionDate);
                if (!validation.isValid) {
                    const analysisDateObj = new Date(item.analysisDate);
                    const completionDateObj = new Date(item.completionDate);
                    // Normalize dates to midnight for accurate day-based comparison
                    const analysisDateNormalized = new Date(analysisDateObj.getFullYear(), analysisDateObj.getMonth(), analysisDateObj.getDate());
                    const completionDateNormalized = new Date(completionDateObj.getFullYear(), completionDateObj.getMonth(), completionDateObj.getDate());
                    const timeDiff = completionDateNormalized.getTime() - analysisDateNormalized.getTime();
                    const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

                    showDateValidationError(
                        'Date Validation Error',
                        `Row ${i + 1}: ⏰ Completion Date must be within 6 days of Analysis Date`,
                        {
                            analysisDate: item.analysisDate,
                            completionDate: item.completionDate,
                            gap: `${daysDiff} days`,
                            maxAllowed: '6 days'
                        }
                    );
                    return;
                }
            }
        }

        for (const item of items) {
            for (const key of Object.keys(item)) {
                if (key != 'BARId' && item[key as keyof IBAR] === "") {
                    showInfo('Notice', `Empty value found for ${key} in item with code: ${item.code}`);
                    return;
                }
            }
        }

        try {
            // Always use PUT to handle both create and update
            // The backend update function handles both cases
            await axiosInstance.put('product/bar/', {
                PIId: selectedPI.PIId,
                data: items
            });

            // Refresh data from database after successful save
            const response = await axiosInstance.get(`product/bar/${selectedPI.PIId}`);
            setItems(response.data || []);

            showSuccessToast('BAR data saved successfully!');
        } catch (error) {
            console.error('Save Error:', error);
            showError('Error', 'Failed to save BAR data');
        }
    };

    const renderItem = ({ item, index }: { item: IBAR; index: number }) => (
        <ThemedView style={styles.row} key={index}>
            <TouchableOpacity onPress={() => handleRemove(index)} style={[styles.removeBtn, !editable && styles.hidden]}>
                <TabBarIcon name="trash" color="#c15153" />
            </TouchableOpacity>

            <ThemedPicker
                items={codes}
                label={''}
                require={false}
                name={'code'}
                selectedValue={item.code}
                handleChange={(name: keyof IBAR, text: string) => handleChange(text, index, name)}
                width={180}
                height={50}
                enable={editable}
            />

            <ThemedPicker
                items={productCodeOptions[index] || []}
                label={''}
                require={false}
                name={'ItemId'}
                selectedValue={item.ItemId}
                handleChange={(name: keyof IBAR, text: string) => handleChange(text, index, name)}
                width={150}
                height={50}
                enable={editable}
            />

            <ThemedDatePicker
                style={[styles.cell, styles.datePicker, editable && styles.editableCell]}
                label={''}
                require={false}
                name={'analysisDate'}
                selectedValue={item.analysisDate}
                handleChange={(name: keyof IBAR, text: string) => handleChange(text, index, name)}
                width={120}
                editable={editable}
            />
            <ThemedDatePicker
                style={[styles.cell, styles.datePicker, editable && styles.editableCell]}
                label={''}
                require={false}
                name={'completionDate'}
                selectedValue={item.completionDate}
                handleChange={(name: keyof IBAR, text: string) => handleChange(text, index, name)}
                width={120}
                editable={editable}
            />

            <TextInput
                style={[styles.cell, editable && styles.editableCell]}
                value={item.totalPlateCnt}
                onChangeText={(text) => handleChange(text, index, 'totalPlateCnt')}
                editable={editable}
            />
            <TextInput
                style={[styles.cell, editable && styles.editableCell]}
                value={item.ECFU}
                onChangeText={(text) => handleChange(text, index, 'ECFU')}
                editable={editable}
            />
            <TextInput
                style={[styles.cell, editable && styles.editableCell]}
                value={item.SCFU}
                onChangeText={(text) => handleChange(text, index, 'SCFU')}
                editable={editable}
            />
            <TextInput
                style={[styles.cell, editable && styles.editableCell]}
                value={item.salmone}
                onChangeText={(text) => handleChange(text, index, 'salmone')}
                editable={editable}
            />
            <TextInput
                style={[styles.cell, editable && styles.editableCell]}
                value={item.vibrioC}
                onChangeText={(text) => handleChange(text, index, 'vibrioC')}
                editable={editable}
            />
            <TextInput
                style={[styles.cell, editable && styles.editableCell]}
                value={item.vibrioP}
                onChangeText={(text) => handleChange(text, index, 'vibrioP')}
                editable={editable}
            />
            <TextInput
                style={[styles.cell, editable && styles.editableCell]}
                value={item.listeria}
                onChangeText={(text) => handleChange(text, index, 'listeria')}
                editable={editable}
            />
        </ThemedView>
    );

    return (
        <ThemedView style={styles.container}>
            <ThemedView style={[styles.btnGroup, !editable && styles.hidden]}>
                <ThemedButton text="Add" onPressEvent={handleAdd} />
                <ThemedButton text="Save" onPressEvent={handleSave} />
            </ThemedView>

            <ThemedView style={styles.row}>
                <ThemedText style={[styles.removeBtn, !editable && styles.hidden]}></ThemedText>
                <ThemedText style={[styles.headerCell, { width: 180 }]}>Code</ThemedText>
                <ThemedText style={[styles.headerCell, { width: 150 }]}>Product Code</ThemedText>
                <ThemedText style={styles.headerCell}>Date of Analysis</ThemedText>
                <ThemedText style={styles.headerCell}>Date of Completion</ThemedText>
                <ThemedText style={styles.headerCell}>Total plate count/gm at 37°C</ThemedText>
                <ThemedText style={styles.headerCell}>E. coli C.F.U/gm</ThemedText>
                <ThemedText style={styles.headerCell}>S. aureus C.F.U/gm</ThemedText>
                <ThemedText style={styles.headerCell}>Salmonella / 25 gm</ThemedText>
                <ThemedText style={styles.headerCell}>Vibrio cholera / 25 gm</ThemedText>
                <ThemedText style={styles.headerCell}>Vibrio Parahae molyticus / 25 gm</ThemedText>
                <ThemedText style={styles.headerCell}>Listeria monocytogenes 25/GM</ThemedText>
            </ThemedView>
            <ScrollView>
                {loading ? (
                    <ThemedText style={styles.loadingText}>Loading BAR data...</ThemedText>
                ) : items.length > 0 ? (
                    items.map((item, index) => renderItem({ item, index }))
                ) : (
                    <ThemedText style={styles.noDataText}>No BAR data found</ThemedText>
                )}
            </ScrollView>
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
        minWidth: 1400,
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
        width: 130,
        padding: 5,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    cell: {
        width: 120,
        padding: 5,
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
    hidden: {
        display: 'none',
    },
    removeBtn: {
        width: 40,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnGroup: {
        flexDirection: 'row',
        gap: 2,
        margin: 5,
    },
    datePicker: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        margin: 5
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

export default BARTable;
