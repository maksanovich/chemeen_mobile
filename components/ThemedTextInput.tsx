import {
    TextInput,
    StyleSheet,
    TextInputProps,
} from "react-native";
import { useThemeColor } from '@/hooks/useThemeColor';

import { ThemedView } from "./ThemedView";
import { ThemedText } from "./ThemedText";

export type ThemedTextInputProps = TextInputProps & {
    lightColor?: string;
    darkColor?: string;
};

export function ThemedMainTextInput({ style, lightColor, darkColor, ...otherProps }: ThemedTextInputProps) {
    const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');
    const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

    return <TextInput style={[{ backgroundColor, color }, style]} {...otherProps} />;
}

export function ThemedTextInput(props: any) {
    const {
        label = '',
        require,
        name,
        value,
        error,
        handleChange,
    } = props;

    return (
        <ThemedView style={styles.inputContainer}>
            <ThemedText style={styles.label}>
                {label}
                {
                    require && <ThemedText style={styles.asterisk}>*</ThemedText>
                }
            </ThemedText>
            <ThemedMainTextInput
                style={styles.input}
                value={value}
                onChangeText={(e) => handleChange(name, e)}
                placeholder={`Enter ${label}`}
            // keyboardType="numeric"
            // keyboardType="email-address" 
            />
            {error && <ThemedText style={styles.error}>{error}</ThemedText>}
        </ThemedView>
    )
}

const styles = StyleSheet.create({
    inputContainer: {
        marginBottom: 15,
    },
    label: {
        marginBottom: 5,
        fontWeight: 'bold',
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        paddingLeft: 8,
    },
    error: {
        color: 'red',
        marginTop: 2,
    },
    asterisk: {
        color: 'red',
    },
});