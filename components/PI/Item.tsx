    import React, { useState } from 'react';
    import { StyleSheet, Image, TouchableOpacity, ActivityIndicator, Modal, View, FlatList } from 'react-native';
    import { useRouter } from 'expo-router';
    import * as FileSystem from 'expo-file-system';
    import * as Sharing from "expo-sharing";

    import { ThemedView } from '@/components/ThemedView';
    import { ThemedText } from '@/components/ThemedText';
    import { TabBarIcon } from '@/components/ThemedIcon';

    import { IPIItem } from '@/constants/Interfaces';

    import axiosInstance from '@/utils/axiosInstance';
    import { showError, showSuccessToast, showInfo, showConfirmation } from '@/utils/alertHelper';

    import { useDispatch } from '@/store';
    import { setSelectedPIItem } from '@/store/reducers/selectedPI';

    interface PIItemProps {
        item: IPIItem;
    }

    const PIItem: React.FC<PIItemProps> = ({ item }) => {
        const router = useRouter();
        const dispatch = useDispatch();
        const [showModal, setShowModal] = useState(false);
        const [downloadingItems, setDownloadingItems] = useState<Set<string>>(new Set());
        const [latestElisaPdfId, setLatestElisaPdfId] = useState<number | null>(null);
        const [elisaPdfChecked, setElisaPdfChecked] = useState(false);

        const onPress = async () => {
            const results = await getProductData(item.PIId);
            dispatch(setSelectedPIItem(results));
            router.navigate('/product');
        }

        const pdfOptions = [
            // { key: 'all', title: 'All PDFs', endpoint: 'export' },
            { key: 'pi', title: 'Invoice', endpoint: 'export/pi' },
            { key: 'codelist', title: 'Code List', endpoint: 'export/codelist' },
            { key: 'traceability', title: 'Traceability', endpoint: 'export/traceability' },
            { key: 'bar', title: 'BAR', endpoint: 'export/bar' },
            // { key: 'elisa', title: 'Elisa', endpoint: 'export/elisa' }
        ];

        const downloadSinglePDF = async (option: any) => {
            setDownloadingItems(prev => new Set(prev).add(option.key));
            
            // Determine the endpoint based on PDF type
            let endpoint;
            if (option.key === 'elisa') {
                if (!latestElisaPdfId) {
                    showError("No PDF", "No Elisa PDF report available for this PI.");
                    setDownloadingItems(prev => {
                        const newSet = new Set(prev);
                        newSet.delete(option.key);
                        return newSet;
                    });
                    return;
                }
                endpoint = `product/elisaPDF/${latestElisaPdfId}/download`;
            } else {
                endpoint = `product/PI/${option.endpoint}/${item.PIId}`;
            }
            
            try {
                console.log(`Starting ${option.title} download...`);
                console.log('Endpoint:', endpoint);
                
                const response = await axiosInstance.get(endpoint, {
                    responseType: 'arraybuffer'
                });
                const uint8Array = new Uint8Array(response.data);
                const base64String = btoa(String.fromCharCode(...uint8Array));

                const fileName = `PI-${item.No}-${option.key}.pdf`;
                const fileUri = FileSystem.cacheDirectory + fileName;

                await FileSystem.writeAsStringAsync(fileUri, base64String, {
                    encoding: FileSystem.EncodingType.Base64,
                });

                const fileInfo: any = await FileSystem.getInfoAsync(fileUri);
                console.log(`${option.title} PDF saved:`, {
                    exists: fileInfo.exists,
                    size: fileInfo.size,
                    uri: fileInfo.uri
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
            } catch (err: any) {
                console.error(`${option.title} download failed:`, err);
                console.error('Error details:', {
                    status: err.response?.status,
                    message: err.response?.data?.message,
                    endpoint: endpoint
                });
                
                const errorMsg = err.response?.status === 404 
                    ? `No ${option.title} PDF found for this PI`
                    : `Failed to download ${option.title} PDF`;
                showError("Error", errorMsg);
            } finally {
                setDownloadingItems(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(option.key);
                    return newSet;
                });
            }
        }

        const downloadAllPDFs = async () => {
            setDownloadingItems(prev => new Set(prev).add('all'));
            try {
                console.log('Starting All PDFs download...');
                const response = await axiosInstance.get(`product/PI/export/${item.PIId}`);

                if (response.data.success && response.data.data) {
                    const { pi, codeList, traceability, bar } = response.data.data;

                    const pdfFiles = [
                        { name: 'pi', data: pi, title: 'Invoice' },
                        { name: 'codelist', data: codeList, title: 'Code List' },
                        { name: 'traceability', data: traceability, title: 'Traceability' },
                        { name: 'bar', data: bar, title: 'BAR' }
                    ];

                    // Download generated PDFs
                    const downloadedFiles: string[] = [];
                    for (const pdfFile of pdfFiles) {
                        if (pdfFile.data) {
                            const fileName = `PI-${item.No}-${pdfFile.name}.pdf`;
                            const fileUri = FileSystem.cacheDirectory + fileName;

                            await FileSystem.writeAsStringAsync(fileUri, pdfFile.data, {
                                encoding: FileSystem.EncodingType.Base64,
                            });

                            const fileInfo: any = await FileSystem.getInfoAsync(fileUri);
                            console.log(`${pdfFile.title} PDF saved:`, {
                                exists: fileInfo.exists,
                                size: fileInfo.size,
                                uri: fileInfo.uri
                            });
                            
                            downloadedFiles.push(fileUri);
                        }
                    }

                    // Download Elisa PDF separately (it's an uploaded file)
                    if (latestElisaPdfId) {
                        try {
                            const elisaResponse = await axiosInstance.get(`product/elisaPDF/${latestElisaPdfId}/download`, {
                                responseType: 'arraybuffer'
                            });
                            
                            const uint8Array = new Uint8Array(elisaResponse.data);
                            const base64String = btoa(String.fromCharCode(...uint8Array));
                            
                            const fileName = `PI-${item.No}-elisa.pdf`;
                            const fileUri = FileSystem.cacheDirectory + fileName;

                            await FileSystem.writeAsStringAsync(fileUri, base64String, {
                                encoding: FileSystem.EncodingType.Base64,
                            });

                            const fileInfo: any = await FileSystem.getInfoAsync(fileUri);
                            console.log('Elisa PDF saved:', {
                                exists: fileInfo.exists,
                                size: fileInfo.size,
                                uri: fileInfo.uri
                            });
                            
                            downloadedFiles.push(fileUri);
                        } catch (elisaErr) {
                            console.log('Elisa PDF download skipped:', elisaErr);
                            // Don't fail the whole download if elisa is missing
                        }
                    } else {
                        console.log('No Elisa PDF available, skipping...');
                    }

                    // Show success message and ask user if they want to share all files
                    showSuccessToast(`${downloadedFiles.length} PDF files have been downloaded successfully!`);
                    
                    // Ask user if they want to share all files at once
                    if (downloadedFiles.length > 0 && await Sharing.isAvailableAsync()) {
                        showConfirmation(
                            'Share All PDFs',
                            `All ${downloadedFiles.length} PDF files have been downloaded. Would you like to share them now?\n\nNote: You'll be prompted to save each file individually.`,
                            [
                                {
                                    text: 'Cancel',
                                    style: 'cancel'
                                },
                                {
                                    text: 'Share All',
                                    onPress: async () => {
                                        // Share all files in sequence
                                        for (let i = 0; i < downloadedFiles.length; i++) {
                                            const fileName = downloadedFiles[i].split('/').pop() || `PDF-${i + 1}`;
                                            await Sharing.shareAsync(downloadedFiles[i], {
                                                mimeType: "application/pdf",
                                                dialogTitle: `Save ${fileName}`,
                                                UTI: "com.adobe.pdf",
                                            });
                                            
                                            // Small delay between shares to prevent overwhelming the user
                                            if (i < downloadedFiles.length - 1) {
                                                await new Promise(resolve => setTimeout(resolve, 500));
                                            }
                                        }
                                    }
                                }
                            ]
                        );
                    }
                } else {
                    throw new Error('Invalid response format');
                }
            } catch (err) {
                console.error('All PDFs download failed:', err);
                showError("Error", "Failed to download all PDFs");
            } finally {
                setDownloadingItems(prev => {
                    const newSet = new Set(prev);
                    newSet.delete('all');
                    return newSet;
                });
            }
        }

        const fetchLatestElisaPDF = async () => {
            try {
                const response = await axiosInstance.get(`product/elisaPDF/by-pi/${item.PIId}`);
                const elisaPDFs = response.data;
                if (elisaPDFs && elisaPDFs.length > 0) {
                    // Get the latest one (first in array, sorted by uploadDate DESC)
                    setLatestElisaPdfId(elisaPDFs[0].pdfId);
                } else {
                    setLatestElisaPdfId(null);
                }
                setElisaPdfChecked(true);
            } catch (err) {
                console.error('Failed to fetch latest Elisa PDF:', err);
                setLatestElisaPdfId(null);
                setElisaPdfChecked(true);
            }
        };

        const handleDownloadPress = () => {
            setShowModal(true);
            setElisaPdfChecked(false);
            setLatestElisaPdfId(null);
            fetchLatestElisaPDF();
        }

        const renderPDFOption = ({ item: option }: { item: any }) => {
            const isDownloading = downloadingItems.has(option.key);
            
            // Check if Elisa option and if we need to show loading/disabled state
            const isElisaOption = option.key === 'elisa';
            const isElisaChecking = isElisaOption && !elisaPdfChecked;
            const isElisaDisabled = isElisaOption && elisaPdfChecked && !latestElisaPdfId;

            const handlePress = () => {
                if (option.key === 'all') {
                    downloadAllPDFs();
                } else {
                    downloadSinglePDF(option);
                }
            };

            return (
                <TouchableOpacity
                    style={[
                        styles.pdfOption,
                        isElisaDisabled && styles.pdfOptionDisabled
                    ]}
                    onPress={handlePress}
                    disabled={isDownloading || isElisaChecking || isElisaDisabled}
                >
                    <ThemedText style={[
                        styles.pdfOptionText,
                        isElisaDisabled && styles.pdfOptionTextDisabled
                    ]}>
                        {option.title}
                        {isElisaDisabled && ' (Not Available)'}
                    </ThemedText>
                    {isDownloading || isElisaChecking ? (
                        <ActivityIndicator size="small" color="grey" />
                    ) : (
                        <TabBarIcon 
                            name={'download'} 
                            color={isElisaDisabled ? '#ccc' : 'grey'} 
                        />
                    )}
                </TouchableOpacity>
            );
        }

        const getProductData = async (id: string) => {
            let result: any = {};
            result.PIId = id;
            try {
                let response = await axiosInstance.get('product/PI/' + id);
                result.PI = response.data;

                response = await axiosInstance.get('product/item/' + id);
                result.item = response.data;

                response = await axiosInstance.get('product/itemDetail/filter/' + id);
                result.itemDetail = response.data;

                response = await axiosInstance.get('product/codeList/' + id);
                result.codeList = response.data;

                response = await axiosInstance.get('product/traceAbility/' + id);
                result.traceAbility = response.data;

                response = await axiosInstance.get('product/bar/' + id);
                result.BAR = response.data;

                response = await axiosInstance.get('product/elisa/' + id);
                result.elisa = response.data;

                response = await axiosInstance.get('product/elisaDetail/' + id);
                result.elisaDetail = response.data;
            } catch (error) {
                console.log(error);
            }

            return result;
        }

        return (
            <TouchableOpacity onPress={onPress}>
                <ThemedView style={styles.container}>
                    <ThemedView style={styles.img}>
                        <Image
                            source={require('../../assets/images/favicon.png')}
                            style={styles.image}
                        />
                    </ThemedView>
                    <ThemedView style={styles.content}>
                        <ThemedText style={styles.header}>PI No - {item.No}/{item.PIDate}</ThemedText>
                        <ThemedText style={styles.country}>{item.country} : {item.consigneeName}</ThemedText>
                        <ThemedText style={styles.date}>{item.shipDate}</ThemedText>
                    </ThemedView>
                    <ThemedView style={styles.absoluteView}>
                        <TouchableOpacity onPress={handleDownloadPress}>
                            <TabBarIcon name={'print'} color={'grey'} />
                        </TouchableOpacity>
                    </ThemedView>

                    <Modal
                        visible={showModal}
                        transparent={true}
                        animationType="slide"
                        onRequestClose={() => setShowModal(false)}
                    >
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContent}>
                                <View style={styles.modalHeader}>
                                    <ThemedText style={styles.modalTitle}>Download PDFs</ThemedText>
                                    <TouchableOpacity onPress={() => setShowModal(false)}>
                                        <TabBarIcon name={'close'} color={'grey'} />
                                    </TouchableOpacity>
                                </View>

                                <FlatList
                                    data={pdfOptions}
                                    renderItem={renderPDFOption}
                                    keyExtractor={(item) => item.key}
                                    style={styles.pdfList}
                                />
                            </View>
                        </View>
                    </Modal>
                </ThemedView>
            </TouchableOpacity>
        );
    }

    const styles = StyleSheet.create({
        container: {
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            elevation: 5,
            paddingVertical: 15,
            marginBottom: 5
        },
        img: {
            width: '15%',
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        image: {
            width: 35,
            height: 35
        },
        content: {
            width: '85%',
        },
        header: {
            fontSize: 14,
            fontWeight: 500
        },
        country: {
            fontSize: 15,
            fontWeight: 900
        },
        date: {
            fontSize: 14,
            color: 'grey'
        },
        absoluteView: {
            position: 'absolute',
            bottom: 20,
            right: 30,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 15
        },
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center'
        },
        modalContent: {
            backgroundColor: 'white',
            borderRadius: 10,
            padding: 20,
            width: '80%',
            maxHeight: '70%'
        },
        modalHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
            paddingBottom: 10,
            borderBottomWidth: 1,
            borderBottomColor: '#e0e0e0'
        },
        modalTitle: {
            fontSize: 18,
            fontWeight: 'bold'
        },
        pdfList: {
            maxHeight: 300
        },
        pdfOption: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 15,
            paddingHorizontal: 10,
            borderBottomWidth: 1,
            borderBottomColor: '#f0f0f0'
        },
        pdfOptionText: {
            fontSize: 16,
            fontWeight: '500'
        },
        pdfOptionDisabled: {
            opacity: 0.5
        },
        pdfOptionTextDisabled: {
            color: '#999'
        }
    });

    export default PIItem

