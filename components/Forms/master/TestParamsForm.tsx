import React, { useEffect, useState } from 'react';

import { ThemedPicker } from '@/components/ThemedPicker';
import { ThemedTextInput } from '@/components/ThemedTextInput';
import { ThemedButton } from '@/components/ThemedButton';
import { ThemedView } from '@/components/ThemedView';

import { ITestParameters } from '@/constants/Interfaces';
import axiosInstance from '@/utils/axiosInstance';
import { convertDataPicker } from '@/utils/utils';

type TestParamsErrors = Partial<Record<keyof ITestParameters, string>>;

const TestParamsForm = (props: any) => {
    const {
        formData,
        setFormData,
        handleSubmit
    } = props;

    const [errors, setErrors] = useState<TestParamsErrors>({});
    const [testIds, setTestIds] = useState<any>([]);

    useEffect(() => {
        getTestIds();
    }, [])

    const getTestIds = async () => {
        const response = await axiosInstance.get('master/test');
        const result = convertDataPicker(response.data, 'testDesc', '_id');
        setTestIds(result);
    }

    const handleChange = (name: keyof ITestParameters, value: string) => {
        setFormData({ ...formData, [name]: value });
        setErrors({ ...errors, [name]: '' });
    };

    const onSubmit = () => {
        const newErrors: TestParamsErrors = {};
        const unRequireFields = [''];

        Object.keys(formData).forEach((key) => {
            const field = key as keyof ITestParameters;
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
            <ThemedPicker
                items={testIds}
                label={'Test'}
                require={true}
                name={'testId'}
                selectedValue={formData.testId}
                error={errors.testId}
                handleChange={handleChange}
            />

            <ThemedTextInput
                label='Test Parameters'
                require={true}
                name='testParams'
                value={formData.testParams}
                error={errors.testParams}
                handleChange={handleChange}
            />

            <ThemedTextInput
                label='Detection Limit'
                require={true}
                name='detectionLimit'
                value={formData.detectionLimit}
                error={errors.detectionLimit}
                handleChange={handleChange}
            />

            <ThemedButton
                text='Submit'
                fullWidth={true}
                onPressEvent={onSubmit}
            />
        </ThemedView>
    );
};

export default TestParamsForm;