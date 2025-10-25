import React, { useEffect, useState, useCallback } from 'react';
import {
    StyleSheet,
    ScrollView,
    Alert,
    TouchableOpacity
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import axiosInstance from '@/utils/axiosInstance';
import { useSelector } from '@/store';

export default function ELISAEditScreen() {
    const selectedPI: any = useSelector((state) => state.selectedPI.data);

    // Maximum file size: 7MB
    const MAX_FILE_SIZE = 7 * 1024 * 1024; // 7MB in bytes

    interface FileItem {
        id: string;
        name: string;
        uri: string;
        type: string;
        size?: number;
        progress: number;
        status: 'pending' | 'uploading' | 'completed' | 'error';
    }

    const [files, setFiles] = useState<FileItem[]>([]);
    
    // Check if any files are currently uploading
    const isUploading = files.some(f => f.status === 'uploading');

    // Format file size for display
    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    // Handle file picking
    const handlePickFile = useCallback(async () => {
        // Don't allow picking if files are uploading
        if (isUploading) {
            Alert.alert('Upload in Progress', 'Please wait for current uploads to complete');
            return;
        }
        try {
        const result = await DocumentPicker.getDocumentAsync({
                type: 'application/pdf', // Only allow PDF files
                copyToCacheDirectory: true,
            multiple: true
        });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                // Check file sizes before adding
                const validFiles: FileItem[] = [];
                const invalidFiles: string[] = [];

                result.assets.forEach((file) => {
                    const fileSize = file.size || 0;
                    
                    if (fileSize > MAX_FILE_SIZE) {
                        invalidFiles.push(`${file.name} (${formatFileSize(fileSize)})`);
                    } else {
                        validFiles.push({
                            id: Date.now().toString() + Math.random().toString(),
                            name: file.name,
                            uri: file.uri,
                            type: file.mimeType || 'application/pdf',
                            size: fileSize,
                            progress: 0,
                            status: 'pending' as const
                        });
                    }
                });

                // Show alert if any files are too large
                if (invalidFiles.length > 0) {
                    Alert.alert(
                        'File Too Large', 
                        `The following files exceed the 7MB limit and cannot be uploaded:\n\n${invalidFiles.join('\n')}\n\nPlease choose smaller files.`,
                        [{ text: 'OK' }]
                    );
                }

                // Add valid files
                if (validFiles.length > 0) {
                    setFiles(prevFiles => [...prevFiles, ...validFiles]);
                }
            }
        } catch (error) {
            console.error('Error picking file:', error);
            Alert.alert('Error', 'Failed to pick file. Please try again.');
        }
    }, [isUploading]);

    // Remove file from list
    const handleRemoveFile = useCallback((fileId: string) => {
        setFiles(prevFiles => prevFiles.filter(f => f.id !== fileId));
    }, []);

    // Retry failed upload
    const handleRetryUpload = (fileId: string) => {
        setFiles(prevFiles => prevFiles.map(f => 
            f.id === fileId ? { ...f, status: 'pending' as const, progress: 0 } : f
        ));
        // Trigger upload after state update
        setTimeout(() => uploadFile(fileId), 100);
    };

    // Upload individual file
    const uploadFile = async (fileId: string) => {
        setFiles(prevFiles => {
            const file = prevFiles.find(f => f.id === fileId);
            if (!file) return prevFiles;

            if (!selectedPI?.PI?.PINo) {
                Alert.alert('Error', 'Invoice number not found.');
                return prevFiles;
            }

            // Start upload process
            setTimeout(async () => {
                let progressInterval: number | null = null;
                try {
                    // Update status to uploading
                    setFiles(prev => prev.map(f => 
                        f.id === fileId ? { ...f, status: 'uploading' as const, progress: 0 } : f
                    ));

                    const formData = new FormData();
                    
                    // Append the file
                    formData.append('file', {
                        uri: file.uri,
                        name: file.name,
                        type: file.type
                    } as any);
                    
                    // Append additional data
                    formData.append('pdfName', file.name.replace(/\.[^/.]+$/, ''));
                    formData.append('PIId', selectedPI.PIId);
                    formData.append('PINo', selectedPI.PI.PINo);

                    // Simulate progress (since axios doesn't provide upload progress easily on React Native)
                    progressInterval = setInterval(() => {
                        setFiles(prev => prev.map(f => {
                            if (f.id === fileId && f.progress < 90) {
                                return { ...f, progress: f.progress + 10 };
                            }
                            return f;
                        }));
                    }, 200);

                    // Upload using axiosInstance
                    await axiosInstance.post('product/elisa/upload-pdf', formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    });

                    if (progressInterval) clearInterval(progressInterval);

                    // Update status to completed
                    setFiles(prev => prev.map(f => 
                        f.id === fileId ? { ...f, status: 'completed' as const, progress: 100 } : f
                    ));

                } catch (error: any) {
                    console.error('Upload error:', error);
                    if (progressInterval) clearInterval(progressInterval);
                    
                    // Show specific error message
                    let errorMessage = 'Upload failed. Please try again.';
                    if (error.response?.data?.message) {
                        errorMessage = error.response.data.message;
                    } else if (error.response?.status === 400) {
                        errorMessage = 'File too large or invalid format.';
                    }
                    
                    Alert.alert('Upload Error', errorMessage);
                    
                    // Update status to error
                    setFiles(prev => prev.map(f => 
                        f.id === fileId ? { ...f, status: 'error' as const } : f
                    ));
                }
            }, 100);

            return prevFiles;
        });
    };

    // Auto-upload when files are added (with pending status)
    useEffect(() => {
        const pendingFiles = files.filter(f => f.status === 'pending');
        if (pendingFiles.length > 0) {
            // Auto-trigger upload for new files
            pendingFiles.forEach(file => {
                uploadFile(file.id);
            });
        }
    }, [files.length]); // Only trigger when file count changes

    // Get progress bar color based on status and progress
    const getProgressColor = (status: string, progress: number) => {
        if (status === 'completed') return '#10b981'; // green
        if (status === 'error') return '#ef4444'; // red
        if (progress < 30) return '#22c55e'; // light green
        if (progress < 60) return '#eab308'; // yellow
        if (progress < 90) return '#f97316'; // orange
        return '#10b981'; // green
    };

    return (
        <ScrollView style={styles.scrollView}>
            <ThemedView style={styles.container}>
                {/* Invoice Display */}
                <ThemedView style={styles.invoiceSection}>
                    <ThemedText style={styles.invoiceText}>
                        Invoice: <ThemedText style={styles.invoiceNumber}>{selectedPI?.PI?.PINo || 'N/A'}</ThemedText>
                    </ThemedText>
                </ThemedView>

                {/* Upload Area */}
                <ThemedView style={styles.uploadContainer}>
                    <TouchableOpacity 
                        style={[styles.dropArea, isUploading && styles.dropAreaDisabled]}
                        onPress={handlePickFile}
                        activeOpacity={isUploading ? 1 : 0.7}
                        disabled={isUploading}
                    >
                        <Ionicons 
                            name={isUploading ? "cloud-upload" : "document-text-outline"} 
                            size={60} 
                            color={isUploading ? "#9ca3af" : "#60a5fa"} 
                        />
                        <ThemedText style={[styles.dropText, isUploading && styles.dropTextDisabled]}>
                            {isUploading ? 'Uploading files...' : 'Upload ELISA Test Report'}
                        </ThemedText>
                        <ThemedText style={styles.dropSubtext}>
                            {isUploading ? 'Please wait' : 'PDF files only (Max 7MB)'}
                        </ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.browserButton, isUploading && styles.browserButtonDisabled]}
                        onPress={handlePickFile}
                        disabled={isUploading}
                    >
                        <ThemedText style={styles.browserButtonText}>
                            {isUploading ? 'Uploading...' : 'Choose File'}
                        </ThemedText>
                    </TouchableOpacity>
                </ThemedView>

                {/* File List */}
                {files.length > 0 && (
                    <ThemedView style={styles.fileListContainer}>
                        {files.map((file) => (
                            <ThemedView key={file.id} style={styles.fileItem}>
                                <ThemedView style={styles.fileInfo}>
                                    <ThemedText style={styles.fileName}>{file.name}</ThemedText>
                                    
                                    {/* Progress Bar */}
                                    <ThemedView style={styles.progressBarContainer}>
                                        <ThemedView 
                                            style={[
                                                styles.progressBar,
                                                { 
                                                    width: `${file.progress}%`,
                                                    backgroundColor: getProgressColor(file.status, file.progress)
                                                }
                                            ]} 
                                        />
                                    </ThemedView>
                                    
                                    {file.status === 'completed' && (
                                        <ThemedText style={styles.progressText}>100%</ThemedText>
                                    )}
                                    {file.status === 'uploading' && (
                                        <ThemedText style={styles.progressText}>{file.progress}%</ThemedText>
                                    )}
                                    {file.status === 'error' && (
                                        <ThemedText style={styles.errorText}>Upload failed</ThemedText>
                                    )}
                </ThemedView>

                                <ThemedView style={styles.fileActions}>
                                    <TouchableOpacity 
                                        onPress={() => handleRemoveFile(file.id)}
                                        style={styles.actionButton}
                                    >
                                        <Ionicons name="close-circle-outline" size={24} color="#9ca3af" />
                                    </TouchableOpacity>
                                    
                                    {file.status === 'error' && (
                                        <TouchableOpacity 
                                            onPress={() => handleRetryUpload(file.id)}
                                            style={styles.actionButton}
                                        >
                                            <Ionicons name="refresh-circle-outline" size={24} color="#9ca3af" />
                                        </TouchableOpacity>
                                    )}
                </ThemedView>
                            </ThemedView>
                        ))}
                    </ThemedView>
                )}
            </ThemedView>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
        backgroundColor: '#f3f4f6',
    },
    container: {
        flex: 1,
        padding: 0,
    },
    invoiceSection: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 12,
    },
    invoiceText: {
        fontSize: 16,
        color: '#6b7280',
    },
    invoiceNumber: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
    },
    uploadContainer: {
        backgroundColor: '#ffffff',
        margin: 20,
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    dropArea: {
        width: '100%',
        height: 180,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: '#d1d5db',
        borderRadius: 12,
        backgroundColor: '#f9fafb',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    dropAreaDisabled: {
        backgroundColor: '#f3f4f6',
        borderColor: '#e5e7eb',
        opacity: 0.6,
    },
    dropText: {
        marginTop: 12,
        fontSize: 16,
        color: '#6b7280',
        fontWeight: '500',
    },
    dropTextDisabled: {
        color: '#9ca3af',
    },
    dropSubtext: {
        marginTop: 4,
        fontSize: 12,
        color: '#9ca3af',
    },
    browserButton: {
        backgroundColor: '#3b82f6',
        paddingHorizontal: 60,
        paddingVertical: 12,
        borderRadius: 25,
        shadowColor: '#3b82f6',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    browserButtonDisabled: {
        backgroundColor: '#9ca3af',
        opacity: 0.6,
    },
    browserButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    fileListContainer: {
        marginHorizontal: 20,
        marginBottom: 20,
    },
    fileItem: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    fileInfo: {
        flex: 1,
        marginRight: 12,
    },
    fileName: {
        fontSize: 14,
        color: '#1f2937',
        marginBottom: 8,
        fontWeight: '500',
    },
    progressBarContainer: {
        height: 6,
        backgroundColor: '#e5e7eb',
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: 6,
    },
    progressBar: {
        height: '100%',
        borderRadius: 3,
    },
    progressText: {
        fontSize: 12,
        color: '#6b7280',
        textAlign: 'right',
    },
    errorText: {
        fontSize: 12,
        color: '#ef4444',
        textAlign: 'right',
    },
    fileActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    actionButton: {
        padding: 4,
    },
});
