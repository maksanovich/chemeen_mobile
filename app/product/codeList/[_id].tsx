import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    ScrollView,
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
import { 
    showError, 
    showSuccessToast, 
    showWarning, 
    showValidationError,
    showAllocationError,
    showConfirmation
} from '@/utils/alertHelper';

import { useSelector } from "@/store";
import { navigateWithFlow } from '@/utils/navigationHelper';

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
            showError('Error', 'Failed to load existing data. Please try again.');
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
            console.log('Fetching PRSG for itemId:', itemId);
            const response = await axiosInstance.get(`product/itemDetail?type=PRSG&ItemId=${itemId}`);
            const itemGrades = response.data;
            
            console.log('Raw PRSG data received:', itemGrades);
            
            // Check for duplicates and remove them
            const uniqueGrades = itemGrades.filter((grade: any, index: number, self: any[]) => 
                index === self.findIndex((g: any) => g.PRSGId === grade.PRSGId)
            );
            
            console.log('Unique grades after deduplication:', uniqueGrades);
            
            setGrades(uniqueGrades);

            // Only reset values if not in edit mode (for new entries)
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

                    // Auto-populate grade fields with product values (only for new entries)
                    let total = 0;
                    itemGrades.forEach((grade: any) => {
                        const gradeValue = parseFloat(grade.cartons) || 0;
                        newItem[`grade_${grade.PRSGId}`] = gradeValue.toString();
                        total += gradeValue;
                    });

                    // Set total to calculated sum
                    newItem.total = total.toString();

                    return newItem;
                });

                // Set total cartons to calculated sum
                setSumCartons(itemGrades.reduce((sum: number, grade: any) => {
                    return sum + (parseFloat(grade.cartons) || 0);
                }, 0));
            }
        } catch (error) {
            console.error('Error fetching PRSG for item:', error);
        }
    };

    const validateCodeUniqueness = async () => {
        if (!item.code || item.code.trim() === '') return true;

        try {
            // Check if code already exists for this PI (excluding current item)
            const response = await axiosInstance.get(`product/codeList/check-code/${selectedPI.PIId}/${encodeURIComponent(item.code.trim())}?excludeId=${_id}`);
            
            if (response.data.exists) {
                showError('Duplicate Code', `The code "${item.code}" already exists in this PI. Please use a different code.`);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error checking code uniqueness:', error);
            // If validation fails due to API error, prevent save to avoid duplicates
            showError(
                'Validation Error',
                'Could not verify code uniqueness due to a network error. Please check your connection and try again.'
            );
            return false; // Changed from true to false - prevent save on API error
        }
    };

    const validateGradesAgainstProduct = async () => {
        if (!item.itemId) return true;

        try {
            // Get product grades from backend
            const response = await axiosInstance.get(`product/itemDetail?type=PRSG&ItemId=${item.itemId}`);
            const productGrades = response.data;

            // Create a map of product grades for quick lookup
            const productGradeMap = new Map();
            productGrades.forEach((grade: any) => {
                productGradeMap.set(grade.PRSGId, parseFloat(grade.cartons) || 0);
            });

            // Validate each grade in Code List
            const validationErrors: string[] = [];
            grades.forEach((grade) => {
                const codeListValue = parseFloat(item[`grade_${grade.PRSGId}`]) || 0;
                const productValue = productGradeMap.get(grade.PRSGId) || 0;

                if (codeListValue > productValue) {
                    validationErrors.push(
                        `Grade ${grade.value}: ${codeListValue} cartons exceeds Product requirement of ${productValue} cartons`
                    );
                }
            });

            if (validationErrors.length > 0) {
                showValidationError(
                    'Grade Validation Failed',
                    validationErrors,
                    () => {
                        // Optional callback after user acknowledges the error
                    }
                );
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error validating grades:', error);
            // If validation fails due to API error, allow save but show warning
            showWarning(
                'Validation Warning',
                'Could not validate grades against Product requirements. Please ensure Code List grades do not exceed Product requirements.'
            );
            return true; // Allow save with warning
        }
    };

    const hasChanges = () => {
        return JSON.stringify(item) !== JSON.stringify(originalItem);
    }

    const handleSave = async () => {
        // Check if any changes were made
        if (!hasChanges()) {
            showWarning(
                'No Changes', 
                'You have not made any changes to update.\n\nPlease modify the code, farmer, grades, or total before clicking Update.'
            );
            return;
        }

        // Validate required fields
        if (!item.productCode || !item.itemId) {
            showError('Missing Product Code', 'Please select a product code to continue.');
            return;
        }

        if (!item.code || item.code.trim() === '') {
            showError('Missing Code', 'Please enter a code for this product.');
            return;
        }

        if (!item.farmer) {
            showError('Missing Farmer', 'Please select a farmer to continue.');
            return;
        }

        // Validate code uniqueness
        const codeUniquenessPassed = await validateCodeUniqueness();
        if (!codeUniquenessPassed) {
            return;
        }

        // Validate grades against Product requirements
        const gradeValidationPassed = await validateGradesAgainstProduct();
        if (!gradeValidationPassed) {
            return;
        }

        // Validate that total is within available balance
        const calculatedTotal = grades.reduce((sum, grade) => {
            const gradeValue = parseFloat(item[`grade_${grade.PRSGId}`]) || 0;
            return sum + gradeValue;
        }, 0);

        // Check if calculatedTotal exceeds available balance
        if (calculatedTotal > balanceCartons) {
            showAllocationError(
                calculatedTotal,
                balanceCartons,
                TotalSumCarton,
                allocatedCartons
            );
            return;
        }

        if (Math.abs(calculatedTotal - parseFloat(item.total || '0')) > 0.01) {
            showError('Total Mismatch', 'The total does not match the sum of grade values. Please check your entries.');
            return;
        }

        // Validate that at least one grade has a value greater than 0
        const hasValidGrade = grades.some(grade => {
            const gradeValue = parseFloat(item[`grade_${grade.PRSGId}`]) || 0;
            return gradeValue > 0;
        });

        if (!hasValidGrade) {
            showError('No Grade Values', 'Please enter at least one grade value greater than 0.');
            return;
        }

        try {
            const newItems = transformItems([item]);

            // Update existing code list item with codeId for precise targeting
            const response = await axiosInstance.put('product/codeList/', {
                PIId: selectedPI.PIId,
                data: newItems
            });

            showSuccessToast('Code list updated successfully!');
            navigateWithFlow('/product/codeList/edit', true);
        } catch (error: any) {
            console.error('Save Error:', error);
            const errorMsg = error.response?.data?.details || error.response?.data?.error || 'Failed to update code list item';
            showError('Error', errorMsg);
        }
    };


    const transformItems = (items: any[]) => {
        const transformed: any = [];
        items.forEach(item => {
            Object.keys(item).forEach(key => {
                if (key.startsWith('grade_')) {
                    const prsgId = key.replace('grade_', '');
                    const codeIdKey = `codeId_${prsgId}`;
                    const value = parseFloat(item[key]);
                    const codeId = item[codeIdKey];
                    
                    // For updates: if codeId exists, include the entry even if value is 0
                    // For new entries: only include entries with valid positive values (> 0)
                    if (codeId) {
                        // If updating an existing entry, include it even if value is 0
                        if (!isNaN(value) && value >= 0) {
                            // Update with new value (including 0)
                            transformed.push({
                                PIId: selectedPI.PIId,
                                ItemId: item.itemId,
                                PRSGId: parseInt(prsgId),
                                value: value,
                                code: item.code,
                                farmId: item.farmer,
                                codeId: codeId
                            });
                        }
                    } else {
                        // New entry - only include if value is valid and > 0
                        if (!isNaN(value) && value > 0) {
                            transformed.push({
                                PIId: selectedPI.PIId,
                                ItemId: item.itemId,
                                PRSGId: parseInt(prsgId),
                                value: value,
                                code: item.code,
                                farmId: item.farmer
                            });
                        }
                    }
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
                        width={250}
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
                            value={item[`grade_${grade.PRSGId}`] !== undefined && item[`grade_${grade.PRSGId}`] !== null ? String(item[`grade_${grade.PRSGId}`]) : ''}
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
                    <ThemedText style={styles.title}>Edit Code List</ThemedText>
                    <ThemedView style={styles.summaryContainer}>
                        <ThemedView style={styles.summaryItem}>
                            <ThemedText style={styles.summaryLabel}>Required</ThemedText>
                            <ThemedText style={styles.summaryValue}>{TotalSumCarton}</ThemedText>
                        </ThemedView>
                        <ThemedView style={styles.summaryItem}>
                            <ThemedText style={styles.summaryLabel}>Allocated</ThemedText>
                            <ThemedText style={styles.summaryValue}>{allocatedCartons}</ThemedText>
                        </ThemedView>
                        <ThemedView style={styles.summaryItem}>
                            <ThemedText style={styles.summaryLabel}>Available</ThemedText>
                            <ThemedText style={[styles.summaryValue, styles.balanceValue]}>{balanceCartons}</ThemedText>
                        </ThemedView>
                        <ThemedView style={styles.summaryItem}>
                            <ThemedText style={styles.summaryLabel}>This Entry</ThemedText>
                            <ThemedText style={styles.summaryValue}>{sumCartons}</ThemedText>
                        </ThemedView>
                    </ThemedView>
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
        fontSize: 16,
        color: '#059669',
        fontWeight: 'bold',
    },
    summaryContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15,
        paddingHorizontal: 5,
        flexWrap: 'wrap',
    },
    summaryItem: {
        alignItems: 'center',
        marginBottom: 12,
        minWidth: '22%',
        paddingVertical: 8,
        paddingHorizontal: 4,
    },
    summaryLabel: {
        fontSize: 12,
        color: '#6b7280',
        fontWeight: '500',
        marginBottom: 4,
        textAlign: 'center',
    },
    summaryValue: {
        fontSize: 16,
        color: '#1f2937',
        fontWeight: 'bold',
        textAlign: 'center',
        minWidth: 60,
    },
    balanceValue: {
        color: '#059669',
        fontSize: 17,
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
    noteText: {
        fontSize: 12,
        color: '#666',
        fontStyle: 'italic',
        textAlign: 'center',
        marginBottom: 10,
        paddingHorizontal: 20,
    },
});
