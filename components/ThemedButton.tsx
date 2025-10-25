import {
    StyleSheet,
    TouchableOpacity
} from "react-native";
import { ThemedText } from "./ThemedText";
import { Ionicons } from '@expo/vector-icons';

export function ThemedButton(props: any) {
    const {
        text,
        fullWidth = false,
        onPressEvent,
        icon, 
        style
    } = props;

    return (
        <TouchableOpacity
            style={[styles.button, fullWidth && styles.fullWidth, style]} 
            onPress={onPressEvent}
        >
            {icon ? <Ionicons name={icon} size={24} color="#fff" /> : <ThemedText style={styles.buttonText}>{text}</ThemedText>}
            {/* <ThemedText style={styles.buttonText}>{text}</ThemedText> */}
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#6235b6',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 5,
        marginBottom: 5,
        width: 100,
        height: 45
    },
    fullWidth: {
        width: '100%',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});