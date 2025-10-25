import { ALERT_TYPE, Dialog, Toast } from 'react-native-alert-notification';

/**
 * Professional Alert Helper
 * Provides aesthetic and user-friendly alert messages
 */

interface AlertButton {
    text: string;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
}

/**
 * Show a success dialog
 */
export const showSuccess = (
    title: string,
    message: string,
    onClose?: () => void
) => {
    Dialog.show({
        type: ALERT_TYPE.SUCCESS,
        title: title,
        textBody: message,
        button: 'OK',
        onPressButton: () => {
            Dialog.hide();
            if (onClose) onClose();
        },
        autoClose: 3000,
    });
};

/**
 * Show a warning dialog
 */
export const showWarning = (
    title: string,
    message: string,
    onClose?: () => void
) => {
    Dialog.show({
        type: ALERT_TYPE.WARNING,
        title: title,
        textBody: message,
        button: 'OK',
        onPressButton: () => {
            Dialog.hide();
            if (onClose) onClose();
        },
    });
};

/**
 * Show an error dialog
 */
export const showError = (
    title: string,
    message: string,
    onClose?: () => void
) => {
    Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: title,
        textBody: message,
        button: 'OK',
        onPressButton: () => {
            Dialog.hide();
            if (onClose) onClose();
        },
    });
};

/**
 * Show a confirmation dialog with custom buttons
 */
export const showConfirmation = (
    title: string,
    message: string,
    buttons: AlertButton[]
) => {
    if (buttons.length === 0) {
        buttons = [{ text: 'OK' }];
    }

    const primaryButton = buttons.find(b => b.style !== 'cancel') || buttons[0];
    const cancelButton = buttons.find(b => b.style === 'cancel');

    Dialog.show({
        type: ALERT_TYPE.WARNING,
        title: title,
        textBody: message,
        button: primaryButton.text,
        onPressButton: () => {
            Dialog.hide();
            if (primaryButton.onPress) primaryButton.onPress();
        },
        ...(cancelButton && {
            closeOnOverlayTap: true,
            onHide: () => {
                if (cancelButton.onPress) cancelButton.onPress();
            }
        })
    });
};

/**
 * Show a validation error with details
 */
export const showValidationError = (
    fieldName: string,
    issue: string,
    details?: string
) => {
    const message = details 
        ? `${issue}\n\n${details}`
        : issue;

    Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: `⚠️ Invalid ${fieldName}`,
        textBody: message,
        button: 'Fix It',
        onPressButton: () => {
            Dialog.hide();
        },
    });
};

/**
 * Show a balance error (specific for TraceAbility)
 */
export const showBalanceError = (
    currentValue: number,
    maxValue: number,
    itemName?: string
) => {
    const title = '🚫 Balance Cannot Be Negative';
    const message = itemName
        ? `${itemName}\n\nYou entered: ${currentValue}\nMaximum allowed: ${maxValue}\n\n💡 The value has been capped at ${maxValue} to maintain a valid balance.`
        : `You entered: ${currentValue}\nMaximum allowed: ${maxValue}\n\n💡 The value has been capped at ${maxValue} to maintain a valid balance.`;

    Dialog.show({
        type: ALERT_TYPE.WARNING,
        title: title,
        textBody: message,
        button: 'Got It',
        onPressButton: () => {
            Dialog.hide();
        },
    });
};

/**
 * Show allocation error (for CodeList)
 */
export const showAllocationError = (
    attempting: number,
    available: number,
    total: number,
    allocated: number
) => {
    Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: '📦 Insufficient Balance',
        textBody: `Cannot allocate ${attempting} cartons.\n\n` +
            `📊 Total Cartons: ${total}\n` +
            `✅ Already Allocated: ${allocated}\n` +
            `💚 Available Balance: ${available}\n\n` +
            `Please reduce your allocation to ${available} or less.`,
        button: 'Adjust Amount',
        onPressButton: () => {
            Dialog.hide();
        },
    });
};

/**
 * Show a success toast (non-blocking)
 */
export const showSuccessToast = (message: string) => {
    Toast.show({
        type: ALERT_TYPE.SUCCESS,
        title: '✓ Success',
        textBody: message,
        autoClose: 2500,
    });
};

/**
 * Show an info toast (non-blocking)
 */
export const showInfoToast = (title: string, message: string) => {
    Toast.show({
        type: ALERT_TYPE.SUCCESS,
        title: title,
        textBody: message,
        autoClose: 2500,
    });
};

/**
 * Show an error toast (non-blocking)
 */
export const showErrorToast = (message: string) => {
    Toast.show({
        type: ALERT_TYPE.DANGER,
        title: '✗ Error',
        textBody: message,
        autoClose: 3000,
    });
};

/**
 * Show save validation errors
 */
export const showSaveValidationError = (
    errors: string[],
    onClose?: () => void
) => {
    const errorList = errors.map((err, idx) => `${idx + 1}. ${err}`).join('\n\n');
    
    Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: '❌ Cannot Save',
        textBody: `Please fix the following issues:\n\n${errorList}`,
        button: 'Fix Issues',
        onPressButton: () => {
            Dialog.hide();
            if (onClose) onClose();
        },
    });
};

