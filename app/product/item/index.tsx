import React from 'react';
import {
    StyleSheet,
    ScrollView,
} from 'react-native';

import { ThemedView } from '@/components/ThemedView';
import ItemTable from '@/components/Tables/ItemTable';

const ItemScreen = () => {
    return (
        <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={true}
            style={styles.scrollView}
            contentContainerStyle={styles.contentContainer}
        >
            <ItemTable
                editable={false}
            />
        </ScrollView>
    );
};

export default ItemScreen;

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        paddingVertical: 20,
        paddingHorizontal: 10,
    },
});
