import React from 'react';
import {
    StyleSheet,
    ScrollView,
} from 'react-native';

import CodeListTable from '@/components/Tables/CodeListTable';
import { ThemedView } from '@/components/ThemedView';

const CodeListEditScreen = () => {
    return (
        <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={true}
            style={styles.scrollView}
            contentContainerStyle={styles.contentContainer}
        >
            <ThemedView>
                <CodeListTable
                    editable={true}
                />
            </ThemedView>
        </ScrollView>
    );
};

export default CodeListEditScreen;

const styles = StyleSheet.create({
    scrollView: {
        marginHorizontal: 10,
    },
    contentContainer: {
        paddingVertical: 10,
    },
});
