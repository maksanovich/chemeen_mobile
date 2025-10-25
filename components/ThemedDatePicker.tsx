import React, { useEffect, useState } from "react";
import { TouchableOpacity, StyleSheet, Text } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";

import { ThemedView } from "./ThemedView";
import { ThemedText } from "./ThemedText";

export function ThemedDatePicker(props: any) {
    const {
        label,
        require,
        name,
        error,
        selectedValue,
        handleChange,
        width,
        height,
        editable = true,
    } = props;

    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    useEffect(() => {
        if (selectedValue) {
            setSelectedDate(new Date(selectedValue));
        } else {
            setSelectedDate(null);
        }
    }, [selectedValue]);

    const showDatePicker = () => {
        setDatePickerVisibility(true);
    };

    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };

    const handleConfirm = (date: any) => {
        const formatted = formatDate(date);
        setSelectedDate(date);
        handleChange(name, formatted);
        hideDatePicker();
    };

    const formatDate = (date: Date) => {
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");
        const year = date.getFullYear();
        return `${year}-${month}-${day}`;
    };

    const formattedDate = selectedDate ? formatDate(selectedDate) : "Select Date";

    return (
        <ThemedView style={styles.container}>
            {label && (
                <ThemedText style={styles.label}>
                    {label}
                    {require && <ThemedText style={styles.asterisk}>*</ThemedText>}
                </ThemedText>
            )}
            <ThemedView>
                <TouchableOpacity
                    style={[
                        styles.button,
                        { height: height || 50, width: width || "100%" },
                        !editable && styles.disabledButton,
                    ]}
                    onPress={showDatePicker}
                    disabled={!editable}
                >
                    <Text style={styles.buttonText}>{formattedDate}</Text>
                </TouchableOpacity>
                <DateTimePickerModal
                    isVisible={isDatePickerVisible}
                    mode="date"
                    display="calendar"
                    date={selectedDate || new Date()}
                    onConfirm={handleConfirm}
                    onCancel={hideDatePicker}
                />
            </ThemedView>
            {error && <ThemedText style={styles.error}>{error}</ThemedText>}
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 5,
        marginBottom: 5
    },
    label: {
        marginBottom: 5,
        fontWeight: "bold",
    },
    button: {
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#007bff",
        borderRadius: 5,
        paddingHorizontal: 10,
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
    },
    disabledButton: {
        backgroundColor: "#ccc",
    },
    error: {
        color: "red",
        marginTop: 2,
    },
    asterisk: {
        color: "red",
    },
});
