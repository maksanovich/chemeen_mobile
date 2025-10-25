import { createSlice } from "@reduxjs/toolkit";

const initialState: any = {
    data: {
        PIId: 0,
        PI: {},
        item: [],
        itemDetail: [],
        codeList: [],
        traceAbility: [],
        BAR: [],
        elisa: {},
        elisaDetail: [],
    }
};

const SelectedPISlice = createSlice({
    name: "SelectedPI",
    initialState,
    reducers: {
        initialSelectedPIItem(state, action) {
            state.data = initialState.data
        },
        setSelectedPIItem(state, action) {
            const newData = action.payload;
            state.data = {
                ...state.data,
                ...newData,
            };
        },
        updateSelectedPIItem(state, action) {
            const { key, data } = action.payload;
            if (Array.isArray(state.data[key])) {
                state.data[key] = [...state.data[key], data];
            } else {
                state.data[key] = data;
            }
        }

    },
});

export default SelectedPISlice.reducer;

export const {
    initialSelectedPIItem,
    setSelectedPIItem,
    updateSelectedPIItem,
} = SelectedPISlice.actions;
