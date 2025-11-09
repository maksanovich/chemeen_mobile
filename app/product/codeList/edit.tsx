import React, { useCallback, useEffect } from 'react';
import {
    StyleSheet,
    ScrollView,
} from 'react-native';

import CodeListTable from '@/components/Tables/CodeListTable';
import { ThemedView } from '@/components/ThemedView';
import { useNavigation } from '@react-navigation/native';
import axiosInstance from '@/utils/axiosInstance';
import { useSelector } from '@/store';
import { showCartonMismatchWarning } from '@/utils/alertHelper';

const CodeListEditScreen = () => {
    const navigation = useNavigation();
    const selectedPI: any = useSelector((state) => state.selectedPI.data);

    const checkCartonMismatchOnExit = useCallback(async () => {
        try {
            if (!selectedPI?.PIId) return;
            const [codeListRes, productRes] = await Promise.all([
                axiosInstance.get(`product/codeList/pi/${selectedPI.PIId}`),
                axiosInstance.get(`product/item/merged/${selectedPI.PIId}`),
            ]);

            const codeListData = codeListRes.data || [];
            const productData = productRes.data || [];

            const mismatches: string[] = [];
            productData.forEach((product: any) => {
                const productTotal = parseFloat(product.totalCarton) || 0;
                const codeListTotal = codeListData
                    .filter((code: any) => code.ItemId === product.ItemId)
                    .reduce((sum: number, code: any) => sum + (parseFloat(code.total) || 0), 0);
                if (Math.abs(productTotal - codeListTotal) > 0.01) {
                    mismatches.push(
                        `• ${product.productCode}\n  Required: ${productTotal} cartons\n  Available: ${codeListTotal} cartons`
                    );
                }
            });

            if (mismatches.length > 0) {
                showCartonMismatchWarning(mismatches);
            }
        } catch (error) {
            // fail silently on exit
        }
    }, [selectedPI?.PIId]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', () => {
            // fire-and-forget; we don't block navigation
            checkCartonMismatchOnExit();
        });
        return unsubscribe;
    }, [navigation, checkCartonMismatchOnExit]);
    return (
        <ScrollView 
            horizontal={true}
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
