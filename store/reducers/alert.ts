import { createSlice } from "@reduxjs/toolkit";

interface AlertState {
    kind: number, // 1: dialog, 2: toast/notification
    type: number, // 0: Success, 1: Warning, 2: Danger
    title: string,
    message: string,
    url: string
}

const initialState: AlertState = {
    kind: -1,
    type: 0,
    title: '',
    message: '',
    url: ''
};

const alertSlice = createSlice({
    name: "alert",
    initialState,
    reducers: {
        setAlert(state, action) {
            state.kind = action.payload.kind;
            state.type = action.payload.type;
            state.title = action.payload.title || '';
            state.message = action.payload.message || '';
            state.url = action.payload.url || '';
        },
        resetAlert(state, action) {
            state.kind = 0;
            state.title = '';
            state.message = '';
        },
        defaultAlert(state, action) {
            state.kind = -1;
            state.title = '';
            state.message = '';
        }
    },
});

export default alertSlice.reducer;

export const {
    setAlert,
    resetAlert,
    defaultAlert
} = alertSlice.actions;
