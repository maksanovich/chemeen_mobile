import React, { useState } from 'react';

import { ThemedPicker } from '@/components/ThemedPicker';
import { ThemedTextInput } from '@/components/ThemedTextInput';
import { ThemedButton } from '@/components/ThemedButton';
import { ThemedView } from '@/components/ThemedView';

import { ICompany } from '@/constants/Interfaces';
import { COMPANY_TYPE } from '@/constants/Masters';

type CompanyErrors = Partial<Record<keyof ICompany, string>>;

const CompanyForm = (props: any) => {
    const {
        formData,
        setFormData,
        handleSubmit
    } = props;

    const [errors, setErrors] = useState<CompanyErrors>({});

    const handleChange = (name: keyof ICompany, value: string) => {
        if (name === 'mobile' || name === 'phone') {
            value = value.replace(/[^0-9]/g, '');
        }
        setFormData({ ...formData, [name]: value });
        setErrors({ ...errors, [name]: '' });
    };

    const onSubmit = () => {
        const newErrors: CompanyErrors = {};
        const unRequireFields = [
            'address2',
            'phone',
            'mobile',
            'email'
        ]

        Object.keys(formData).forEach((key) => {
            const field = key as keyof ICompany;
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
                items={COMPANY_TYPE}
                label={'Type'}
                require={true}
                name={'type'}
                selectedValue={formData.type}
                error={errors.type}
                handleChange={handleChange}
            />

            <ThemedTextInput
                label='Company Name'
                require={true}
                name='companyName'
                value={formData.companyName}
                error={errors.companyName}
                handleChange={handleChange}
            />

            <ThemedTextInput
                label='Approval Number'
                require={true}
                name='approvalNo'
                value={formData.approvalNo}
                error={errors.approvalNo}
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

export default CompanyForm;