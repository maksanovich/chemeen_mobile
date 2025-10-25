import React, { useEffect, useState } from 'react';

import { ThemedPicker } from '@/components/ThemedPicker';
import { ThemedTextInput } from '@/components/ThemedTextInput';
import { ThemedButton } from '@/components/ThemedButton';
import { ThemedView } from '@/components/ThemedView';

import { IPRSG } from '@/constants/Interfaces';
import axiosInstance from '@/utils/axiosInstance';
import { convertDataPicker } from '@/utils/utils';

type PRSGErrors = Partial<Record<keyof IPRSG, string>>;

const PRSGForm = (props: any) => {
    const {
        formData,
        setFormData,
        handleSubmit
    } = props;

    const [errors, setErrors] = useState<PRSGErrors>({});
    const [PRSPSIds, setPRSPSIds] = useState<any>([]);

    useEffect(() => {
        getPRSPSIds();
    }, [])

    const getPRSPSIds = async () => {
        const response = await axiosInstance.get('master/PRSPS');
        const result = convertDataPicker(response.data, 'PRSPSDesc', '_id');
        setPRSPSIds(result);
    }

    const handleChange = (name: keyof IPRSG, value: string) => {
        setFormData({ ...formData, [name]: value });
        setErrors({ ...errors, [name]: '' });
    };

    const onSubmit = () => {
        const newErrors: PRSGErrors = {};
        const unRequireFields = [''];

        Object.keys(formData).forEach((key) => {
            const field = key as keyof IPRSG;
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
                items={PRSPSIds}
                label={'Product Species Packing Style'}
                require={true}
                name={'PRSPSId'}
                selectedValue={formData.PRSPSId}
                error={errors.PRSPSId}
                handleChange={handleChange}
            />

            <ThemedTextInput
                label='Product Species Grade'
                require={true}
                name='PRSGDesc'
                value={formData.PRSGDesc}
                error={errors.PRSGDesc}
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

export default PRSGForm;