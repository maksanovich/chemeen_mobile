import React, { useState } from 'react';

import { ThemedTextInput } from '@/components/ThemedTextInput';
import { ThemedButton } from '@/components/ThemedButton';
import { ThemedView } from '@/components/ThemedView';

import { IPRSPWS } from '@/constants/Interfaces';

type PRSPWSErrors = Partial<Record<keyof IPRSPWS, string>>;

const PRSPWSForm = (props: any) => {
    const {
        formData,
        setFormData,
        handleSubmit
    } = props;

    const [errors, setErrors] = useState<PRSPWSErrors>({});

    const handleChange = (name: keyof IPRSPWS, value: string) => {
        setFormData({ ...formData, [name]: value });
        setErrors({ ...errors, [name]: '' });
    };

    const onSubmit = () => {
        const newErrors: PRSPWSErrors = {};
        const unRequireFields = [''];

        Object.keys(formData).forEach((key) => {
            const field = key as keyof IPRSPWS;
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
                label='Product Species Packing Weight Style'
                require={true}
                name='PRSPWSStyle'
                value={formData.PRSPWSStyle}
                error={errors.PRSPWSStyle}
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

export default PRSPWSForm;