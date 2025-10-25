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

export default function PRSScreen() {
    const router = useRouter();
    const dispatch = useDispatch();

    const { items } = useSelector((state) => state.master);

    const [PRSNames, setPRSNames] = useState<IMaster[]>([]);

    useEffect(() => {
        getPRS();
    }, []);

    useEffect(() => {
        const result = getMasterListNames(items, 'PRSName', 'PRS');
        setPRSNames(result);
    }, [items])

    const getPRS = async () => {
        try {
            const response = await axiosInstance.get('master/PRS');
            dispatch(loadItem(response.data));
        } catch (error) {
            console.error('Fetch Error:', error);
        }
    }

    const onPressAdd = () => {
        router.push('/master/PRS/add');
    }

    const onPressRemove = async (param: string) => {
        await axiosInstance.delete(param);
        const parts = param.split('/');
        const id = parts[3];
        dispatch(deleteItem(id));
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
                {PRSNames.map((item: IMaster, index: number) => (
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