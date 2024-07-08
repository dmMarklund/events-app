import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the initial state using the types you defined
interface NavigationBarState {
  searchInput: string;
  selectedCity: string;
  searchQuery: string;
}

const initialState: NavigationBarState = {
  searchInput: "",
  selectedCity: "All",
  searchQuery: "",
};

const navigationBarSlice = createSlice({
  name: "navigationBar",
  initialState,
  reducers: {
    setSearchInput(state, action: PayloadAction<string>) {
      state.searchInput = action.payload;
    },
    setSelectedCity(state, action: PayloadAction<string>) {
      state.selectedCity = action.payload;
    },
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
  },
});

export const { setSearchInput, setSelectedCity, setSearchQuery } =
  navigationBarSlice.actions;
export default navigationBarSlice.reducer;
