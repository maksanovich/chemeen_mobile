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

export default function BankScreen() {
    const router = useRouter();
    const dispatch = useDispatch();

    const { items } = useSelector((state) => state.master);

    const [bankNames, setBankNames] = useState<IMaster[]>([]);

    useEffect(() => {
        getBanks();
    }, []);

    useEffect(() => {
        const result = getMasterListNames(items, 'bankName', 'bank');
        setBankNames(result);
    }, [items])

    const getBanks = async () => {
        try {
            const response = await axiosInstance.get('master/bank');
            dispatch(loadItem(response.data));
        } catch (error: any) {
            console.error('Fetch Error:', error);
            Alert.alert('Error', 'Failed to load banks from server');
        }
    }

    const onPressAdd = () => {
        router.push('/master/bank/add');
    }

    const onPressRemove = async (param: string) => {
        try {
            await axiosInstance.delete(param);
            const parts = param.split('/');
            const id = parts[3];
            dispatch(deleteItem(id));
            Alert.alert('Success', 'Bank deleted successfully!');
        } catch (error: any) {
            console.error('Delete Error:', error);
            Alert.alert('Error', 'Failed to delete bank');
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
                {bankNames.map((item: IMaster, index: number) => (
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