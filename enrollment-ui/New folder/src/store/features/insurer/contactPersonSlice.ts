import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { ContactPerson, ContactPersonResponse } from "./contactPersonTypes";
import { createOrUpdateContactPersonAPI } from "./insurerAPI";

interface ContactPersonState {
  contactList: ContactPerson[];
  loading: boolean;
  totalRecords: number;
  error?: string;
}

const initialState: ContactPersonState = {
  contactList: [],
  loading: false,
  totalRecords: 0,
};

export interface FetchInsurersParams {
  query?: Record<string, any>; // ✔ Accepts object
}

export const fetchContactPersons = createAsyncThunk<
  ContactPersonResponse, // return type
  FetchInsurersParams | undefined // argument type (optional)
>("contactPerson/fetch", async (params) => {
  const res = await createOrUpdateContactPersonAPI(params);
  return res;
});
const contactPersonSlice = createSlice({
  name: "contactPerson",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchContactPersons.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        fetchContactPersons.fulfilled,
        (state, action: PayloadAction<ContactPersonResponse>) => {
          state.contactList = action?.payload?.data;
          state.totalRecords = action?.payload?.pagination?.totalRecords;
          state.loading = false;
        },
      )
      .addCase(fetchContactPersons.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default contactPersonSlice.reducer;
