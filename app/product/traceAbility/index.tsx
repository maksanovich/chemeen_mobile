import React from 'react';
import {
    StyleSheet,
    ScrollView,
} from 'react-native';

import TraceAbilityTable from '@/components/Tables/TraceAbilityTable';

const TraceAbilityScreen = () => {
    return (
        <ScrollView horizontal style={styles.scrollView}>
            <TraceAbilityTable
                editable={false}
            />
        </ScrollView >
    );
};

export default TraceAbilityScreen;

const styles = StyleSheet.create({
    scrollView: {
        marginHorizontal: 10,
    },
});
