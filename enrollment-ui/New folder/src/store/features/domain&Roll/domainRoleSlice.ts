import { fetchDomainRoleAPI } from "./domainRoleApi";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RollDomainRes } from "./domainRoleTypes";

export const fetchDomains = createAsyncThunk(
    "tpa/fetchDomains",
    async () => {
        const res = await fetchDomainRoleAPI({ isDomain: true });
        return res.data;
    }
);

export const fetchRolesByDomain = createAsyncThunk(
    "tpa/fetchRolesByDomain",
    async (domainId: string) => {
        const res = await fetchDomainRoleAPI({
            isDomain: false,
            domainId,
        });
        return res.data;
    }
);

interface RollDomainData {
    domains: RollDomainRes[];
    roles: RollDomainRes[];
    loading: boolean;
    error: string | null;
}

const initialState: RollDomainData = {
    domains: [],
    roles: [],
    loading: false,
    error: null,
};

const EscalationSlice = createSlice({
    name: "tpa",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchDomains.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDomains.fulfilled, (state, action) => {
                const res = action?.payload;
                state.domains = res?.data;
                state.loading = false;
            })
            .addCase(fetchDomains.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Failed to fetch fetch Escalation Matrix";
            })
            //for roles case
            .addCase(fetchRolesByDomain.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchRolesByDomain.fulfilled, (state, action) => {
                state.roles = action.payload?.data;
                state.loading = false;
            })
            .addCase(fetchRolesByDomain.rejected, (state, action) => {
                state.loading = false;
                state.error =
                    action.error.message || "Failed to fetch Escalation Levels";
            });

    },
});

export default EscalationSlice.reducer;