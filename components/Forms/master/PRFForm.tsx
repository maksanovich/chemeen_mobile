import React, { useState } from 'react';

import { ThemedTextInput } from '@/components/ThemedTextInput';
import { ThemedButton } from '@/components/ThemedButton';
import { ThemedView } from '@/components/ThemedView';

import { IPRF } from '@/constants/Interfaces';

type PRFErrors = Partial<Record<keyof IPRF, string>>;

const PRFForm = (props: any) => {
    const {
        formData,
        setFormData,
        handleSubmit
    } = props;

    const [errors, setErrors] = useState<PRFErrors>({});

    const handleChange = (name: keyof IPRF, value: string) => {
        setFormData({ ...formData, [name]: value });
        setErrors({ ...errors, [name]: '' });
    };

    const onSubmit = () => {
        const newErrors: PRFErrors = {};
        const unRequireFields = [''];

        Object.keys(formData).forEach((key) => {
            const field = key as keyof IPRF;
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
                label='Product Family'
                require={true}
                name='PRFName'
                value={formData.PRFName}
                error={errors.PRFName}
                handleChange={handleChange}
            />

            <ThemedTextInput
                label='HSN'
                require={true}
                name='HSN'
                value={formData.HSN}
                error={errors.HSN}
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

export default PRFForm;