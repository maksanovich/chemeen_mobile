import { ALERT_TYPE, Dialog, Toast } from 'react-native-alert-notification';

/**
 * Unified Alert Helper
 * Provides consistent, professional, and user-friendly alert messages
 * 
 * Message Categories:
 * - SUCCESS: Positive actions completed successfully
 * - INFO: General information and neutral messages
 * - WARNING: Cautionary messages requiring attention
 * - ERROR: Critical errors that prevent action
 * - CONFIRM: User confirmation dialogs
 */

interface AlertButton {
    text: string;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
}

// ============================================================================
// SUCCESS MESSAGES
// ============================================================================

/**
 * Show a success dialog for completed actions
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
 * Show a success toast for non-blocking notifications
 */
export const showSuccessToast = (message: string) => {
    Toast.show({
        type: ALERT_TYPE.SUCCESS,
        title: 'Success',
        textBody: message,
        autoClose: 2500,
    });
};

// ============================================================================
// INFO MESSAGES
// ============================================================================

/**
 * Show an informational dialog
 */
export const showInfo = (
    title: string,
    message: string,
    onClose?: () => void
) => {
    Dialog.show({
        type: ALERT_TYPE.SUCCESS, // Clean appearance for info
        title: title,
        textBody: message,
        button: 'OK',
        onPressButton: () => {
            Dialog.hide();
            if (onClose) onClose();
        },
        closeOnOverlayTap: true,
        autoClose: false,
    });
};

/**
 * Show an info toast for non-blocking notifications
 */
export const showInfoToast = (title: string, message: string) => {
    Toast.show({
        type: ALERT_TYPE.SUCCESS,
        title: title,
        textBody: message,
        autoClose: 2500,
    });
};

// ============================================================================
// WARNING MESSAGES
// ============================================================================

/**
 * Show a warning dialog for cautionary messages
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
        closeOnOverlayTap: true,
        autoClose: false,
    });
};

/**
 * Show a warning toast for non-blocking warnings
 */
export const showWarningToast = (message: string) => {
    Toast.show({
        type: ALERT_TYPE.WARNING,
        title: 'Warning',
        textBody: message,
        autoClose: 3000,
    });
};

// ============================================================================
// ERROR MESSAGES
// ============================================================================

/**
 * Show an error dialog for critical errors
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
        closeOnOverlayTap: true,
        autoClose: false,
    });
};

/**
 * Show an error toast for non-blocking errors
 */
export const showErrorToast = (message: string) => {
    Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Error',
        textBody: message,
        autoClose: 3000,
    });
};

// ============================================================================
// CONFIRMATION MESSAGES
// ============================================================================

/**
 * Show an action menu with multiple buttons
 */
export const showActionMenu = (
    title: string,
    message: string,
    buttons: AlertButton[]
) => {
    if (buttons.length === 0) {
        buttons = [{ text: 'OK' }];
    }

    // For action menus, we'll show the first non-cancel button as primary
    // and handle others through a custom implementation
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
        type: ALERT_TYPE.WARNING, // Warning type for confirmations
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

// ============================================================================
// SPECIALIZED VALIDATION MESSAGES
// ============================================================================

/**
 * Show validation errors with clear formatting
 */
export const showValidationError = (
    title: string,
    errors: string[],
    onClose?: () => void
) => {
    const errorList = errors.map((err, idx) => `${idx + 1}. ${err}`).join('\n\n');
    
    Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: title,
        textBody: `Please fix the following issues:\n\n${errorList}`,
        button: 'Fix Issues',
        onPressButton: () => {
            Dialog.hide();
            if (onClose) onClose();
        },
    });
};

/**
 * Show missing required fields error
 */
export const showMissingFieldsError = (
    title: string,
    missingFields: string[],
    onClose?: () => void
) => {
    Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: title,
        textBody: `Please fill in the following fields:\n\n${missingFields.join('\n')}`,
        button: 'OK',
        onPressButton: () => {
            Dialog.hide();
            if (onClose) onClose();
        },
    });
};

