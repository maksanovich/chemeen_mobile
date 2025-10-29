import React, { useEffect } from 'react';
import {
    TextInput,
    StyleSheet
} from 'react-native';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

import { IPIDetail } from '@/constants/Interfaces';

interface PIDetailsProps {
    details: IPIDetail[];
    setDetails: React.Dispatch<React.SetStateAction<IPIDetail[]>>;
    weight: number,
    editable: boolean
}

const PIDetailTable: React.FC<PIDetailsProps> = (props) => {
    const {
        details,
        setDetails,
        weight,
        editable = true,
    } = props

    useEffect(() => {
        const updatedDetails = details.map(item => {
            const cartons = parseFloat(item.cartons) || 0;
            const rate = parseFloat(item.usdRate) || 0;
            const newKgQty = weight * cartons;
            const newAmount = newKgQty * rate;

            return {
                ...item,
                kgQty: cartons ? newKgQty.toFixed(2) : '',
                usdAmount: rate ? newAmount.toFixed(2) : '',
            };
        });

        setDetails(updatedDetails);
    }, [weight]);

    const calculateFooterTotals = () => {
        if (details.length == 0) {
            return {
                totalCartons: 0,
                totalKgQty: 0,
                totalUsdAmount: 0,
            };
        }

        const totalCartons = details.reduce((sum, row) => sum + (parseFloat(row.cartons) || 0), 0);
        const totalKgQty = details.reduce((sum, row) => sum + (parseFloat(row.kgQty) || 0), 0);
        const totalUsdAmount = details.reduce((sum, row) => sum + (parseFloat(row.usdAmount) || 0), 0);

        return {
            totalCartons,
            totalKgQty,
            totalUsdAmount,
        };
    };

    const handleChange = (value: string, index: number, field: keyof IPIDetail) => {
        const cleanValue = value.replace(/[^0-9.]/g, ''); // allow decimals too
        const newData = [...details];

        newData[index] = { ...newData[index], [field]: cleanValue };

        const row = newData[index];
        
        if (field === 'cartons') {
            const cartons = parseFloat(cleanValue) || 0;
            const kgQty = (weight * cartons).toFixed(2);
            const usdRate = parseFloat(row.usdRate) || 0;
            newData[index].kgQty = kgQty;
            newData[index].usdAmount = (parseFloat(kgQty) * usdRate).toFixed(2);
        }

        if (field === 'usdRate') {
            const usdRate = parseFloat(cleanValue) || 0;
            const kgQty = parseFloat(row.kgQty) || 0;
            newData[index].usdAmount = (kgQty * usdRate).toFixed(2);
        }

        setDetails(newData);
    };

    const renderItem = ({ item, index }: { item: IPIDetail; index: number }) => (
        <ThemedView style={styles.row} key={index}>
            <TextInput
                style={styles.cell}
                value={item.size.toString()}
                editable={false}
                placeholder="Size"
            />
            <TextInput
                style={[styles.cell, editable && styles.editableCell]}
                value={item.cartons}
                onChangeText={(text) => handleChange(text, index, 'cartons')}
                placeholder="0"
                keyboardType="numeric"
                editable={editable}
            />
            <TextInput
                style={styles.cell}
                value={item.kgQty}
                editable={false}
                placeholder="0"
            />
            <TextInput
                style={[styles.cell, editable && styles.editableCell]}
                value={item.usdRate}
                onChangeText={(text) => handleChange(text, index, 'usdRate')}
                placeholder="0"
                keyboardType="numeric"
                editable={editable}
            />
            <TextInput
                style={styles.amountCell}
                value={item.usdAmount}
                editable={false}
                placeholder="0"
            />
        </ThemedView>
    );

    const { totalCartons, totalKgQty, totalUsdAmount } = calculateFooterTotals();

    return (
        <ThemedView style={styles.container}>
            <ThemedView style={styles.row}>
                <ThemedText style={styles.headerCell}>SIZE</ThemedText>
                <ThemedText style={styles.headerCell}>Cartons</ThemedText>
                <ThemedText style={styles.headerCell}>KgQty</ThemedText>
                <ThemedText style={styles.headerCell}>Rate</ThemedText>
                <ThemedText style={styles.amountHeaderCell}>Amount</ThemedText>
            </ThemedView>

            {/* <FlatList
                data={details}
                renderItem={renderItem}
                keyExtractor={(item) => item.PRSGId}
            /> */}
            {
                details.map((item, index) => {
                    return renderItem({ item, index })
                })
            }

            <ThemedView style={styles.row}>
                <ThemedText style={styles.footerCell}>TOTAL</ThemedText>
                <ThemedText style={styles.footerCell}>{totalCartons.toFixed(0)}</ThemedText>
                <ThemedText style={styles.footerCell}>{totalKgQty.toFixed(2)}</ThemedText>
                <ThemedText style={styles.footerCell}></ThemedText>
                <ThemedText style={styles.amountFooterCell}>{totalUsdAmount.toFixed(2)}</ThemedText>
            </ThemedView>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        flex: 1,
        padding: 10,
        marginBottom: 10,
        elevation: 5,
        backgroundColor: '#fff',
        borderRadius: 10
    },
    row: {
        width: '100%',
        flexDirection: 'row',
        marginBottom: 10,
        justifyContent: 'space-between',
    },
    headerCell: {
        width: '18%',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    amountHeaderCell: {
        width: '25%',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    footerCell: {
        width: '18%',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    amountFooterCell: {
        width: '25%',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    cell: {
        width: '18%',
        textAlign: 'center',
        color: '#000'
    },
    amountCell: {
        width: '25%',
        textAlign: 'center',
        color: '#000'
    },
    editableCell: {
        width: '18%',
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 8,
        textAlign: 'center',
        color: '#000'
    },
    amountEditableCell: {
        width: '25%',
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 8,
        textAlign: 'center',
        color: '#000'
    }
});

export default PIDetailTable;
