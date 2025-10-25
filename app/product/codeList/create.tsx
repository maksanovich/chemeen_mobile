import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    ScrollView,
    Alert,
    TextInput
} from 'react-native';
import { useRouter } from 'expo-router';
import { navigateWithFlow } from '@/utils/navigationHelper';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedTextInput } from '@/components/ThemedTextInput';
import { ThemedButton } from '@/components/ThemedButton';
import { ThemedPicker } from '@/components/ThemedPicker';

import axiosInstance from '@/utils/axiosInstance';
import { convertDataPicker } from '@/utils/utils';

import { useSelector } from "@/store";

interface CodeItem {
    productCode: string;
    code: string;
    farmId: string;
    total: number;
    [key: number]: number;
}

export default function CodeListCreateScreen() {
    const router = useRouter();
    const selectedPI: any = useSelector((state) => state.selectedPI.data);

    const [item, setItem] = useState<any>({});
    const [grades, setGrades] = useState<any[]>([]);
    const [farmers, setFarmers] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [sumCartons, setSumCartons] = useState(0);
    const [TotalSumCarton, setTotalSumCarton] = useState(0);
    const [allocatedCartons, setAllocatedCartons] = useState(0);
    const [balanceCartons, setBalanceCartons] = useState(0);

    useEffect(() => {
        getBaseData();
    }, []);

    const getBaseData = async () => {
        try {
            if (selectedPI.PIId) {
                let response = await axiosInstance.get('master/company?type=Farmer');
                let result = convertDataPicker(response.data, 'companyName', '_id');
                setFarmers(result);

                response = await axiosInstance.get(`product/item/filter/${selectedPI.PIId}`);
                const transformedProducts = response.data.map((product: any) => ({
                    label: `${product.PRSName} ${product.PRSTName}`,
                    value: product.ItemId
                }));
                setProducts(transformedProducts);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handleChange = async (field: string, value: any) => {
        setItem((prev: any) => {
            const updatedItem = { ...prev, [field]: value };

            if (field.startsWith('grade_')) {
                const total = grades.reduce((sum, grade) => {
                    const gradeValue = field === `grade_${grade.PRSGId}` ?
                        (parseFloat(value) || 0) :
                        (parseFloat(updatedItem[`grade_${grade.PRSGId}`]) || 0);
                    return sum + gradeValue;
                }, 0);
                updatedItem.total = total.toString();
                setSumCartons(total);
            }

            return updatedItem;
        });

        if (field === 'productCode' && value) {
            setItem((prev: any) => ({ ...prev, itemId: value }));
            await fetchPRSGForItem(value, 0);

            // Get total cartons from item details
            const response = await axiosInstance.get(`product/itemDetail?type=sumCartons&ItemId=${value}`);
            const totalCartons = response.data.sumCartons;
            setTotalSumCarton(totalCartons);

            // Get already allocated cartons from existing codelist entries for this ItemId and PIId
            try {
                const codeListResponse = await axiosInstance.get(`product/codeList/pi/${selectedPI.PIId}`);
                const existingCodeList = codeListResponse.data;
                
                // Sum up all allocated cartons for this ItemId
                const allocated = existingCodeList
                    .filter((codeItem: any) => codeItem.ItemId === parseInt(value))
                    .reduce((sum: number, codeItem: any) => sum + (codeItem.total || 0), 0);
                
                setAllocatedCartons(allocated);
                
                // Calculate balance
                const balance = totalCartons - allocated;
                setBalanceCartons(balance);
            } catch (error) {
                console.error('Error fetching allocated cartons:', error);
                setAllocatedCartons(0);
                setBalanceCartons(totalCartons);
            }
        }
    };

    const fetchPRSGForItem = async (itemId: string, index: number) => {
        try {
            const response = await axiosInstance.get(`product/itemDetail?type=PRSG&ItemId=${itemId}`);
            const itemGrades = response.data;
            setGrades(itemGrades);

            setItem((prev: any) => {
                const newItem = { ...prev };

                Object.keys(newItem).forEach(key => {
                    if (key.startsWith('grade_')) {
                        delete newItem[key];
                    }
                });

                itemGrades.forEach((grade: any) => {
                    newItem[`grade_${grade.PRSGId}`] = '0';
                });

                newItem.total = '0';

                return newItem;
            });

            setSumCartons(0);
        } catch (error) {
            console.error('Error fetching PRSG for item:', error);
        }
    };

    const handleSave = async () => {
        // Validate required fields
        if (!item.productCode || !item.itemId) {
            Alert.alert('Missing Product Code', 'Please select a product code to continue.');
            return;
        }

        if (!item.code || item.code.trim() === '') {
            Alert.alert('Missing Code', 'Please enter a code for this product.');
            return;
        }

        if (!item.farmer) {
            Alert.alert('Missing Farmer', 'Please select a farmer to continue.');
            return;
        }

        // Validate that total is within available balance
        const calculatedTotal = grades.reduce((sum, grade) => {
            const gradeValue = parseFloat(item[`grade_${grade.PRSGId}`]) || 0;
            return sum + gradeValue;
        }, 0);

        // Check if calculatedTotal exceeds available balance
        if (calculatedTotal > balanceCartons) {
            Alert.alert(
                'Insufficient Balance',
                `Cannot allocate ${calculatedTotal} cartons.\n\n` +
                `Total Cartons: ${TotalSumCarton}\n` +
                `Already Allocated: ${allocatedCartons}\n` +
                `Available Balance: ${balanceCartons}\n\n` +
                `Please reduce your allocation to ${balanceCartons} or less.`
            );
            return;
        }

        if (Math.abs(calculatedTotal - parseFloat(item.total || '0')) > 0.01) {
            Alert.alert('Total Mismatch', 'The total does not match the sum of grade values. Please check your entries.');
            return;
        }

        // Validate that at least one grade has a value greater than 0
        const hasValidGrade = grades.some(grade => {
            const gradeValue = parseFloat(item[`grade_${grade.PRSGId}`]) || 0;
            return gradeValue > 0;
        });

        if (!hasValidGrade) {
            Alert.alert('No Grade Values', 'Please enter at least one grade value greater than 0.');
            return;
        }

        try {
            const newItems = transformItems([item]);
            const response = await axiosInstance.post('product/codeList/', {
                PIId: selectedPI.PIId,
                data: newItems
            });
            Alert.alert('Success', 'Code list created successfully!');
            navigateWithFlow('/product/codeList/edit', true);
        } catch (error: any) {
            console.error('Save Error:', error);
            const errorMsg = error.response?.data?.details || error.response?.data?.error || 'Failed to save code list item';
            Alert.alert('Error', errorMsg);
        }
    };

    const transformItems = (items: any[]) => {
        const transformed: any = [];
        items.forEach(item => {
            Object.keys(item).forEach(key => {
                if (key.startsWith('grade_')) {
                    const prsgId = key.replace('grade_', '');
                    transformed.push({
                        PIId: selectedPI.PIId,
                        ItemId: item.itemId, // Include the itemId
                        PRSGId: parseInt(prsgId),
                        value: parseFloat(item[key]),
                        code: item.code,
                        farmId: item.farmer
                    });
                }
            });
        });
        return transformed;
    };

    const renderItem = () => {
        return (
            <ThemedView style={styles.formContainer}>
                {/* Product Code */}
                <ThemedView style={styles.formRow}>
                    <ThemedText style={styles.label}>Product Code:</ThemedText>
                    <ThemedPicker
                        items={products}
                        label={''}
                        require={true}
                        name={'productCode'}
                        selectedValue={item.productCode}
                        handleChange={(name: string, value: string) => handleChange(name, value)}
                        width={200}
                        height={50}
                    />
                </ThemedView>

                {/* Code */}
                <ThemedView style={styles.formRow}>
                    <ThemedText style={styles.label}>Code:</ThemedText>
                    <TextInput
                        style={[styles.inputField]}
                        onChangeText={(text) => handleChange('code', text)}
                        value={item.code || ''}
                        placeholder="Enter code"
                    />
                </ThemedView>

                {/* Farmer */}
                <ThemedView style={styles.formRow}>
                    <ThemedText style={styles.label}>Farmer:</ThemedText>
                    <ThemedPicker
                        items={farmers}
                        label={''}
                        require={true}
                        name={'farmer'}
                        selectedValue={item.farmer}
                        handleChange={(name: string, value: string) => handleChange(name, value)}
                        width={200}
                        height={50}
                    />
                </ThemedView>

                {/* PRSG Grades */}
                {grades.map((grade, index) => (
                    <ThemedView key={`grade-${grade.PRSGId}-${index}`} style={styles.formRow}>
                        <ThemedText style={styles.label}>{grade.value}:</ThemedText>
                        <TextInput
                            style={[styles.inputField]}
                            onChangeText={(text) => handleChange(`grade_${grade.PRSGId}`, text)}
                            value={item[`grade_${grade.PRSGId}`] || '0'}
                            keyboardType="numeric"
                            editable={grade.cartons != null && Number(grade.cartons) > 0}
                            selectTextOnFocus={true}
                        />
                    </ThemedView>
                ))}

                {/* Total */}
                <ThemedView style={styles.formRow}>
                    <ThemedText style={styles.label}>Total:</ThemedText>
                    <TextInput
                        style={[styles.inputField, styles.totalField]}
                        value={item.total || ''}
                        editable={false}
                    />
                </ThemedView>
            </ThemedView>
        );
    };

    return (
        <ScrollView>
            <ThemedView style={styles.container}>
                <ThemedView style={styles.header}>
                    <ThemedText style={styles.title}>Add Code List Items</ThemedText>
                    <ThemedText style={styles.subtitle}>Total Cartons: {TotalSumCarton}</ThemedText>
                    <ThemedText style={styles.subtitle}>Allocated: {allocatedCartons}</ThemedText>
                    <ThemedText style={[styles.subtitle, styles.balanceText]}>Balance: {balanceCartons}</ThemedText>
                    <ThemedText style={styles.subtitle}>Entering: {sumCartons}</ThemedText>
                </ThemedView>

                <ThemedView style={styles.btnGroup}>
                    <ThemedButton text="Save" onPressEvent={handleSave} />
                </ThemedView>

                {renderItem()}
            </ThemedView>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    header: {
        marginBottom: 24,
        backgroundColor: '#ffffff',
        padding: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#1f2937',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 18,
        color: '#6b7280',
        textAlign: 'center',
        fontWeight: '500',
    },
    balanceText: {
        fontSize: 20,
        color: '#059669',
        fontWeight: 'bold',
    },
    btnGroup: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 20,
        justifyContent: 'center',
    },
    formContainer: {
        backgroundColor: '#ffffff',
        padding: 24,
        borderRadius: 12,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    formRow: {
        flexDirection: 'row',
        alignItems: 'center',
        // marginBottom: 18,
        paddingVertical: 8,
        minHeight: 40,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        width: 140,
        marginRight: 20,
        color: '#2c3e50',
        textAlign: 'right',
    },
    inputField: {
        flex: 1,
        borderWidth: 1.5,
        borderColor: '#d1d5db',
        borderRadius: 10,
        padding: 14,
        fontSize: 16,
        backgroundColor: '#ffffff',
        color: '#1f2937',
        minHeight: 48,
        textAlign: 'center',
        fontWeight: '500',
    },
    totalField: {
        backgroundColor: '#f8fafc',
        borderColor: '#3b82f6',
        borderWidth: 2,
        fontWeight: 'bold',
        color: '#1e40af',
        fontSize: 17,
    },
});