/**
 * Show carton count mismatch warning
 */
export const showCartonMismatchWarning = (
    mismatches: string[],
    onFixCodeList?: () => void
) => {
    Dialog.show({
        type: ALERT_TYPE.WARNING,
        title: 'Carton Count Mismatch',
        textBody: `Found ${mismatches.length} product${mismatches.length > 1 ? 's' : ''} with incorrect carton counts:\n\n${mismatches.join('\n\n')}\n\nPlease fix the Code List before continuing.`,
        button: 'OK',
        onPressButton: () => {
            Dialog.hide();
            if (onFixCodeList) onFixCodeList();
        },
        closeOnOverlayTap: true,
        onHide: () => {
            // Allow user to dismiss without fixing
        }
    });
};

/**
 * Show balance error with clear explanation
 */
export const showBalanceError = (
    currentValue: number,
    maxValue: number,
    itemName?: string
) => {
    const title = 'Balance Error';
    const message = itemName
        ? `${itemName}\n\nYou entered: ${currentValue}\nMaximum allowed: ${maxValue}\n\nThe value has been adjusted to ${maxValue} to maintain a valid balance.`
        : `You entered: ${currentValue}\nMaximum allowed: ${maxValue}\n\nThe value has been adjusted to ${maxValue} to maintain a valid balance.`;

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
 * Show allocation error with clear details
 */
export const showAllocationError = (
    attempting: number,
    available: number,
    total: number,
    allocated: number
) => {
    Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'Insufficient Balance',
        textBody: `Cannot allocate ${attempting} cartons.\n\n` +
            `Total Cartons: ${total}\n` +
            `Already Allocated: ${allocated}\n` +
            `Available Balance: ${available}\n\n` +
            `Please reduce your allocation to ${available} or less.`,
        button: 'Adjust Amount',
        onPressButton: () => {
            Dialog.hide();
        },
    });
};

/**
 * Show date validation error with details
 */
export const showDateValidationError = (
    title: string,
    message: string,
    details?: {
        analysisDate?: string;
        completionDate?: string;
        gap?: string;
        maxAllowed?: string;
    }
) => {
    let fullMessage = message;
    
    if (details) {
        fullMessage += '\n\n';
        if (details.analysisDate) {
            fullMessage += `Analysis Date: ${details.analysisDate}\n`;
        }
        if (details.completionDate) {
            fullMessage += `Completion Date: ${details.completionDate}\n`;
        }
        if (details.gap) {
            fullMessage += `Gap: ${details.gap}\n`;
        }
        if (details.maxAllowed) {
            fullMessage += `Maximum Allowed: ${details.maxAllowed}`;
        }
    }

    Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: title,
        textBody: fullMessage,
        button: 'OK',
        onPressButton: () => {
            Dialog.hide();
        },
        closeOnOverlayTap: true,
        autoClose: false,
    });
};

// ============================================================================
// SIMPLE ALERTS (for backward compatibility)
// ============================================================================

/**
 * Show a simple alert dialog (backward compatibility)
 */
export const showSimpleAlert = (
    title: string,
    message: string,
    onClose?: () => void
) => {
    showInfo(title, message, onClose);
};

/**
 * Show a simple alert with multiple buttons (backward compatibility)
 */
export const showSimpleAlertWithButtons = (
    title: string,
    message: string,
    buttons: Array<{
        text: string;
        onPress?: () => void;
        style?: 'default' | 'cancel' | 'destructive';
    }>
) => {
    showConfirmation(title, message, buttons);
};

// ============================================================================
// LEGACY FUNCTIONS (for backward compatibility)
// ============================================================================

/**
 * @deprecated Use showValidationError instead
 */
export const showSaveValidationError = showValidationError;

/**
 * @deprecated Use showCartonMismatchWarning instead
 */
export const showCartonCountMismatch = showCartonMismatchWarning;

