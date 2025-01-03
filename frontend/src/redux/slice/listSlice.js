// src/redux/slice/listNameSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import axiosInstance, { endpoints } from 'src/utils/axios';
import { deductCredit } from './creditSlice';


export const fetchLists = createAsyncThunk('list/',
  async (params = {}) => {
    try {
      const response = await axiosInstance.get(endpoints.get.lists, {
        params
      });

      return {
        stats: response.data.data.stats,
        data: response.data.data,
      };
    } catch (error) {
      return error.message;
    }
  },
);


export const fetchListById = createAsyncThunk('list/getList', async (listId) => {
  try {
    const response = await axiosInstance.get(`${endpoints.list.get}/${listId}`)

    return response.data.data
  } catch (error) {
    return error.message
  }
})

export const downloadFile = createAsyncThunk(
  'list/downloadFile',
  async (jobId, { rejectWithValue }) => {
    try {
      // Make a GET request to download the file
      const response = await axiosInstance.get(`${endpoints.list.download}/${jobId}`, {
        responseType: 'blob', // Important for handling file data
      });

      // If the response is successful, return the file data as a Blob
      return response.data;
    } catch (error) {
      // Return error message if the download fails
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteList = createAsyncThunk(
  'list/deleteList',
  async ({ jobId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(endpoints.list.delete, {
        data: {
          jobId,
        },
      });
      return response.data; // Return the server's response for success
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchChartValues = createAsyncThunk(
  'list/fetchChartValues',
  async () => {
    try {
      const response = await axiosInstance.get(endpoints.list.chart)
      return response?.data?.data;
    } catch (error) {
      return error.message;
    }
  }
)

export const startBulkVerification = createAsyncThunk(
  'list/startVerification',
  async (jobId, { rejectWithValue }) => {
    try {
      // debugger
      const response = await axiosInstance.post(endpoints.list.startBulkVerification, {
        jobId,
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const pollJobStatus = createAsyncThunk(
  'list/pollJobStatus',
  async ({ jobId }, { dispatch, rejectWithValue }) => {
    const poll = async (resolve, reject) => {
      try {
        const response = await axiosInstance.get(endpoints.list.getStatus, { params: { jobId } });
        const { status } = response.data.data;
        if (status === 'COMPLETED' || status === 'FAILED') {
          resolve(response.data);
          if (status === 'COMPLETED') {
            dispatch(deductCredit({
              amount: response?.data?.data?.totalEmails
            }))
          }
        } else {
          setTimeout(() => poll(resolve, reject), 5000); // Poll again in 5 seconds
        }
      } catch (error) {
        reject(rejectWithValue(error.response?.data || error.message));
      }
    };

    return new Promise(poll);
  }
);

const listSlice = createSlice({
  name: 'list',
  initialState: {
    selectedListIndex: 0,
    data: [],
    completedLists: [],
    unprocessedLists: [],
    processingLists: [],
    stats: {},
    chartValues: {},
    selectedList: {},
    verificationResult: null,
    pollingJob: null, // Track current polling job
    loading: false,      // Add loading state
    error: null,         // Add error state
    downloadLoading: false,  // Track download loading state
    downloadError: null,  // Track download error state
    downloadedFile: null,
  },
  reducers: {

    setSelectedListIndex: (state, action) => {
      state.selectedListIndex = action.payload;
    },
    setList: (state, action) => {
      state.data = action.payload;
    },
    setCompletedList: (state, action) => {
      state.completedLists = action.payload;
    },
    setUnprocessedList: (state, action) => {
      state.unprocessedLists = action.payload;
    },
    setChartValues: (state, action) => {
      state.chartValues = action.payload;
    }
  }, extraReducers: (builder) => {
    builder
      .addCase(fetchLists.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLists.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action?.payload?.data?.listData;
        state.completedLists = state.data.filter((list) => list.status === 'COMPLETED');
        state.unprocessedLists = state.data.filter((list) => list.status === 'UNPROCESSED');
        state.processingLists = state.data.filter((list) => list.status === 'PROCESSING');
        state.selectedList = state.completedLists[0]
      })
      .addCase(fetchLists.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchChartValues.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChartValues.fulfilled, (state, action) => {
        state.loading = false;
        state.chartValues = action.payload;
      })
      .addCase(fetchChartValues.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchListById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchListById.fulfilled, (state, action) => {
        // debugger
        state.loading = false;
        state.selectedList = action.payload;
      })
      .addCase(fetchListById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // verification
      .addCase(startBulkVerification.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.verificationResult = null;
      })
      .addCase(startBulkVerification.fulfilled, (state, action) => {
        state.loading = false;
        state.verificationResult = action.payload;
      })
      .addCase(startBulkVerification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // 
      .addCase(pollJobStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(pollJobStatus.fulfilled, (state, action) => {
        state.loading = false;
        const updatedList = state.data.map((list) =>
          list.jobId === action.payload.data.jobId ? { ...list, status: action?.payload?.data?.status } : list
        );
        state.data = updatedList;
        state.pollingJob = null; // Reset current polling job
      })
      .addCase(pollJobStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.pollingJob = null; // Reset current polling job
      })
      // download file 
      .addCase(downloadFile.pending, (state) => {
        state.downloadLoading = true;
        state.downloadError = null;
      })
      .addCase(downloadFile.fulfilled, (state, action) => {
        // Handle successful file download, trigger the download in the browser
        state.downloadLoading = false;
        state.downloadedFile = action.payload;

        // Trigger the file download in the browser (download logic)
        const url = window.URL.createObjectURL(action.payload);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'downloaded_file'; // You can specify the filename here
        document.body.appendChild(link);
        link.click();
      })
      .addCase(downloadFile.rejected, (state, action) => {
        state.downloadLoading = false;
        state.downloadError = action.payload;
      });
  },
});

export const { lists, setSelectedListIndex, setList, setChartValues, unprocessedLists, completedLists, setCompletedList, setUnprocessedList } = listSlice.actions;
export default listSlice.reducer;