import React, { useEffect, useState } from 'react';

import { ThemedView } from '@/components/ThemedView';
import { ThemedPicker } from '@/components/ThemedPicker';
import { ThemedTextInput } from '@/components/ThemedTextInput';
import { ThemedButton } from '@/components/ThemedButton';
import { ThemedDatePicker } from '@/components/ThemedDatePicker';

import { IPI } from '@/constants/Interfaces';

import axiosInstance from '@/utils/axiosInstance';
import { convertDataPicker } from '@/utils/utils';

type PIErrors = Partial<Record<keyof IPI, string>>;

const PIForm = (props: any) => {
    const {
        formData,
        setFormData,
        handleSubmit,
    } = props;

    const [errors, setErrors] = useState<PIErrors>({});

    const [exporters, setExporters] = useState<any>([]);
    const [processors, setProcessors] = useState<any>([]);
    const [consignees, setConsignees] = useState<any>([]);
    const [banks, setBanks] = useState<any>([]);
    const [ports, setPorts] = useState<any>([]);

    useEffect(() => {
        getCompany();
        getBank();
        getPort();
    }, [])

    useEffect(() => {
        if (formData.loadingPortId != '' && formData.loadingPortId == formData.dischargePortId) {
            setErrors({ 'loadingPortId': 'Loading Port can not be same with discharge Port!' });
        } else {
            setErrors(prevErrors => {
                const { loadingPortId, ...rest } = prevErrors;
                return rest;
            });
        }
    }, [formData.loadingPortId, formData.dischargePortId])

    const getCompany = async () => {
        let response = await axiosInstance.get('master/company?type=Exporter');
        let result = convertDataPicker(response.data, 'companyName', '_id');
        setExporters(result);

        response = await axiosInstance.get('master/company?type=Processor');
        result = convertDataPicker(response.data, 'companyName', '_id');
        setProcessors(result);

        response = await axiosInstance.get('master/company?type=Consignee');
        result = convertDataPicker(response.data, 'companyName', '_id');
        setConsignees(result);
    }

    const getBank = async () => {
        let response = await axiosInstance.get('master/bank');
        let result = convertDataPicker(response.data, 'bankName', '_id');
        setBanks(result);
    }

    const getPort = async () => {
        let response = await axiosInstance.get('master/port');
        let result = convertDataPicker(response.data, 'portName', '_id');
        setPorts(result);
    }

    const handleChange = async (name: keyof IPI, value: string) => {
        console.log(`Updating field ${name} with value:`, value);
        if (name === 'POQuality') {
            console.log('POQuality field being updated to:', value);
        }
        setFormData({ ...formData, [name]: value });
        setErrors({ ...errors, [name]: '' });
    };

    const onSubmit = () => {
        const newErrors: PIErrors = {};
        const unRequireFields = ['containerNumber', 'grossQuantity', 'linerNumber', 'netQuantity'];

        Object.keys(formData).forEach((key) => {
            const field = key as keyof IPI;
            if (!formData[field] && unRequireFields.indexOf(field) === -1) {
                newErrors[field] = 'This is required field.';
            }
        });

        if (errors.loadingPortId) {
            return;
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        handleSubmit();
    };

    return (
        <ThemedView>
            <ThemedTextInput
                label='Invoice Number'
                require={true}
                name='PINo'
                value={formData.PINo}
                error={errors.PINo}
                handleChange={handleChange}
            />

            <ThemedDatePicker
                label={'Invoice Date'}
                require={true}
                name={'PIDate'}
                selectedValue={formData.PIDate}
                error={errors.PIDate}
                handleChange={handleChange}
            />

            <ThemedTextInput
                label='GSTIn'
                require={true}
                name='GSTIn'
                value={formData.GSTIn}
                error={errors.GSTIn}
                handleChange={handleChange}
            />

            <ThemedTextInput
                label='PO Number'
                require={true}
                name='PONumber'
                value={formData.PONumber}
                error={errors.PONumber}
                handleChange={handleChange}
            />

            <ThemedTextInput
                label='PO Quality'
                require={true}
                name='POQuality'
                value={formData.POQuality}
                error={errors.POQuality}
                handleChange={handleChange}
            />

            <ThemedDatePicker
                label={'Shipment Date'}
                require={true}
                name={'shipDate'}
                selectedValue={formData.shipDate}
                error={errors.shipDate}
                handleChange={handleChange}
            />

            <ThemedPicker
                items={exporters}
                label={'Exporter'}
                require={true}
                name={'exporterId'}
                selectedValue={formData.exporterId}
                error={errors.exporterId}
                handleChange={handleChange}
            />

            <ThemedPicker
                items={processors}
                label={'Processor'}
                require={true}
                name={'processorId'}
                selectedValue={formData.processorId}
                error={errors.processorId}
                handleChange={handleChange}
            />

            <ThemedPicker
                items={consignees}
                label={'Consignee'}
                require={true}
                name={'consigneeId'}
                selectedValue={formData.consigneeId}
                error={errors.consigneeId}
                handleChange={handleChange}
            />

            <ThemedPicker
                items={banks}
                label={'Bank'}
                require={true}
                name={'bankId'}
                selectedValue={formData.bankId}
                error={errors.bankId}
                handleChange={handleChange}
            />

            <ThemedTextInput
                label='Terms Delivery Payment'
                require={true}
                name='TDP'
                value={formData.TDP}
                error={errors.TDP}
                handleChange={handleChange}
            />

            <ThemedPicker
                items={ports}
                label={'Loading Port'}
                require={true}
                name={'loadingPortId'}
                selectedValue={formData.loadingPortId}
                error={errors.loadingPortId}
                handleChange={handleChange}
            />

            <ThemedPicker
                items={ports}
                label={'Discharge Port'}
                require={true}
                name={'dischargePortId'}
                selectedValue={formData.dischargePortId}
                error={errors.dischargePortId}
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

export default PIForm;