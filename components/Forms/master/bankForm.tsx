import React, { useState } from 'react';

import { ThemedTextInput } from '@/components/ThemedTextInput';
import { ThemedButton } from '@/components/ThemedButton';
import { ThemedView } from '@/components/ThemedView';

import { IBank } from '@/constants/Interfaces';

type BankErrors = Partial<Record<keyof IBank, string>>;

const BankForm = (props: any) => {
    const {
        formData,
        setFormData,
        handleSubmit
    } = props;

    const [errors, setErrors] = useState<BankErrors>({});

    const handleChange = (name: keyof IBank, value: string) => {
        if (name === 'mobile' || name === 'phone') {
            value = value.replace(/[^0-9]/g, '');
        }
        setFormData({ ...formData, [name]: value });
        setErrors({ ...errors, [name]: '' });
    };

    const onSubmit = () => {
        const newErrors: BankErrors = {};
        const unRequireFields = [
            'address2',
            'phone',
            'mobile',
            'email'
        ]

        Object.keys(formData).forEach((key) => {
            const field = key as keyof IBank;
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
                label='Bank Name'
                require={true}
                name='bankName'
                value={formData.bankName}
                error={errors.bankName}
                handleChange={handleChange}
            />

            <ThemedTextInput
                label='AC Number'
                require={true}
                name='acNo'
                value={formData.acNo}
                error={errors.acNo}
                handleChange={handleChange}
            />

            <ThemedTextInput
                label='Swift'
                require={true}
                name='swift'
                value={formData.swift}
                error={errors.swift}
                handleChange={handleChange}
            />

            <ThemedTextInput
                label='IFSCCode'
                require={true}
                name='IFSCCode'
                value={formData.IFSCCode}
                error={errors.IFSCCode}
                handleChange={handleChange}
            />

            <ThemedTextInput
                label='Address 1'
                require={true}
                name='address1'
                value={formData.address1}
                error={errors.address1}
                handleChange={handleChange}
            />

            <ThemedTextInput
                label='Address 2'
                require={false}
                name='address2'
                value={formData.address2}
                error={errors.address2}
                handleChange={handleChange}
            />

            <ThemedTextInput
                label='City'
                require={true}
                name='city'
                value={formData.city}
                error={errors.city}
                handleChange={handleChange}
            />

            <ThemedTextInput
                label='State'
                require={true}
                name='state'
                value={formData.state}
                error={errors.state}
                handleChange={handleChange}
            />

            <ThemedTextInput
                label='Country'
                require={true}
                name='country'
                value={formData.country}
                error={errors.country}
                handleChange={handleChange}
            />

            <ThemedTextInput
                label='PINCode'
                require={true}
                name='pinCode'
                value={formData.pinCode}
                error={errors.pinCode}
                handleChange={handleChange}
            />

            <ThemedTextInput
                label='Phone'
                require={false}
                name='phone'
                value={formData.phone}
                error={errors.phone}
                handleChange={handleChange}
            />

            <ThemedTextInput
                label='Mobile'
                require={false}
                name='mobile'
                value={formData.mobile}
                error={errors.mobile}
                handleChange={handleChange}
            />

            <ThemedTextInput
                label='Email'
                require={false}
                name='email'
                value={formData.email}
                error={errors.email}
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

export default BankForm;