import React, { useState, useCallback, useEffect } from 'react';
import {
    StyleSheet,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedButton } from '@/components/ThemedButton';
import { TabBarIcon } from '@/components/ThemedIcon';

import axiosInstance from '@/utils/axiosInstance';

import { useSelector } from "@/store";

interface CodeItem {
    ItemId: number;
    code: string;
    farmId: number;
    farmName: string;
    total: number;
    grades: Array<{
        codeId: number;
        PRSGId: number;
        PRSGDesc: string;
        value: number;
    }>;
}

interface CodeListProps {
    editable: boolean
}

const CodeListTable: React.FC<CodeListProps> = ({ editable }) => {
    const router = useRouter();

    const screenWidth = Dimensions.get('window').width;

    const selectedPI: any = useSelector((state) => state.selectedPI.data);

    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    // Fetch code list data from database when component mounts or PIId changes
    useEffect(() => {
        const fetchCodeListData = async () => {
            if (selectedPI.PIId) {
                setLoading(true);
                try {
                    const response = await axiosInstance.get(`product/codeList/pi/${selectedPI.PIId}`);
                    setItems(response.data);
                } catch (error) {
                    console.error('Error fetching code list data:', error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchCodeListData();
    }, [selectedPI.PIId]);


    const handleAdd = () => {
        router.navigate('/product/codeList/create' as any);
    };

    const handleRemove = useCallback(async (index: number) => {
        const itemToRemove = items[index];

        if (itemToRemove) {
            try {
                await axiosInstance.delete(`product/codeList/${selectedPI.PIId}?itemId=${itemToRemove.ItemId}&&code=${itemToRemove.code}`);
                
                // Refresh data from database after successful deletion
                const response = await axiosInstance.get(`product/codeList/pi/${selectedPI.PIId}`);
                setItems(response.data);
            } catch (error) {
                console.log(error, 'handleremove====');
            }
        }
    }, [items, selectedPI.PIId]);

    const handleEdit = (item: any) => {
        // Use the first grade's codeId as the identifier for navigation
        const firstCodeId = item.grades && item.grades.length > 0 ? item.grades[0].codeId : null;
        if (firstCodeId) {
            router.navigate(`/product/codeList/${firstCodeId}` as any);
        }
    };

    const renderItem = async ({ item, index }: { item: any; index: number }) => (
        <ThemedView style={styles.itemRow} key={index}>
            <TouchableOpacity onPress={() => handleRemove(index)} style={[styles.removeBtn, !editable && styles.hidden]}>
                <TabBarIcon name="trash" color="#c15153" />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => handleEdit(item)} style={[styles.editBtn, !editable && styles.hidden]}>
                <TabBarIcon name="pencil" color="#4a90e2" />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.navigate(`/product/item/${item.ItemId}` as any)}>
                <ThemedText
                    style={[styles.cell, styles.productCodeCell, styles.clickableText]}
                    numberOfLines={1}
                    ellipsizeMode='tail'
                >
                    {item.productName}
                </ThemedText>
            </TouchableOpacity>

            <ThemedText style={[styles.cell, styles.codeCell]}>
                {item.code}
            </ThemedText>

            <ThemedText style={[styles.cell, styles.farmCell]}>
                {item.farmName}
            </ThemedText>

            <ThemedView style={styles.gradesContainer}>
                {item.grades.map((grade: any, gradeIndex: number) => (
                    <ThemedView key={gradeIndex} style={styles.gradeContainer}>
                        <ThemedText
                            style={styles.gradeLabel}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                        >
                            {grade.PRSGDesc}:
                        </ThemedText>
                        <ThemedText style={styles.gradeValue}>{grade.value}</ThemedText>
                    </ThemedView>
                ))}
            </ThemedView>

            <ThemedText style={[styles.cell, styles.totalCell]}>
                {item.total}
            </ThemedText>
        </ThemedView>
    );

    return (
        <ThemedView style={[styles.container]}>
            <ThemedView style={[styles.btnGroup, !editable && styles.hidden]}>
                <ThemedButton text="Add" onPressEvent={handleAdd} />
            </ThemedView>

            <ThemedView style={styles.row}>
                <ThemedText style={[styles.removeBtn, !editable && styles.hidden]}></ThemedText>
                <ThemedText style={[styles.editBtn, !editable && styles.hidden]}></ThemedText>
                <ThemedText style={[styles.headerCell, styles.productCodeCell]}>Product Code</ThemedText>
                <ThemedText style={[styles.headerCell, styles.codeCell]}>Code</ThemedText>
                <ThemedText style={[styles.headerCell, styles.farmCell]}>Farm</ThemedText>
                <ThemedText style={[styles.headerCell, styles.gradesHeader]}>Grades</ThemedText>
                <ThemedText style={[styles.headerCell, styles.totalCell]}>Total</ThemedText>
            </ThemedView>

            {loading ? (
                <ThemedText style={styles.loadingText}>Loading code list...</ThemedText>
            ) : items.length > 0 ? (
                items.map((item, index) => {
                    return renderItem({ item, index })
                })
            ) : (
                <ThemedText style={styles.noDataText}>No code list found</ThemedText>
            )}
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        marginHorizontal: 10,
        marginVertical: 20,
        elevation: 5,
        backgroundColor: '#fff',
        borderRadius: 10,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 10,
        justifyContent: 'space-between',
        padding: 5,
    },
    itemRow: {
        flexDirection: 'row',
        marginBottom: 8,
        padding: 8,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        alignItems: 'center',
        minHeight: 60,
    },
    headerCell: {
        padding: 5,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    footerCell: {
        width: 100,
        padding: 5,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    cell: {
        textAlign: 'center',
        color: '#000',
    },
    productCodeCell: {
        width: 200,
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    codeCell: {
        width: 80,
        fontWeight: '600',
        color: '#34495e',
    },
    farmCell: {
        width: 100,
        color: '#7f8c8d',
    },
    gradesHeader: {
        width: 200,
        maxWidth: 200,
    },
    gradesContainer: {
        width: 200,
        maxWidth: 200,
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
    },
    gradeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 8,
        marginBottom: 4,
        backgroundColor: '#e8f4f8',
        padding: 4,
        borderRadius: 4,
        maxWidth: 90,
        minWidth: 80,
    },
    gradeLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#2980b9',
        marginRight: 4,
        flex: 1,
    },
    gradeValue: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#2c3e50',
        flex: 1,
        textAlign: 'right',
    },
    totalCell: {
        width: 60,
        fontWeight: 'bold',
        color: '#27ae60',
        fontSize: 16,
    },
    editableCell: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 8,
        marginHorizontal: 5,
        textAlign: 'center',
        color: '#000',
    },
    removeBtn: {
        width: 40,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    editBtn: {
        width: 40,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    clickableText: {
        color: '#3498db',
        textDecorationLine: 'underline',
    },
    btnGroup: {
        flexDirection: 'row',
        gap: 2,
        margin: 5,
    },
    hidden: {
        display: 'none'
    },
    loadingText: {
        textAlign: 'center',
        padding: 20,
        fontSize: 16,
        color: '#666',
    },
    noDataText: {
        textAlign: 'center',
        padding: 20,
        fontSize: 16,
        color: '#999',
    },
});

export default CodeListTable;
