import React, { useState } from 'react';

import { ThemedTextInput } from '@/components/ThemedTextInput';
import { ThemedButton } from '@/components/ThemedButton';
import { ThemedView } from '@/components/ThemedView';

import { ITest } from '@/constants/Interfaces';

type TestErrors = Partial<Record<keyof ITest, string>>;

const TestForm = (props: any) => {
    const {
        formData,
        setFormData,
        handleSubmit
    } = props;

    const [errors, setErrors] = useState<TestErrors>({});

    const handleChange = (name: keyof ITest, value: string) => {
        setFormData({ ...formData, [name]: value });
        setErrors({ ...errors, [name]: '' });
    };

    const onSubmit = () => {
        const newErrors: TestErrors = {};
        const unRequireFields = [''];

        Object.keys(formData).forEach((key) => {
            const field = key as keyof ITest;
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
                label='Test Description'
                require={true}
                name='testDesc'
                value={formData.testDesc}
                error={errors.testDesc}
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

export default TestForm;