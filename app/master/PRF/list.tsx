import { useEffect, useState } from 'react';
import {
    StyleSheet,
    ScrollView,
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

export default function PRFScreen() {
    const router = useRouter();
    const dispatch = useDispatch();

    const { items } = useSelector((state) => state.master);

    const [PRFNames, setPRFNames] = useState<IMaster[]>([]);

    useEffect(() => {
        getPRF();
    }, []);

    useEffect(() => {
        const result = getMasterListNames(items, 'PRFName', 'PRF');
        setPRFNames(result);
    }, [items])

    const getPRF = async () => {
        try {
            const response = await axiosInstance.get('master/PRF');
            dispatch(loadItem(response.data));
        } catch (error) {
            console.error('Fetch Error:', error);
        }
    }

    const onPressAdd = () => {
        router.push('/master/PRF/add');
    }

    const onPressRemove = async (param: string) => {
        await axiosInstance.delete(param);
        const parts = param.split('/');
        const id = parts[3];
        dispatch(deleteItem(id));
    }

    return (
        <ScrollView
            // contentContainerStyle={{ flexGrow: 1 }}
        >
            <ThemedView style={styles.container}>
                <ThemedView style={styles.btnView}>
                    <ThemedButton
                        text='Add'
                        onPressEvent={onPressAdd}
                    />
                </ThemedView>
                {PRFNames.map((item: IMaster, index: number) => (
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
        // height: '100%',
        paddingVertical: 20
    },
    btnView: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginHorizontal: 10,
        marginBottom: 10
    },
});