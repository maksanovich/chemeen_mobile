import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    ScrollView,
    View,
    Text,
    TouchableOpacity,
    RefreshControl,
    Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from "expo-sharing";
import { useSelector } from '@/store';
import axiosInstance from '@/utils/axiosInstance';
import { useRouter } from 'expo-router';
import { showSuccess, showError, showInfo, showConfirmation } from '@/utils/alertHelper';

interface PDFFile {
    pdfId: number;
    pdfName: string;
    fileName: string;
    fileSize: number;
    uploadDate: string;
}

const ELISAScreen = () => {
    const router = useRouter();
    const selectedPI: any = useSelector((state) => state.selectedPI.data);
    const [files, setFiles] = useState<PDFFile[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);

    // Fetch PDF files
    const fetchFiles = async () => {
        try {
            if (!selectedPI?.PIId) return;
            
            const response = await axiosInstance.get(`product/elisaPDF/by-pi/${selectedPI.PIId}`);
            setFiles(response.data || []);
        } catch (error) {
            console.error('Error fetching PDFs:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchFiles();
    }, [selectedPI?.PIId]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchFiles();
    };

    // Format file size
    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    // Format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.toLocaleString('en', { month: 'short' });
        const year = date.getFullYear();
        return `${day} ${month} ${year}`;
    };

    // Download PDF
    const handleDownload = async (pdfId: number, fileName: string) => {
        try {
            showInfo('Download', `Downloading ${fileName}...`);
            
            const response = await axiosInstance.get(`product/elisaPDF/${pdfId}/download`, {
                responseType: 'arraybuffer'
            });
            
            const uint8Array = new Uint8Array(response.data);
            const base64String = btoa(String.fromCharCode(...uint8Array));
            
            const fileUri = FileSystem.cacheDirectory + fileName;
            
            await FileSystem.writeAsStringAsync(fileUri, base64String, {
                encoding: FileSystem.EncodingType.Base64,
            });
            
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUri, {
                    mimeType: "application/pdf",
                    dialogTitle: `Save ${fileName}`,
                    UTI: "com.adobe.pdf",
                });
            } else {
                showError("Sharing not available", "Unable to save file on this device.");
            }
        } catch (error: any) {
            console.error('Download error:', error);
            
            // Provide more specific error messages
            let errorMessage = 'Failed to download file';
            
            if (error.response?.status === 404) {
                if (error.response?.data?.message === 'PDF not found') {
                    errorMessage = 'PDF file not found in database. It may have been deleted.';
                } else if (error.response?.data?.message === 'File not found on server') {
                    errorMessage = 'PDF file not found on server. Please contact support.';
                } else {
                    errorMessage = 'PDF file not found. Please refresh the list and try again.';
                }
            } else if (error.response?.status === 500) {
                errorMessage = 'Server error occurred while downloading. Please try again later.';
            } else if (error.code === 'NETWORK_ERROR') {
                errorMessage = 'Network error. Please check your connection and try again.';
            }
            
            showError('Download Error', errorMessage);
        }
    };

    // Delete PDF
    const handleDelete = (pdfId: number, fileName: string) => {
        showConfirmation(
            'Delete File',
            `Are you sure you want to delete "${fileName}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await axiosInstance.delete(`product/elisaPDF/${pdfId}`);
                            fetchFiles();
                        } catch (error) {
                            showError('Error', 'Failed to delete file');
                        }
                    }
                }
            ]
        );
    };

    // Show menu
    const showMenu = (file: PDFFile) => {
        Alert.alert(
            file.pdfName,
            'Choose an action',
            [
                {
                    text: 'Download',
                    onPress: () => handleDownload(file.pdfId, file.fileName)
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => handleDelete(file.pdfId, file.pdfName)
                },
                { text: 'Cancel', style: 'cancel' }
            ]
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>ELISA PDF List</Text>
                <TouchableOpacity onPress={onRefresh}>
                    <Ionicons name="refresh" size={24} color="#000" />
                </TouchableOpacity>
            </View>

            <Text style={styles.breadcrumb}>
                Product - ELISA - PDF Documents
            </Text>

            {/* Upload Button */}
            <TouchableOpacity 
                style={styles.uploadButton}
                onPress={() => router.push('/product/elisa/edit')}
            >
                <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
                <Text style={styles.uploadButtonText}>Upload ELISA Report</Text>
            </TouchableOpacity>

            {/* File List */}
            <ScrollView
                style={styles.fileList}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {loading ? (
                    <Text style={styles.emptyText}>Loading...</Text>
                ) : files.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="document-text-outline" size={64} color="#ccc" />
                        <Text style={styles.emptyText}>No ELISA Reports Available</Text>
                        <Text style={styles.emptySubtext}>
                            Upload your ELISA test reports to begin tracking
                        </Text>
                    </View>
                ) : (
                    files.map((file, index) => {
                        const isLatest = index === 0; // First file is the latest (DESC order)
                        return (
                            <TouchableOpacity
                                key={file.pdfId}
                                style={[
                                    styles.fileItem, 
                                    isLatest && styles.fileItemLatest
                                ]}
                                onPress={() => showMenu(file)}
                            >
                                <View style={[
                                    styles.fileIcon,
                                    isLatest && styles.fileIconLatest
                                ]}>
                                    <Ionicons 
                                        name="document-text" 
                                        size={32} 
                                        color={isLatest ? "#3b82f6" : "#dc2626"} 
                                    />
                                    {isLatest && (
                                        <View style={styles.latestBadge}>
                                            <Text style={styles.latestBadgeText}>NEW</Text>
                                        </View>
                                    )}
                                </View>
                                
                                <View style={styles.fileInfo}>
                                    <Text style={[
                                        styles.fileName,
                                        isLatest && styles.fileNameLatest
                                    ]}>
                                        {file.pdfName}
                                    </Text>
                                    <Text style={styles.fileDetails}>
                                        {formatDate(file.uploadDate)} | {formatFileSize(file.fileSize)}
                                    </Text>
                                </View>

                                <TouchableOpacity 
                                    style={styles.menuButton}
                                    onPress={() => showMenu(file)}
                                >
                                    <Ionicons name="ellipsis-vertical" size={20} color="#666" />
                                </TouchableOpacity>
                            </TouchableOpacity>
                        );
                    })
                )}
            </ScrollView>
        </View>
    );
};

export default ELISAScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
    },
    breadcrumb: {
        fontSize: 12,
        color: '#9ca3af',
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    uploadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#3b82f6',
        marginHorizontal: 16,
        marginVertical: 12,
        paddingVertical: 12,
        borderRadius: 8,
        gap: 8,
    },
    uploadButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    fileList: {
        flex: 1,
        paddingHorizontal: 16,
    },
    fileItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    fileItemLatest: {
        backgroundColor: '#eff6ff',
        marginHorizontal: -16,
        paddingHorizontal: 16,
    },
    fileIcon: {
        width: 48,
        height: 48,
        borderRadius: 8,
        backgroundColor: '#fee2e2',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        position: 'relative',
    },
    fileIconLatest: {
        backgroundColor: '#dbeafe',
    },
    latestBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: '#ef4444',
        borderRadius: 8,
        paddingHorizontal: 4,
        paddingVertical: 2,
    },
    latestBadgeText: {
        color: '#fff',
        fontSize: 8,
        fontWeight: 'bold',
    },
    fileInfo: {
        flex: 1,
    },
    fileName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1f2937',
        marginBottom: 4,
    },
    fileNameLatest: {
        color: '#1e40af',
        fontWeight: '600',
    },
    fileDetails: {
        fontSize: 12,
        color: '#9ca3af',
    },
    menuButton: {
        padding: 8,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 16,
        color: '#9ca3af',
        marginTop: 16,
        textAlign: 'center',
    },
    emptySubtext: {
        fontSize: 14,
        color: '#d1d5db',
        marginTop: 8,
        textAlign: 'center',
    },
});
