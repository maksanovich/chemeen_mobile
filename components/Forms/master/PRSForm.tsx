import React, { useEffect, useState } from 'react';

import { ThemedPicker } from '@/components/ThemedPicker';
import { ThemedTextInput } from '@/components/ThemedTextInput';
import { ThemedButton } from '@/components/ThemedButton';
import { ThemedView } from '@/components/ThemedView';

import { IPRS } from '@/constants/Interfaces';
import axiosInstance from '@/utils/axiosInstance';
import { convertDataPicker } from '@/utils/utils';

type PRSErrors = Partial<Record<keyof IPRS, string>>;

const PRSForm = (props: any) => {
    const {
        formData,
        setFormData,
        handleSubmit
    } = props;

    const [errors, setErrors] = useState<PRSErrors>({});
    const [PRFIds, setPRFIds] = useState<any>([]);

    useEffect(() => {
        getPRFIds();
    }, [])

    const getPRFIds = async () => {
        const response = await axiosInstance.get('master/PRF');
        const result = convertDataPicker(response.data, 'PRFName', '_id');
        setPRFIds(result);
    }

    const handleChange = (name: keyof IPRS, value: string) => {
        setFormData({ ...formData, [name]: value });
        setErrors({ ...errors, [name]: '' });
    };

    const onSubmit = () => {
        const newErrors: PRSErrors = {};
        const unRequireFields = [''];

        Object.keys(formData).forEach((key) => {
            const field = key as keyof IPRS;
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
                items={PRFIds}
                label={'Product Family'}
                require={true}
                name={'PRFId'}
                selectedValue={formData.PRFId}
                error={errors.PRFId}
                handleChange={handleChange}
            />

            <ThemedTextInput
                label='Product Species'
                require={true}
                name='PRSName'
                value={formData.PRSName}
                error={errors.PRSName}
                handleChange={handleChange}
            />

            <ThemedTextInput
                label='Scientific Name'
                require={true}
                name='scientificName'
                value={formData.scientificName}
                error={errors.scientificName}
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

export default PRSForm;