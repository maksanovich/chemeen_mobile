import {
    StyleSheet,
} from "react-native";
import { Picker } from '@react-native-picker/picker';

import { ThemedView } from "./ThemedView";
import { ThemedText } from "./ThemedText";
import { IPicker } from "@/constants/Interfaces";

export function ThemedPicker(props: any) {
    const {
        items,
        label,
        require,
        name,
        selectedValue,
        error,
        handleChange,
        width,
        height,
        enable = true
    } = props;

    return (
        <ThemedView style={styles.container}>
            {
                label != '' &&
                <ThemedText style={styles.label}>
                    {label}
                    {
                        require && <ThemedText style={styles.asterisk}>*</ThemedText>
                    }
                </ThemedText>
            }
            <Picker
                selectedValue={selectedValue}
                onValueChange={(itemValue: any) => handleChange(name, itemValue)}
                style={[styles.picker, { width: width || '100%', height: height || 50 }]}
                enabled={enable}
            >
                <Picker.Item label={`Select ${label}`} value="" />
                {
                    items.map((item: IPicker, index: number) => (
                        <Picker.Item
                            label={item.label}
                            value={item.value}
                            key={index}
                        />
                    ))
                }
            </Picker>
            {error && <ThemedText style={styles.error}>{error}</ThemedText>}
        </ThemedView>
    )
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 5,
    },
    label: {
        marginBottom: 5,
        fontWeight: 'bold',
    },
    picker: {
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
    },
    error: {
        color: 'red',
        marginTop: 2,
    },
    asterisk: {
        color: 'red',
    },
});
