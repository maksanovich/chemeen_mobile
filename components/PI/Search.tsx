import React from 'react';
import { TextInput, StyleSheet } from 'react-native';

import { ThemedView } from '@/components/ThemedView';
import { TabBarIcon } from '@/components/ThemedIcon';

interface SearchPIProps {
    search: string,
    setSearch: (newSearch: string) => void;
}

const SearchPI: React.FC<SearchPIProps> = ({ search, setSearch }) => {
    return (
        <ThemedView style={styles.searchPIContainer}>
            <TabBarIcon name={'search'} color={'grey'} />
            <TextInput
                style={styles.input}
                placeholder="Search Invoice Number"
                value={search}
                onChangeText={setSearch}
            />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    searchPIContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 10,
        margin: 10,
        height: 50,
        backgroundColor: '#fff',
    },
    input: {
        flex: 1,
        height: 40,
        paddingHorizontal: 10,
        fontSize: 16,
    }
});

export default SearchPI