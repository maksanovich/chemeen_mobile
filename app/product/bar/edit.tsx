import React from 'react';
import {
    StyleSheet,
    ScrollView,
} from 'react-native';

import BARTable from '@/components/Tables/BARTable';

const BAREditScreen = () => {
    return (
        <ScrollView horizontal style={styles.scrollView}>
            <BARTable
                editable={true}
            />
        </ScrollView>
    );
};

export default BAREditScreen;

const styles = StyleSheet.create({
    scrollView: {
        marginHorizontal: 10,
    },
});
