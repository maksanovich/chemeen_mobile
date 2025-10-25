import React from 'react';
import {
    StyleSheet,
} from 'react-native';
import { Link } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { TabBarIcon } from '@/components/ThemedIcon';
import { IMaster } from '@/constants/Interfaces';

interface ProductItemProps {
    item: IMaster;
    enable: () => boolean;
    onPressEvent: () => void;
}

const ProductItem: React.FC<ProductItemProps> = (props) => {
    const { item, enable = () => true } = props;

    return (
        <ThemedView style={styles.container}>
            <ThemedView style={styles.link1}>
                <Link href={item.url}>
                    <ThemedText
                        ellipsizeMode='head'
                        numberOfLines={1}
                        style={styles.text}
                    >
                        {item.name}
                    </ThemedText>
                </Link>
            </ThemedView>
            {
                <ThemedView style={styles.link2}>
                    <Link href={`${item.url}/edit`} style={[enable() === false && styles.hidden]}>
                        <TabBarIcon name={'create-outline'} color={'#1964e5'} />
                    </Link>
                </ThemedView>
            }
        </ThemedView >
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
    },
    hidden: {
        display: 'none'
    }
});

export default ProductItem