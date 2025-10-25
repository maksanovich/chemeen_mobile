import React, { useState, useEffect } from 'react';
import { StyleSheet, Pressable, Alert, Modal, ScrollView, TouchableOpacity } from 'react-native';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedDatePicker } from '@/components/ThemedDatePicker';
import { ThemedPicker } from '@/components/ThemedPicker';

import { useDispatch, useSelector } from "@/store";
import { setSelectedPIItem } from '@/store/reducers/selectedPI';
import axiosInstance from '@/utils/axiosInstance';

interface Country {
    country: string;
}

interface FilterState {
    selectedCountry: string;
    startDate: string;
    endDate: string;
}

export default function FilterPI() {
    const dispatch = useDispatch();
    const selectedPI: any = useSelector((state) => state.selectedPI.data);

    const [countries, setCountries] = useState<Country[]>([]);
    const [countryOptions, setCountryOptions] = useState<any[]>([]);
    const [filters, setFilters] = useState<FilterState>({
        selectedCountry: '',
        startDate: '',
        endDate: ''
    });
    const [isFiltering, setIsFiltering] = useState(false);
    const [showCountryModal, setShowCountryModal] = useState(false);
    const [showDateModal, setShowDateModal] = useState(false);

    useEffect(() => {
        fetchCountries();
    }, []);

    const fetchCountries = async () => {
        try {
            const response = await axiosInstance.get('master/port?type=country');
            setCountries(response.data);

            const options = response.data.map((country: any) => ({
                label: country.country,
                value: country.country
            }));

            setCountryOptions(options);
        } catch (error) {
            console.error('Failed to fetch countries:', error);
        }
    };

    const handleCountryChange = (value: string) => {
        setFilters(prev => ({
            ...prev,
            selectedCountry: value
        }));
    };

    const applyFilters = async (filterParams: any) => {
        try {
            let response = await axiosInstance.post('product/PI/filter', filterParams);
            
            const result = {
                ...selectedPI,
                filteredPIList: response.data
            };
            
            dispatch(setSelectedPIItem(result));
        } catch (error) {
            console.error('Failed to apply filters:', error);
        }
    };

    const getSelectedCountryName = () => {
        if (!filters.selectedCountry) return 'All';
        const country = countries.find(c => c.country === filters.selectedCountry);
        return country ? country.country : 'All';
    };

    const getDateRangeText = () => {
        if (!filters.startDate && !filters.endDate) return 'All Dates';
        if (filters.startDate && filters.endDate) {
            return `${filters.startDate} - ${filters.endDate}`;
        }
        if (filters.startDate) return `From ${filters.startDate}`;
        if (filters.endDate) return `Until ${filters.endDate}`;
        return 'All Dates';
    };

    return (
        <ThemedView style={styles.container}>
            <Pressable
                style={styles.element}
                onPress={() => setShowCountryModal(true)}
            >
                <ThemedText style={styles.header}>Countries</ThemedText>
                <ThemedText style={styles.content}>{getSelectedCountryName()}</ThemedText>
            </Pressable>

            <Pressable
                style={styles.element}
                onPress={() => setShowDateModal(true)}
            >
                <ThemedText style={styles.header}>Date Range</ThemedText>
                <ThemedText style={styles.content}>{getDateRangeText()}</ThemedText>
            </Pressable>

            {/* Country Selection Modal */}
            <Modal
                visible={showCountryModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowCountryModal(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowCountryModal(false)}
                >
                    <TouchableOpacity
                        style={styles.modalContent}
                        activeOpacity={1}
                        onPress={(e) => e.stopPropagation()}
                    >
                        <ThemedText style={styles.modalTitle}>Select Country</ThemedText>
                        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={true}>
                            <TouchableOpacity
                                style={styles.modalItem}
                                onPress={() => {
                                    handleCountryChange('');

                                    // Build filter parameters and apply immediately
                                    const filterParams: any = {};

                                    if (filters.startDate) {
                                        filterParams.startDate = filters.startDate;
                                    }

                                    if (filters.endDate) {
                                        filterParams.endDate = filters.endDate;
                                    }

                                    applyFilters(filterParams);
                                    setShowCountryModal(false);
                                }}
                            >
                                <ThemedText style={styles.modalItemText}>All</ThemedText>
                            </TouchableOpacity>

                            {countries.map((country, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.modalItem}
                                    onPress={() => {
                                        handleCountryChange(country.country);

                                        // Build filter parameters and apply immediately
                                        const filterParams: any = {
                                            countryId: country.country
                                        };

                                        if (filters.startDate) {
                                            filterParams.startDate = filters.startDate;
                                        }

                                        if (filters.endDate) {
                                            filterParams.endDate = filters.endDate;
                                        }

                                        applyFilters(filterParams);
                                        setShowCountryModal(false);
                                    }}
                                >
                                    <ThemedText style={styles.modalItemText}>{country.country}</ThemedText>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>

            {/* Date Range Selection Modal */}
            <Modal
                visible={showDateModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowDateModal(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowDateModal(false)}
                >
                    <TouchableOpacity
                        style={styles.modalContent}
                        activeOpacity={1}
                        onPress={(e) => e.stopPropagation()}
                    >
                        <ThemedText style={styles.modalTitle}>Select Date Range</ThemedText>

                        <TouchableOpacity
                            style={styles.modalItem}
                            onPress={() => {
                                setFilters(prev => ({ ...prev, startDate: '', endDate: '' }));

                                // Apply filters immediately
                                const filterParams: any = {};

                                if (filters.selectedCountry) {
                                    filterParams.countryId = filters.selectedCountry;
                                }

                                applyFilters(filterParams);
                                setShowDateModal(false);
                            }}
                        >
                            <ThemedText style={styles.modalItemText}>All Dates</ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.modalItem}
                            onPress={() => {
                                const now = new Date();
                                const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
                                setFilters(prev => ({
                                    ...prev,
                                    startDate: sevenDaysAgo.toISOString().split('T')[0],
                                    endDate: now.toISOString().split('T')[0]
                                }));

                                // Apply filters immediately
                                const filterParams: any = {
                                    startDate: sevenDaysAgo.toISOString().split('T')[0],
                                    endDate: now.toISOString().split('T')[0]
                                };

                                if (filters.selectedCountry) {
                                    filterParams.countryId = filters.selectedCountry;
                                }

                                applyFilters(filterParams);
                                setShowDateModal(false);
                            }}
                        >
                            <ThemedText style={styles.modalItemText}>7 Days Ago</ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.modalItem}
                            onPress={() => {
                                const now = new Date();
                                const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
                                setFilters(prev => ({
                                    ...prev,
                                    startDate: thirtyDaysAgo.toISOString().split('T')[0],
                                    endDate: now.toISOString().split('T')[0]
                                }));

                                // Apply filters immediately
                                const filterParams: any = {
                                    startDate: thirtyDaysAgo.toISOString().split('T')[0],
                                    endDate: now.toISOString().split('T')[0]
                                };

                                if (filters.selectedCountry) {
                                    filterParams.countryId = filters.selectedCountry;
                                }

                                applyFilters(filterParams);
                                setShowDateModal(false);
                            }}
                        >
                            <ThemedText style={styles.modalItemText}>30 Days Ago</ThemedText>
                        </TouchableOpacity>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'stretch',
        elevation: 10,
        backgroundColor: '#f8f9fa',
        paddingVertical: 8,
        minHeight: 60,
    },
    element: {
        width: '50%',
        paddingVertical: 12,
        paddingHorizontal: 12,
        backgroundColor: '#e9ecef',
        borderRightColor: 'white',
        borderRightWidth: 1,
        borderRadius: 4,
        marginHorizontal: 2,
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 60,
    },
    header: {
        fontSize: 13,
        color: '#6c757d',
        marginBottom: 4,
        textAlign: 'center',
    },
    content: {
        fontSize: 16,
        fontWeight: '600',
        color: '#495057',
        textAlign: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        width: '80%',
        maxHeight: '70%',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 15,
        color: '#333',
    },
    scrollView: {
        maxHeight: 300,
    },
    modalItem: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    modalItemText: {
        fontSize: 16,
        color: '#333',
    },
    clearButton: {
        backgroundColor: '#dc3545',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 4,
        marginLeft: 8,
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 60,
    },
    clearButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
});

