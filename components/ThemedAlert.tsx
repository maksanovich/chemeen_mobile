import React, { useEffect } from 'react';

import {
    ALERT_TYPE,
    Dialog,
    AlertNotificationRoot,
    Toast
} from 'react-native-alert-notification';

import { useDispatch, useSelector } from '@/store';
import { resetAlert } from '@/store/reducers/alert';
import { ThemedView } from './ThemedView';

const CUSTOM_ALERT_TYPE = [
    ALERT_TYPE.SUCCESS,
    ALERT_TYPE.WARNING,
    ALERT_TYPE.DANGER,
]

type Props = {
    children: React.ReactNode;
};

export default function ThemedAlert({ children }: Props) {
    const dispatch = useDispatch();
    const alert = useSelector((state) => state.alert);

    useEffect(() => {
        showAlert();
    }, [alert])

    const showAlert = () => {
        switch (alert.kind) {
            case 1:
                showDialog();
                break;
            case 2:
                showToast();
                break;
            default:
                break;
        }
    }

    const showDialog = () => {
        Dialog.show({
            type: CUSTOM_ALERT_TYPE[alert.type],
            title: alert.title || 'Notification',
            textBody: alert.message || 'No message provided',
            button: 'OK',
            onPressButton: () => {
                Dialog.hide();
                dispatch(resetAlert({}));
            }
        })
    }

    const showToast = () => {
        Toast.show({
            type: CUSTOM_ALERT_TYPE[alert.type],
            title: alert.title || 'Notification',
            textBody: alert.message || 'No message provided',
            autoClose: 2500
        })
    }

    return (
        <AlertNotificationRoot>
            <ThemedView style={{ width: '100%', height: '100%' }}>
                {children}
            </ThemedView>
        </AlertNotificationRoot>
    )
}
