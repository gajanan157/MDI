import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { CtcRecordMis } from "./matrixTypes";
import { fetchEscalationMatrixAPI, fetchEscalationMatrixForDepertmentAPI } from "./matrixApi";
import type { RootState } from "@/store/store";

interface EscalationMatrixState {
    matrix: CtcRecordMis[];
    depertment: CtcRecordMis[];
    loading: boolean;
    error: string | null;
}

const initialState: EscalationMatrixState = {
    matrix: [],
    depertment: [],
    loading: false,
    error: null,
};

export const fetchEscalationMatrix = createAsyncThunk(
    "tpa/fetchEscalationMatrix",
    async (payload?: Record<string, any>) => {
        const finalPayload = {
      page: payload?.page ?? 1,
      size: payload?.size ?? 20,
      ...payload,
    };
        const response = await fetchEscalationMatrixAPI(finalPayload);
        return response;
    },
);
export const fetchEscalationMatrixdepartment = createAsyncThunk(
    "tpa/fetchEscalationMatrixdepartment",
    async () => {
        const response = await fetchEscalationMatrixForDepertmentAPI();
        return response;
    },
    {
        condition: (_, { getState }) => {
            const { matrix } = getState() as RootState;
            if ((matrix.depertment?.length ?? 0) > 0) return false;
            return !matrix.loading;
        },
    },
);

    // ⭐ minimal change: ensure page & size defaults
    
const EscalationSlice = createSlice({
    name: "tpa",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchEscalationMatrix.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchEscalationMatrix.fulfilled, (state, action) => {
                const res = action?.payload;
                state.matrix = res?.data;
                state.loading = false;
            })
            .addCase(fetchEscalationMatrix.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Failed to fetch fetch Escalation Matrix";
            })
             //for depertment case
            .addCase(fetchEscalationMatrixdepartment.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchEscalationMatrixdepartment.fulfilled, (state, action) => {
                state.depertment = action.payload?.data;
                state.loading = false;
            })
            .addCase(fetchEscalationMatrixdepartment.rejected, (state, action) => {
                state.loading = false;
                state.error =
                action.error.message || "Failed to fetch Escalation Levels";
            });

    },
});

export default EscalationSlice.reducer;