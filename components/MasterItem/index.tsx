import React, { useEffect } from 'react';
import {
    StyleSheet,
    TouchableOpacity
} from 'react-native';
import { Link } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { TabBarIcon } from '@/components/ThemedIcon';
import { IMaster } from '@/constants/Interfaces';

import { useDispatch, useSelector } from '@/store';
import { defaultAlert, setAlert } from '@/store/reducers/alert';

interface MasterItemProps {
    item: IMaster;
    removable: boolean;
    onPressEvent: () => void;
}

const MasterItem: React.FC<MasterItemProps> = (props) => {
    const {
        item,
        removable = false,
        onPressEvent = () => { },
    } = props;

    const dispatch = useDispatch();
    const alert = useSelector((state) => state.alert);

    useEffect(() => {
        dispatch(defaultAlert({}));
    }, [])

    useEffect(() => {
        if (alert.kind == 0 && alert.url == item.url) {
            onPressEvent();
        }
    }, [alert]);

    const handleRemove = () => {
        dispatch(setAlert({
            kind: 1, // dialog
            type: 1, // warning
            title: 'Confirm Delete',
            message: `Are you sure you want to delete "${item.name}"?`,
            url: item.url
        }));
    }

    return (
        <ThemedView style={styles.container}>
            <Link href={item.url} style={styles.link1}>
                <ThemedText
                    ellipsizeMode='head'
                    numberOfLines={1}
                    style={styles.text}
                >
                    {item.name}
                </ThemedText>
            </Link>
            <TouchableOpacity onPress={handleRemove} style={styles.link2}>
                {
                    removable &&
                    <TabBarIcon name={'trash'} color={'#c15153'} />
                }
            </TouchableOpacity>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        fontSize: 32,
        fontWeight: 800,
        elevation: 5,
        marginHorizontal: 10,
        marginBottom: 5,
        borderRadius: 10,
        padding: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    link1: {
        padding: 18,
        width: '90%',
        overflow: 'hidden'
    },
    link2: {
        width: '10%',
        textAlign: 'center',
    },
    text: {
        flexShrink: 1,
    }
});

export default MasterItem