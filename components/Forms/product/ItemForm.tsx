import React, { useEffect, useState } from 'react';

import { ThemedView } from '@/components/ThemedView';
import { ThemedPicker } from '@/components/ThemedPicker';
import { ThemedTextInput } from '@/components/ThemedTextInput';
import { ThemedButton } from '@/components/ThemedButton';

import PIDetailTable from '@/components/Tables/PIDetailTable';

import { IItem } from '@/constants/Interfaces';

import axiosInstance from '@/utils/axiosInstance';
import { convertDataPicker } from '@/utils/utils';
import { Alert } from 'react-native';

type PIErrors = Partial<Record<keyof IItem, string>>;

const ItemForm = (props: any) => {
    const {
        formData,
        setFormData,
        details,
        setDetails,
        handleSubmit,
        PRSPEnable = true,
    } = props;

    const [errors, setErrors] = useState<PIErrors>({});
    const [packingWeight, setPackingWeight] = useState(0);

    const [PRF, setPRF] = useState<any>([]);
    const [PRS, setPRS] = useState<any>([]);
    const [PRST, setPRST] = useState<any>([]);
    const [PRSP, setPRSP] = useState<any>([]);
    const [PRSV, setPRSV] = useState<any>([]);
    const [PRSPS, setPRSPS] = useState<any>([]);

    useEffect(() => {
        getMasterProduct();
    }, [])

    useEffect(() => {
        getPRS(formData.PRFId);
    }, [formData.PRFId])

    useEffect(() => {
        const getWeight = async () => {
            const response = await axiosInstance.get(`master/PRSP/${formData.PRSPId}`);
            setPackingWeight(response.data.PRSPPiece * response.data.PRSPWeight);
        }
        getWeight();
    }, [formData.PRSPId])

    const getPRS = async (value: any) => {
        const response = await axiosInstance.get('master/PRS?PRFId=' + value);
        const result = convertDataPicker(response.data, 'PRSName', '_id');
        setPRS(result);
    }

    const getMasterProduct = async () => {
        let response = await axiosInstance.get('master/PRF');
        let result = convertDataPicker(response.data, 'PRFName', '_id');
        setPRF(result);

        response = await axiosInstance.get('master/PRST');
        result = convertDataPicker(response.data, 'PRSTName', '_id');
        setPRST(result);

        response = await axiosInstance.get('master/PRSV');
        result = convertDataPicker(response.data, 'PRSVDesc', '_id');
        setPRSV(result);

        response = await axiosInstance.get('master/PRSPS?type=prsg');
        result = convertDataPicker(response.data, 'PRSPSDesc', '_id');
        setPRSPS(result);

        response = await axiosInstance.get('master/PRSP');
        result = convertDataPicker(response.data, 'PRSP', '_id');
        setPRSP(result);
    }

    const handleChange = async (name: keyof IItem, value: string) => {
        switch (name) {
            case 'PRFId': {
                const response = await axiosInstance.get('master/PRS?PRFId=' + value);
                const result = convertDataPicker(response.data, 'PRSName', '_id');
                setPRS(result);
            }
                break;
            case 'PRSPSId': {
                const response = await axiosInstance.get('master/PRSG?PRSPSId=' + value);
                let result = response.data.map((item: any) => {
                    return {
                        PRSGId: item._id,
                        size: item.PRSGDesc,
                        cartons: '',
                        kgQty: '',
                        usdRate: '',
                        usdAmount: ''
                    }
                })
                setDetails(result)
            }
                break;
            case 'PRSPId': {
                const response = await axiosInstance.get(`master/PRSP/${value}`);
                setPackingWeight(response.data.PRSPPiece * response.data.PRSPWeight);
            }
                break;
            default:
                break;
        }

        setFormData({ ...formData, [name]: value });
        setErrors({ ...errors, [name]: '' });
    };

    const onSubmit = () => {
        const newErrors: PIErrors = {};
        const unRequireFields = [''];

        Object.keys(formData).forEach((key) => {
            const field = key as keyof IItem;
            if (!formData[field] && unRequireFields.indexOf(field) === -1) {
                newErrors[field] = 'This is required field.';
            }
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        if (details.length === 0) {
            Alert.alert('Notice', 'Please add at least one detail.\nIf you want to add detail, please select product species packing style.');
            return;
        }
        handleSubmit();
    };

    return (
        <ThemedView>
            <ThemedTextInput
                label='Marks & No'
                require={true}
                name='marksNo'
                value={formData.marksNo}
                error={errors.marksNo}
                handleChange={handleChange}
            />

            <ThemedPicker
                items={PRF}
                label={'Product Family'}
                require={true}
                name={'PRFId'}
                selectedValue={formData.PRFId}
                error={errors.PRFId}
                handleChange={handleChange}
            />

            <ThemedPicker
                items={PRS}
                label={'Product Species'}
                require={true}
                name={'PRSId'}
                selectedValue={formData.PRSId}
                error={errors.PRSId}
                handleChange={handleChange}
            />

            <ThemedPicker
                items={PRST}
                label={'Product Species Type'}
                require={true}
                name={'PRSTId'}
                selectedValue={formData.PRSTId}
                error={errors.PRSTId}
                handleChange={handleChange}
            />

            <ThemedPicker
                items={PRSP}
                label={'Product Species Packing'}
                require={true}
                name={'PRSPId'}
                selectedValue={formData.PRSPId}
                error={errors.PRSPId}
                handleChange={handleChange}
            />

            <ThemedPicker
                items={PRSV}
                label={'Product Species Variety'}
                require={true}
                name={'PRSVId'}
                selectedValue={formData.PRSVId}
                error={errors.PRSVId}
                handleChange={handleChange}
            />

            <ThemedPicker
                items={PRSPS}
                label={'Product Species Packing Style'}
                require={true}
                name={'PRSPSId'}
                selectedValue={formData.PRSPSId}
                error={errors.PRSPSId}
                handleChange={handleChange}
                enable={PRSPEnable}
            />

            <PIDetailTable
                details={details}
                setDetails={setDetails}
                weight={packingWeight}
                editable={true}
            />

            <ThemedButton
                text='Submit'
                fullWidth={true}
                onPressEvent={onSubmit}
            />
        </ThemedView>
    );
};

export default ItemForm;