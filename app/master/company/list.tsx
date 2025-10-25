import { useEffect, useState } from 'react';
import {
    StyleSheet,
    ScrollView,
    Alert
} from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedView } from '@/components/ThemedView';
import { ThemedButton } from '@/components/ThemedButton';

import MasterItem from '@/components/MasterItem';

import { IMaster } from '@/constants/Interfaces';

import axiosInstance from '@/utils/axiosInstance';
import { getMasterListNames } from '@/utils/utils';

import { useDispatch, useSelector } from '@/store';
import { loadItem, deleteItem } from '@/store/reducers/master';

export default function CompanyScreen() {
    const router = useRouter();
    const dispatch = useDispatch();

    const { items } = useSelector((state) => state.master);

    const [companyNames, setCompanyNames] = useState<IMaster[]>([]);

    useEffect(() => {
        getCompanies();
    }, []);

    useEffect(() => {
        const result = getMasterListNames(items, 'companyName', 'company');
        setCompanyNames(result);
    }, [items])

    const getCompanies = async () => {
        try {
            const response = await axiosInstance.get('master/company');
            dispatch(loadItem(response.data));
        } catch (error: any) {
            console.error('Fetch Error:', error);
            Alert.alert('Error', 'Failed to load companies from server');
        }
    }

    const onPressAdd = () => {
        router.push('/master/company/add');
    }

    const onPressRemove = async (param: string) => {
        try {
            await axiosInstance.delete(param);
            const parts = param.split('/');
            const id = parts[3];
            dispatch(deleteItem(id));
            Alert.alert('Success', 'Company deleted successfully!');
        } catch (error: any) {
            console.error('Delete Error:', error);
            Alert.alert('Error', 'Failed to delete company');
        }
    }

    return (
        <ScrollView>
            <ThemedView style={styles.container}>
                <ThemedView style={styles.btnView}>
                    <ThemedButton
                        text='Add'
                        onPressEvent={onPressAdd}
                    />
                </ThemedView>
                {companyNames.map((item: IMaster, index: number) => (
                    <MasterItem
                        key={index}
                        item={item}
                        removable={true}
                        onPressEvent={() => onPressRemove(item.url)}
                    />
                ))}
            </ThemedView>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 20
    },
    btnView: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginHorizontal: 10,
        marginBottom: 10
    },
});