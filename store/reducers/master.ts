import { createSlice } from "@reduxjs/toolkit";

// import { ICompany } from "@/constants/Interfaces";

// interface ICompanyWithId extends ICompany {
//     _id: string;
// }

interface ItemInterface {
    _id: string;
}

interface MasterState {
    items: ItemInterface[];
}

const initialState: MasterState = {
    items: [],
};

const masterSlice = createSlice({
    name: "master",
    initialState,
    reducers: {
        loadItem(state, action) {
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

export default masterSlice.reducer;

export const {
    loadItem,
    addItem,
    updateItem,
    deleteItem,
} = masterSlice.actions;
