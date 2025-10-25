import React from 'react';
import {
    StyleSheet,
    ScrollView,
} from 'react-native';

import CodeListTable from '@/components/Tables/CodeListTable';

const CodeListScreen = () => {
    return (
        <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={true}
            style={styles.scrollView}
            contentContainerStyle={styles.contentContainer}
        >
            <CodeListTable
                editable={false}
            />
        </ScrollView>
    );
};

export default CodeListScreen;

const styles = StyleSheet.create({
    scrollView: {
        marginHorizontal: 10,
    },
    contentContainer: {
        paddingVertical: 10,
    },
});
