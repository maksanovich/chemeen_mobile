import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedCollapse } from '@/components/ThemedCollapse';

import { useSelector } from '@/store';
import axiosInstance from '@/utils/axiosInstance';

const PIDetailScreen = () => {
    const selectedPI: any = useSelector((state) => state.selectedPI.data);

    const [item, setItem] = useState<any>({});
    const [expanded, setExpanded] = useState<any>({
        detail: false,
        company: false,
        port: false,
        beneficiary: false,
    })

	useEffect(() => {
		const fetchPIDetail = async () => {
			if (!selectedPI?.PIId) {
				setItem({});
				return;
			}
			try {
				const response = await axiosInstance.get(`product/PI/${selectedPI.PIId}`);
				setItem(response.data || {});
			} catch (error) {
				console.error('Failed to load PI detail:', error);
			}
		};

		fetchPIDetail();
	}, [selectedPI?.PIId])

    return (
        <ScrollView>
            <ThemedView style={styles.mainContainer}>
                <ThemedView style={styles.container}>
                    <ThemedView style={styles.header}>
                        <TouchableOpacity style={styles.w_full} onPress={() => setExpanded({ ...expanded, detail: !expanded.detail })}>
                            <ThemedText type='subtitle'>Invoice Info</ThemedText>
                        </TouchableOpacity>
                    </ThemedView>
                    <ThemedCollapse expanded={expanded.detail}>
                        <ThemedView style={styles.subContainer}>
                            <ThemedText type='small' style={styles.subTitle}>Proforma Invoice No & Date</ThemedText>
                            <ThemedText type='defaultSemiBold' style={!selectedPI.PIId && styles.hidden}>{item.PINo}/{item.PIDate}</ThemedText>
                            <ThemedText type='small' style={styles.subTitle}>Po No</ThemedText>
                            <ThemedText type='defaultSemiBold'>{item.PONumber}</ThemedText>
                            <ThemedText type='small' style={styles.subTitle}>Shipment Date</ThemedText>
                            <ThemedText type='defaultSemiBold' style={!selectedPI.PIId && styles.hidden}>On or Before {item.shipDate}</ThemedText>
                        </ThemedView>
                    </ThemedCollapse>
                </ThemedView>

                <ThemedView style={styles.container}>
                    <ThemedView style={styles.header}>
                        <TouchableOpacity style={styles.w_full} onPress={() => setExpanded({ ...expanded, company: !expanded.company })}>
                            <ThemedText type='subtitle'>Companies</ThemedText>
                        </TouchableOpacity>
                    </ThemedView>
                    <ThemedCollapse expanded={expanded.company}>
                        <ThemedView style={styles.subContainer}>
                            <ThemedText type='small' style={styles.subTitle}>Exporter</ThemedText>
                            <ThemedText type='defaultSemiBold' style={styles.consignee}>{item.exporterName}</ThemedText>
                            <ThemedText type='small' style={styles.subTitle}>Processor</ThemedText>
                            <ThemedText type='defaultSemiBold' style={styles.consignee}>{item.processorName}</ThemedText>
                            <ThemedText type='small' style={styles.subTitle}>Consignee</ThemedText>
                            <ThemedText type='defaultSemiBold' style={styles.consignee}>{item.consigneeName}</ThemedText>
                        </ThemedView>
                    </ThemedCollapse>
                </ThemedView>

                <ThemedView style={styles.container}>
                    <ThemedView style={styles.header}>
                        <TouchableOpacity style={styles.w_full} onPress={() => setExpanded({ ...expanded, port: !expanded.port })}>
                            <ThemedText type='subtitle'>Port Of Discharge</ThemedText>
                        </TouchableOpacity>
                    </ThemedView>
                    <ThemedCollapse expanded={expanded.port}>
                        <ThemedView style={styles.subContainer}>
                            <ThemedText type='small' style={styles.subTitle}>Loading Port</ThemedText>
                            <ThemedText type='defaultSemiBold' style={!selectedPI.PIId && styles.hidden}>{item.loadingPortName} Of {item.loadingPortCountry}</ThemedText>
                            <ThemedText type='small' style={styles.subTitle}>Discharge Port</ThemedText>
                            <ThemedText type='defaultSemiBold' style={!selectedPI.PIId && styles.hidden}>{item.dischargePortName} Of {item.dischargePortCountry}</ThemedText>
                        </ThemedView>
                    </ThemedCollapse>
                </ThemedView>

                <ThemedView style={styles.container}>
                    <ThemedView style={styles.header}>
                        <TouchableOpacity style={styles.w_full} onPress={() => setExpanded({ ...expanded, beneficiary: !expanded.beneficiary })}>
                            <ThemedText type='subtitle'>Beneficiary</ThemedText>
                        </TouchableOpacity>
                    </ThemedView>
                    <ThemedCollapse expanded={expanded.beneficiary}>
                        <ThemedView style={styles.subContainer}>
                            <ThemedText type='small' style={styles.subTitle}>Beneciary</ThemedText>
                            <ThemedText type='defaultSemiBold'>{item.exporterName}</ThemedText>
                            <ThemedText type='small' style={styles.subTitle}>Beneciary Address</ThemedText>
                            <ThemedText type='defaultSemiBold'>{item.exporterAddress}</ThemedText>
                            <ThemedText type='small' style={styles.subTitle}>Bank</ThemedText>
                            <ThemedText type='defaultSemiBold'>{item.bankName}</ThemedText>
                        </ThemedView>
                    </ThemedCollapse>
                </ThemedView>
            </ThemedView>
        </ScrollView >
    );
};

export default PIDetailScreen;

const styles = StyleSheet.create({
    mainContainer: {
        paddingTop: 20
    },
    container: {
        padding: 20,
        marginHorizontal: 10,
        marginVertical: 5,
        borderRadius: 10,
        elevation: 5
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    subContainer: {
        marginTop: 5,
        width: '100%'
    },
    subTitle: {
        marginTop: 10,
    },
    consignee: {
        color: 'pink'
    },
    w_full: {
        width: '100%'
    },
    textCenter: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    hidden: {
        display: 'none'
    }
});