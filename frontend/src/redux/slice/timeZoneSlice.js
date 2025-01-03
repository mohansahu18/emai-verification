import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance, { endpoints } from 'src/utils/axios';

// Helper function to format timezone display
const formatTimezoneDisplay = (tz) => {
    // Convert minutes to hours (API sends GMT in minutes)
    // const minutes = parseInt(tz.value.replace(/[^-\d]/g, ''));
    const minutes = parseInt(tz.value.replace(/[^-\d]/g, ''), 10);
    const hours = Math.floor(Math.abs(minutes) / 60);
    const mins = Math.abs(minutes) % 60;
    const sign = minutes >= 0 ? '+' : '-';

    // Format as (GMT±HH:MM) Location
    const gmtPart = `(GMT${sign}${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')})`;
    // Convert "Region/City" to just "City" and replace underscores with spaces
    const location = tz.key.split('/').pop().replace(/_/g, ' ');

    return `${gmtPart} ${location}`;
};

// Create async thunk for fetching timezones
export const fetchTimeZones = createAsyncThunk(
    'timeZone/fetchTimeZones',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(endpoints.timeZone.get);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

// Async thunk for saving selected timezone
export const saveTimeZone = createAsyncThunk(
    'timeZone/saveTimeZone',
    async (data, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(endpoints.timeZone.save, { timezone: data.key });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

const timeZoneSlice = createSlice({
    name: 'timeZone',
    initialState: {
        timeZones: [],
        loading: false,
        error: null,
        selectedTimeZone: {
            key: "",
            value: "",
            display: ""
        }
    },
    reducers: {
        setSelectedTimeZone: (state, action) => {
            state.selectedTimeZone = {
                ...action.payload,
                display: formatTimezoneDisplay(action.payload)
            };
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch timezones
            .addCase(fetchTimeZones.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTimeZones.fulfilled, (state, action) => {
                state.loading = false;
                // Add display format to each timezone
                state.timeZones = action.payload.map((tz, index) => ({
                    ...tz,
                    key: `${tz.key}`,
                    display: formatTimezoneDisplay(tz)
                }));
            })
            .addCase(fetchTimeZones.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Save selected timezone
            .addCase(saveTimeZone.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(saveTimeZone.fulfilled, (state, action) => {
                state.loading = false;
                // Update the selected timezone with saved data
                state.selectedTimeZone = {
                    ...action.payload,
                    display: formatTimezoneDisplay(action.payload)
                };
            })
            .addCase(saveTimeZone.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { setSelectedTimeZone } = timeZoneSlice.actions;
export default timeZoneSlice.reducer;