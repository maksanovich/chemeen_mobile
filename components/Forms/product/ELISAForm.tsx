import React, { useState, useEffect } from 'react';
import { StyleSheet, TextInput } from 'react-native';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedTextInput } from '@/components/ThemedTextInput';
import { ThemedButton } from '@/components/ThemedButton';
import { ThemedDatePicker } from '@/components/ThemedDatePicker';
import { ThemedPicker } from '@/components/ThemedPicker';

import { IElisa } from '@/constants/Interfaces';
import axiosInstance from '@/utils/axiosInstance';

type ElisaErrors = Partial<Record<keyof IElisa, string>>;

interface TestParameter {
    _id: number;
    testDesc: string;
    createdAt: string;
    updatedAt: string;
}

interface TestResult {
    parameterId: number;
    parameterName: string;
    detectionLimit: string;
    testResult: string;
    analytical: string;
}

const ELISAForm = (props: any) => {
    const {
        formData,
        setFormData,
        handleSubmit,
        setDetails,
        details,
        PIId,
    } = props;

    const [errors, setErrors] = useState<any>({});
    const [productCodeOptions, setProductCodeOptions] = useState<any[]>([]);
    const [codeOptions, setCodeOptions] = useState<any[]>([]);
    const [codeListData, setCodeListData] = useState<any[]>([]);

    useEffect(() => {
        
        if (details.length === 0) {
            fetchTestParameters();
        }
        getProductCodeList();
        getCodeList();
    }, []);

    const fetchTestParameters = async () => {
        try {
            const response = await axiosInstance.get('master/test');
            // Initialize test results with all parameters
            const initialTestResults = response.data.map((param: TestParameter) => ({
                testId: param._id,
                testName: param.testDesc,
                detectionLimit: '',
                testResult: '',
                analytical: 'ELISA'
            }));
            setDetails(initialTestResults);
        } catch (error) {
            console.error('Failed to fetch test parameters:', error);
        }
    };

    const getCodeList = async () => {
        try {
            const response = await axiosInstance.get(`product/codeList?type=BAR&PIId=${PIId}`);
            const uniqueCodes = Array.from(
                new Map(response.data.map((item: any) => [item.code, item])).values()
            );

            setCodeListData(response.data);
            const tempCodes = uniqueCodes.map((item: any) => ({
                label: item.code,
                value: item.code,
            }));
            setCodeOptions(tempCodes);
        } catch (error) {
            console.error("Failed to fetch code list", error);
        }
    };

    const getProductCodeList = async (selectedCode?: string) => {
        try {
            if (selectedCode) {

                const filteredOptions = codeListData
                    .filter((product: any) => product.code === selectedCode)
                    .map((product: any) => ({
                        label: `${product.PRSName} ${product.PRSTName}`,
                        value: product.ItemId,
                    }));

                setProductCodeOptions(filteredOptions);
            } else {
                // Load all product codes initially
                const response = await axiosInstance.get(`product/item/${PIId}`);
                const codeOptions = response.data.map((code: any) => ({
                    label: code.PRSName + ' ' + code.PRSTName,
                    value: code.ItemId
                }));
                setProductCodeOptions(codeOptions);
            }
        } catch (error) {
            console.error('Failed to fetch product code list:', error);
        }
    };

    const handleChange = async (name: any, value: string) => {
        setFormData({ ...formData, [name]: value });
        setErrors({ ...errors, [name]: '' });

        // If code is changed, reset production code and trigger product code update
        if (name === 'code') {
            setFormData({ ...formData, [name]: value, ItemId: '' });
            getProductCodeList(value);
        }
    };

    const handleTestResultChange = (index: number, field: 'detectionLimit' | 'testResult', value: string) => {
        const updatedResults = [...details];
        updatedResults[index] = {
            ...updatedResults[index],
            [field]: value
        };
        setDetails(updatedResults);
    };

    const onSubmit = () => {
        const newErrors: any = {};
        const unRequireFields = ['productionCode'];

        Object.keys(formData).forEach((key) => {
            const field = key as keyof IElisa;
            if (!formData[field] && unRequireFields.indexOf(field) === -1) {
                newErrors[field] = 'This is required field.';
            }
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        handleSubmit();
    };

    return (
        <ThemedView>
            <ThemedTextInput
                label='Test Report No'
                require={true}
                name='testReportNo'
                value={formData.testReportNo}
                error={errors.testReportNo}
                handleChange={handleChange}
            />

            <ThemedDatePicker
                label={'Test Report Date'}
                require={true}
                name={'testReportDate'}
                selectedValue={formData.testReportDate}
                error={errors.testReportDate}
                handleChange={handleChange}
            />

            <ThemedDatePicker
                label={'Raw Material Receiving Date'}
                require={true}
                name={'rawMeterialDate'}
                selectedValue={formData.rawMeterialDate}
                error={errors.rawMeterialDate}
                handleChange={handleChange}
            />

            <ThemedPicker
                items={codeOptions}
                label='Code'
                require={true}
                name='code'
                selectedValue={formData.code}
                error={errors.code}
                handleChange={handleChange}
                height={50}
                enable={true}
            />

            <ThemedPicker
                items={productCodeOptions}
                label='Production Code'
                require={true}
                name='ItemId'
                selectedValue={formData.ItemId}
                error={errors.ItemId}
                handleChange={handleChange}
                height={50}
                enable={true}
            />

            <ThemedTextInput
                label='Sample Drawn By'
                require={true}
                name='sampleDrawnBy'
                value={formData.sampleDrawnBy}
                error={errors.sampleDrawnBy}
                handleChange={handleChange}
            />

            <ThemedTextInput
                label='Sample ID'
                require={true}
                name='sampleId'
                value={formData.sampleId}
                error={errors.sampleId}
                handleChange={handleChange}
            />

            <ThemedTextInput
                label='Type of Raw Material Product'
                require={true}
                name='rawMaterialType'
                value={formData.rawMaterialType}
                error={errors.rawMaterialType}
                handleChange={handleChange}
            />

            <ThemedTextInput
                label='Raw Material/Quantity Received'
                require={true}
                name='rawMaterialReceived'
                value={formData.rawMaterialReceived}
                error={errors.rawMaterialReceived}
                handleChange={handleChange}
            />

            <ThemedTextInput
                label='Pond Id'
                require={true}
                name='pondId'
                value={formData.pondId}
                error={errors.pondId}
                handleChange={handleChange}
            />

            <ThemedDatePicker
                label={'Date of sampling'}
                require={true}
                name={'samplingDate'}
                selectedValue={formData.samplingDate}
                error={errors.samplingDate}
                handleChange={handleChange}
            />

            <ThemedDatePicker
                label={'Date of Receipt of sample'}
                require={true}
                name={'samplingReceiptDate'}
                selectedValue={formData.samplingReceiptDate}
                error={errors.samplingReceiptDate}
                handleChange={handleChange}
            />

            <ThemedTextInput
                label='Tested By'
                require={true}
                name='testedBy'
                value={formData.testedBy}
                error={errors.testedBy}
                handleChange={handleChange}
            />

            {/* Test Parameters Table */}
            <ThemedView style={styles.tableContainer}>
                <ThemedText style={styles.tableTitle}>Test Parameters</ThemedText>

                <ThemedView style={styles.tableHeader}>
                    <ThemedText style={styles.headerCell}>Sl.no</ThemedText>
                    <ThemedText style={styles.headerCell}>Parameters Tested</ThemedText>
                    <ThemedText style={styles.headerCell}>Detection Limit</ThemedText>
                    <ThemedText style={styles.headerCell}>Test Result</ThemedText>
                    <ThemedText style={styles.headerCell}>Analytical</ThemedText>
                </ThemedView>

                {details.map((result: any, index: number) => (
                    <ThemedView style={styles.tableRow} key={result.testId}>
                        <ThemedText style={styles.cell}>{index + 1}</ThemedText>
                        <ThemedText style={styles.cell}>{result.testName}</ThemedText>
                        <TextInput
                            style={[styles.cell, styles.inputCell]}
                            value={result.detectionLimit}
                            onChangeText={(text) => handleTestResultChange(index, 'detectionLimit', text)}
                            placeholder="Enter limit"
                        />
                        <TextInput
                            style={[styles.cell, styles.inputCell]}
                            value={result.testResult}
                            onChangeText={(text) => handleTestResultChange(index, 'testResult', text)}
                            placeholder="Enter result"
                        />
                        <ThemedText style={styles.cell}>{result.analytical}</ThemedText>
                    </ThemedView>
                ))}
            </ThemedView>

            <ThemedButton
                text='Submit'
                fullWidth={true}
                onPressEvent={onSubmit}
            />
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    tableContainer: {
        marginVertical: 20,
        padding: 10,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    tableTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
        color: '#333',
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#007bff',
        paddingVertical: 10,
        paddingHorizontal: 5,
        borderRadius: 4,
        marginBottom: 5,
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 8,
        paddingHorizontal: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#dee2e6',
        alignItems: 'center',
    },
    headerCell: {
        flex: 1,
        textAlign: 'center',
        fontWeight: 'bold',
        color: '#fff',
        fontSize: 12,
    },
    cell: {
        flex: 1,
        textAlign: 'center',
        fontSize: 12,
        color: '#333',
        paddingVertical: 4,
    },
    inputCell: {
        borderWidth: 1,
        borderColor: '#ced4da',
        borderRadius: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: '#fff',
        marginHorizontal: 2,
    },
});

export default ELISAForm;