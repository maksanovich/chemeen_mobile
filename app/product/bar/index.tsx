import React from 'react';
import {
    StyleSheet,
    ScrollView,
} from 'react-native';

import BARTable from '@/components/Tables/BARTable';

const BARScreen = () => {
    return (
        <ScrollView horizontal style={styles.scrollView}>
            <BARTable
                editable={false}
            />
        </ScrollView >
    );
};

export default BARScreen;

const styles = StyleSheet.create({
    scrollView: {
        marginHorizontal: 10,
    },
});
