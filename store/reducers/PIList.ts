import { createSlice } from "@reduxjs/toolkit";

interface ItemInterface {
    _id: string;
}

interface PIListState {
    items: ItemInterface[];
}

const initialState: PIListState = {
    items: [],
};

const PIListSlice = createSlice({
    name: "PIList",
    initialState,
    reducers: {
        initialItem(state, action) {
            state.items = action.payload;
        },
        addItem(state, action) {
            state.items = [action.payload, ...state.items];
        },
        updateItem(state, action) {
            const { _id } = action.payload;
            const index = state.items.findIndex(e => e._id === _id);
            if (index !== -1) {
                state.items[index] = { ...state.items[index], ...action.payload };
            }
        },
        deleteItem(state, action) {
            state.items = state.items.filter(e => e._id != action.payload);
        },
    },
});

export default PIListSlice.reducer;

export const {
    initialItem,
    addItem,
    updateItem,
    deleteItem,
} = PIListSlice.actions;
