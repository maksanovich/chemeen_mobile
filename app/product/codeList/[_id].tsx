import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    ScrollView,
    Alert,
    TextInput
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Stack } from 'expo-router';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedTextInput } from '@/components/ThemedTextInput';
import { ThemedButton } from '@/components/ThemedButton';
import { ThemedPicker } from '@/components/ThemedPicker';

import axiosInstance from '@/utils/axiosInstance';
import { convertDataPicker } from '@/utils/utils';

import { useSelector } from "@/store";
import { navigateBackWithFlow } from '@/utils/navigationHelper';

interface CodeItem {
    productCode: string;
    code: string;
    farmId: string;
    total: number;
    [key: number]: number;
}

export default function CodeListEditScreen() {
    const router = useRouter();
    const { _id } = useLocalSearchParams();
    const selectedPI: any = useSelector((state) => state.selectedPI.data);

    const [item, setItem] = useState<any>({});
    const [grades, setGrades] = useState<any[]>([]);
    const [farmers, setFarmers] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [sumCartons, setSumCartons] = useState(0);
    const [loading, setLoading] = useState(true);
    const [TotalSumCarton, setTotalSumCarton] = useState(0);
    const [allocatedCartons, setAllocatedCartons] = useState(0);
    const [balanceCartons, setBalanceCartons] = useState(0);
    const [originalTotal, setOriginalTotal] = useState(0);
    const [originalItem, setOriginalItem] = useState<any>({});

    useEffect(() => {
        getBaseData();
        if (_id) {
            loadExistingData();
        }
    }, [_id]);

    const getBaseData = async () => {
        try {
            if (selectedPI.PIId) {
                let response = await axiosInstance.get('master/company?type=Farmer');
                let result = convertDataPicker(response.data, 'companyName', '_id');
                setFarmers(result);

                response = await axiosInstance.get(`product/item/filter/${selectedPI.PIId}`);
                const transformedProducts = response.data.map((product: any) => ({
                    label: `${product.PRSName} + ${product.PRSTName}`,
                    value: product.ItemId
                }));
                setProducts(transformedProducts);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const loadExistingData = async () => {
        try {
            setLoading(true);

            // Fetch code list data from backend
            const response = await axiosInstance.get(`product/codeList/pi/${selectedPI.PIId}`);
            const codeListData = response.data;

            // Find the existing code list item by codeId (searching through grades)
            const existingItem = codeListData.find((codeItem: any) =>
                codeItem.grades.some((grade: any) => grade.codeId === parseInt(_id as string))
            );

            if (existingItem) {
                // First fetch PRSG data to get the grades structure
                await fetchPRSGForItem(existingItem.ItemId.toString(), 0, true);

                // Set up the item data with existing values
                const itemData: any = {
                    itemId: existingItem.ItemId,
                    productCode: existingItem.ItemId,
                    code: existingItem.code,
                    farmer: existingItem.farmId,
                    total: existingItem.total.toString()
                };

                // Set grade values and codeIds from the existing item's grades
                existingItem.grades.forEach((gradeItem: any) => {
                    itemData[`grade_${gradeItem.PRSGId}`] = gradeItem.value.toString();
                    // Store codeId for each grade to enable precise updates
                    itemData[`codeId_${gradeItem.PRSGId}`] = gradeItem.codeId;
                });

                setItem(itemData);
                setOriginalItem(JSON.parse(JSON.stringify(itemData))); // Deep copy for comparison
                setSumCartons(existingItem.total);
                setOriginalTotal(existingItem.total); // Store original total for edit validation

                const response = await axiosInstance.get(`product/itemDetail?type=sumCartons&ItemId=${itemData.itemId}`);
                const totalCartons = response.data.sumCartons;
                setTotalSumCarton(totalCartons);

                // Calculate allocated cartons (excluding this item being edited)
                const allocated = codeListData
                    .filter((codeItem: any) => 
                        codeItem.ItemId === existingItem.ItemId && 
                        !codeItem.grades.some((grade: any) => grade.codeId === parseInt(_id as string))
                    )
                    .reduce((sum: number, codeItem: any) => sum + (codeItem.total || 0), 0);
                
                setAllocatedCartons(allocated);
                
                // Calculate balance (add back the original total since we're editing it)
                const balance = totalCartons - allocated;
                setBalanceCartons(balance);
            }
        } catch (error: any) {
            console.error('Error loading existing data:', error);
            Alert.alert('Error', 'Failed to load existing data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = async (field: string, value: any) => {
        setItem((prev: any) => {
            const updatedItem = { ...prev, [field]: value };

            // Calculate total if any PRSG grade value changes
            if (field.startsWith('grade_')) {
                const total = grades.reduce((sum, grade) => {
                    const gradeValue = field === `grade_${grade.PRSGId}` ?
                        (parseFloat(value) || 0) :
                        (parseFloat(updatedItem[`grade_${grade.PRSGId}`]) || 0);
                    return sum + gradeValue;
                }, 0);
                updatedItem.total = total.toString();
                // Update total cartons when total changes
                setSumCartons(total);
            }

            return updatedItem;
        });

        // When product code changes, fetch PRSG values and update header
        if (field === 'productCode' && value) {
            // Save the itemId when product code is selected
            setItem((prev: any) => ({ ...prev, itemId: value }));
            await fetchPRSGForItem(value, 0);

            const response = await axiosInstance.get(`product/itemDetail?type=sumCartons&ItemId=${value}`);
            setTotalSumCarton(response.data.sumCartons);
        }
    };

    const fetchPRSGForItem = async (itemId: string, index: number, isEditMode: boolean = false) => {
        try {
            const response = await axiosInstance.get(`product/itemDetail?type=PRSG&ItemId=${itemId}`);
            const itemGrades = response.data;

            setGrades(itemGrades);

            // Only reset values if not in edit mode
            if (!isEditMode) {
                // Reset item state and set initial values for grades
                setItem((prev: any) => {
                    const newItem = { ...prev };

                    // Clear existing grade values
                    Object.keys(newItem).forEach(key => {
                        if (key.startsWith('grade_')) {
                            delete newItem[key];
                        }
                    });

                    // Set initial values for each grade (default to 0)
                    itemGrades.forEach((grade: any) => {
                        newItem[`grade_${grade.PRSGId}`] = '0';
                    });

                    // Set total to 0 initially
                    newItem.total = '0';

                    return newItem;
                });

                // Reset total cartons
                setSumCartons(0);
            }
        } catch (error) {
            console.error('Error fetching PRSG for item:', error);
        }
    };

    const hasChanges = () => {
        return JSON.stringify(item) !== JSON.stringify(originalItem);
    }

    const handleSave = async () => {
        // Check if any changes were made
        if (!hasChanges()) {
            Alert.alert('No Changes', 'You have not made any changes to update.\n\nPlease modify the code, farmer, grades, or total before clicking Update.');
            return;
        }

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
            Alert.alert('Insufficient Balance', 
                `Cannot allocate ${calculatedTotal} cartons.\n\nTotal Cartons: ${TotalSumCarton}\nAlready Allocated: ${allocatedCartons}\nAvailable Balance: ${balanceCartons}\n\nPlease reduce your allocation to ${balanceCartons} or less.`);
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

            // Update existing code list item with codeId for precise targeting
            const response = await axiosInstance.put('product/codeList/', {
                PIId: selectedPI.PIId,
                data: newItems
            });

            Alert.alert('Success', 'Code list updated successfully!');
            navigateBackWithFlow('/product/codeList/edit');
        } catch (error: any) {
            console.error('Save Error:', error);
            const errorMsg = error.response?.data?.details || error.response?.data?.error || 'Failed to update code list item';
            Alert.alert('Error', errorMsg);
        }
    };

    const transformItems = (items: any[]) => {
        const transformed: any = [];
        items.forEach(item => {
            Object.keys(item).forEach(key => {
                if (key.startsWith('grade_')) {
                    const prsgId = key.replace('grade_', '');
                    const codeIdKey = `codeId_${prsgId}`;
                    const itemData: any = {
                        PIId: selectedPI.PIId,
                        ItemId: item.itemId, // Include the itemId
                        PRSGId: parseInt(prsgId),
                        value: parseFloat(item[key]),
                        code: item.code,
                        farmId: item.farmer
                    };

                    // Include codeId if it exists (for updates)
                    if (item[codeIdKey]) {
                        itemData.codeId = item[codeIdKey];
                    }

                    transformed.push(itemData);
                }
            });
        });
        return transformed;
    };

    const renderItem = () => {
        if (loading) {
            return (
                <ThemedView style={styles.loadingContainer}>
                    <ThemedText style={styles.loadingText}>Loading...</ThemedText>
                </ThemedView>
            );
        }

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
                            value={item[`grade_${grade.PRSGId}`] || ''}
                            keyboardType="numeric"
                            editable={grade.cartons != null && Number(grade.cartons) > 0}
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
        <>
            <Stack.Screen
                options={{
                    title: 'Edit Code List Item',
                    headerShown: true
                }}
            />
            <ScrollView>
                <ThemedView style={styles.container}>
                    <ThemedView style={styles.header}>
                        <ThemedText style={styles.title}>Edit Code List Item</ThemedText>
                        <ThemedText style={styles.subtitle}>Total Cartons: {TotalSumCarton}</ThemedText>
                        <ThemedText style={styles.subtitle}>Allocated: {allocatedCartons}</ThemedText>
                        <ThemedText style={[styles.subtitle, styles.balanceText]}>Balance: {balanceCartons}</ThemedText>
                        <ThemedText style={styles.subtitle}>Entering: {sumCartons}</ThemedText>
                    </ThemedView>

                    <ThemedView style={styles.btnGroup}>
                        <ThemedButton text="Update" onPressEvent={handleSave} />
                    </ThemedView>

                    {renderItem()}
                </ThemedView>
            </ScrollView>
        </>
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    loadingText: {
        fontSize: 18,
        color: '#6b7280',
    },
});
