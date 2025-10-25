import React, { useState } from 'react';

import { ThemedTextInput } from '@/components/ThemedTextInput';
import { ThemedButton } from '@/components/ThemedButton';
import { ThemedView } from '@/components/ThemedView';

import { IPRSPS } from '@/constants/Interfaces';

type PRSPSErrors = Partial<Record<keyof IPRSPS, string>>;

const PRSPSForm = (props: any) => {
    const {
        formData,
        setFormData,
        handleSubmit
    } = props;

    const [errors, setErrors] = useState<PRSPSErrors>({});

    const handleChange = (name: keyof IPRSPS, value: string) => {
        setFormData({ ...formData, [name]: value });
        setErrors({ ...errors, [name]: '' });
    };

    const onSubmit = () => {
        const newErrors: PRSPSErrors = {};
        const unRequireFields = [''];

        Object.keys(formData).forEach((key) => {
            const field = key as keyof IPRSPS;
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
                label='Product Species Packing Style'
                require={true}
                name='PRSPSDesc'
                value={formData.PRSPSDesc}
                error={errors.PRSPSDesc}
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

export default PRSPSForm;