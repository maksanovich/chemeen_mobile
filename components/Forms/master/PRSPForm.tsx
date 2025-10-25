import React, { useEffect, useState } from 'react';

import { ThemedPicker } from '@/components/ThemedPicker';
import { ThemedTextInput } from '@/components/ThemedTextInput';
import { ThemedButton } from '@/components/ThemedButton';
import { ThemedView } from '@/components/ThemedView';

import { IPRSP } from '@/constants/Interfaces';
import axiosInstance from '@/utils/axiosInstance';
import { convertDataPicker } from '@/utils/utils';

type PRSPErrors = Partial<Record<keyof IPRSP, string>>;

const PRSPForm = (props: any) => {
    const {
        formData,
        setFormData,
        handleSubmit
    } = props;

    const [errors, setErrors] = useState<PRSPErrors>({});
    const [PRSPWIds, setPRSPWIds] = useState<any>([]);
    const [PRSPWSIds, setPRSPWSIds] = useState<any>([]);

    useEffect(() => {
        getPRSPWIds();
        getPRSPWSIds();
    }, [])

    const getPRSPWIds = async () => {
        const response = await axiosInstance.get('master/PRSPW');
        const result = convertDataPicker(response.data, 'PRSPWUnit', '_id');
        setPRSPWIds(result);
    }

    const getPRSPWSIds = async () => {
        const response = await axiosInstance.get('master/PRSPWS');
        const result = convertDataPicker(response.data, 'PRSPWSStyle', '_id');
        setPRSPWSIds(result);
    }

    const handleChange = (name: keyof IPRSP, value: string) => {
        if (name === 'PRSPWeight' || name === 'PRSPPiece') {
            value = value.replace(/[^0-9.]/g, '');
        }

        setFormData({ ...formData, [name]: value });
        setErrors({ ...errors, [name]: '' });
    };

    const onSubmit = () => {
        const newErrors: PRSPErrors = {};
        const unRequireFields = [''];

        Object.keys(formData).forEach((key) => {
            const field = key as keyof IPRSP;
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
                label='Product Species Packing Piece'
                require={true}
                name='PRSPPiece'
                value={formData.PRSPPiece}
                error={errors.PRSPPiece}
                handleChange={handleChange}
            />

            <ThemedTextInput
                label='Product Species Packing Weight'
                require={true}
                name='PRSPWeight'
                value={formData.PRSPWeight}
                error={errors.PRSPWeight}
                handleChange={handleChange}
            />

            <ThemedPicker
                items={PRSPWIds}
                label={'Product Species Packing Weight'}
                require={true}
                name={'PRSPWId'}
                selectedValue={formData.PRSPWId}
                error={errors.PRSPWId}
                handleChange={handleChange}
            />

            <ThemedPicker
                items={PRSPWSIds}
                label={'Product Species Packing Weight Style'}
                require={true}
                name={'PRSPWSId'}
                selectedValue={formData.PRSPWSId}
                error={errors.PRSPWSId}
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

export default PRSPForm;