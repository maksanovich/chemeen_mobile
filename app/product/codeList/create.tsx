import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    ScrollView,
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
import { 
    showError, 
    showSuccessToast, 
    showWarning, 
    showValidationError,
    showAllocationError
} from '@/utils/alertHelper';

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

    // Auto-populate grades when product is selected (only for new creation)
    useEffect(() => {
        if (item.itemId && grades.length > 0) {
            syncGradesWithProductSilently();
        }
    }, [item.itemId, grades.length]);

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

    const syncGradesWithProductSilently = async () => {
        if (!item.itemId) return;

        try {
            const response = await axiosInstance.get(`product/itemDetail?type=PRSG&ItemId=${item.itemId}`);
            const productGrades = response.data;

            // Check if grades need updating
            let needsUpdate = false;
            productGrades.forEach((grade: any) => {
                const currentValue = parseFloat(item[`grade_${grade.PRSGId}`]) || 0;
                const productValue = parseFloat(grade.cartons) || 0;
                if (Math.abs(currentValue - productValue) > 0.01) {
                    needsUpdate = true;
                }
            });

            // Update grades if they don't match
            if (needsUpdate) {
                setItem((prev: any) => {
                    const newItem = { ...prev };
                    let total = 0;

                    productGrades.forEach((grade: any) => {
                        const gradeValue = parseFloat(grade.cartons) || 0;
                        newItem[`grade_${grade.PRSGId}`] = gradeValue.toString();
                        total += gradeValue;
                    });

                    newItem.total = total.toString();
                    setSumCartons(total);
                    return newItem;
                });
            }
        } catch (error) {
            console.error('Error syncing grades silently:', error);
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

            // Grades automatically synchronized in background
        }
    };

    const fetchPRSGForItem = async (itemId: string, index: number) => {
        try {
            const response = await axiosInstance.get(`product/itemDetail?type=PRSG&ItemId=${itemId}`);
            const itemGrades = response.data;
            setGrades(itemGrades);

            setItem((prev: any) => {
                const newItem = { ...prev };

                // Clear existing grade fields
                Object.keys(newItem).forEach(key => {
                    if (key.startsWith('grade_')) {
                        delete newItem[key];
                    }
                });

                // Auto-populate grade fields with product values (synchronized)
                let total = 0;
                itemGrades.forEach((grade: any) => {
                    const gradeValue = parseFloat(grade.cartons) || 0;
                    newItem[`grade_${grade.PRSGId}`] = gradeValue.toString();
                    total += gradeValue;
                });

                newItem.total = total.toString();
                setSumCartons(total);

                return newItem;
            });

        } catch (error) {
            console.error('Error fetching PRSG for item:', error);
        }
    };

    const validateCodeUniqueness = async () => {
        if (!item.code || item.code.trim() === '') return true;

        try {
            // Check if code already exists for this PI
            const response = await axiosInstance.get(`product/codeList/check-code/${selectedPI.PIId}/${encodeURIComponent(item.code.trim())}`);
            
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

    const handleSave = async () => {
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
            const response = await axiosInstance.post('product/codeList/', {
                PIId: selectedPI.PIId,
                data: newItems
            });

            showSuccessToast('Code list created successfully!');
            navigateWithFlow('/product/codeList/edit', true);
        } catch (error: any) {
            console.error('Save Error:', error);
            const errorMsg = error.response?.data?.details || error.response?.data?.error || 'Failed to save code list item';
            showError('Error', errorMsg);
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
                    <ThemedText style={styles.title}>Create Code List</ThemedText>
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
    noteText: {
        fontSize: 12,
        color: '#666',
        fontStyle: 'italic',
        textAlign: 'center',
        marginBottom: 10,
        paddingHorizontal: 20,
    },
});
