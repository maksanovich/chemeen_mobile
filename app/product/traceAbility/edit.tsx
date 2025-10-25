import React from 'react';
import {
    StyleSheet,
    ScrollView,
} from 'react-native';

import TraceAbilityTable from '@/components/Tables/TraceAbilityTable';

const TraceAbilityEditScreen = () => {
    return (
        <ScrollView horizontal style={styles.scrollView}>
            <TraceAbilityTable
                editable={true}
            />
        </ScrollView>
    );
};

export default TraceAbilityEditScreen;

const styles = StyleSheet.create({
    scrollView: {
        marginHorizontal: 10,
    },
});
