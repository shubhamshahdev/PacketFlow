import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { TopologyState, Topology, Device, Connection } from '@/types';
import { api } from '@/services/api';

const initialState: TopologyState = {
  topologies: [],
  currentTopology: null,
  isLoading: false,
  error: null,
};

export const fetchTopologies = createAsyncThunk('topology/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/topologies');
    return response.data.data || response.data;
  } catch (error: unknown) {
    return rejectWithValue((error as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || 'Failed to fetch topologies');
  }
});

export const fetchTopologyById = createAsyncThunk('topology/fetchById', async (id: string, { rejectWithValue }) => {
  try {
    const response = await api.get(`/topologies/${id}`);
    return response.data;
  } catch (error: unknown) {
    return rejectWithValue((error as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || 'Failed to fetch topology');
  }
});

export const createTopology = createAsyncThunk('topology/create', async (data: Partial<Topology>, { rejectWithValue }) => {
  try {
    const response = await api.post('/topologies', data);
    return response.data;
  } catch (error: unknown) {
    return rejectWithValue((error as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || 'Failed to create topology');
  }
});

export const updateTopology = createAsyncThunk('topology/update', async ({ id, data }: { id: string; data: Partial<Topology> }, { rejectWithValue }) => {
  try {
    const response = await api.put(`/topologies/${id}`, data);
    return response.data;
  } catch (error: unknown) {
    return rejectWithValue((error as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || 'Failed to update topology');
  }
});

export const deleteTopology = createAsyncThunk('topology/delete', async (id: string, { rejectWithValue }) => {
  try {
    await api.delete(`/topologies/${id}`);
    return id;
  } catch (error: unknown) {
    return rejectWithValue((error as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || 'Failed to delete topology');
  }
});

const topologySlice = createSlice({
  name: 'topology',
  initialState,
  reducers: {
    setCurrentTopology(state, action) {
      state.currentTopology = action.payload;
    },
    addDevice(state, action) {
      if (state.currentTopology) {
        state.currentTopology.devices.push(action.payload);
      }
    },
    updateDevice(state, action) {
      if (state.currentTopology) {
        const index = state.currentTopology.devices.findIndex((d) => d.id === action.payload.id);
        if (index >= 0) state.currentTopology.devices[index] = action.payload;
      }
    },
    removeDevice(state, action) {
      if (state.currentTopology) {
        state.currentTopology.devices = state.currentTopology.devices.filter((d) => d.id !== action.payload);
        state.currentTopology.connections = state.currentTopology.connections.filter(
          (c) => c.sourceDeviceId !== action.payload && c.targetDeviceId !== action.payload
        );
      }
    },
    addConnection(state, action) {
      if (state.currentTopology) {
        state.currentTopology.connections.push(action.payload);
      }
    },
    updateConnection(state, action) {
      if (state.currentTopology) {
        const index = state.currentTopology.connections.findIndex((c) => c.id === action.payload.id);
        if (index >= 0) state.currentTopology.connections[index] = action.payload;
      }
    },
    removeConnection(state, action) {
      if (state.currentTopology) {
        state.currentTopology.connections = state.currentTopology.connections.filter((c) => c.id !== action.payload);
      }
    },
    updateDevicePosition(state, action: { payload: { deviceId: string; position: { x: number; y: number } } }) {
      if (state.currentTopology) {
        const device = state.currentTopology.devices.find((d) => d.id === action.payload.deviceId);
        if (device) device.position = action.payload.position;
      }
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTopologies.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchTopologies.fulfilled, (state, action) => { state.isLoading = false; state.topologies = action.payload; })
      .addCase(fetchTopologies.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string; })
      .addCase(fetchTopologyById.fulfilled, (state, action) => { state.currentTopology = action.payload; })
      .addCase(createTopology.fulfilled, (state, action) => {
        state.topologies.push(action.payload);
        state.currentTopology = action.payload;
      })
      .addCase(updateTopology.fulfilled, (state, action) => {
        const idx = state.topologies.findIndex((t) => t.id === action.payload.id);
        if (idx >= 0) state.topologies[idx] = action.payload;
        state.currentTopology = action.payload;
      })
      .addCase(deleteTopology.fulfilled, (state, action) => {
        state.topologies = state.topologies.filter((t) => t.id !== action.payload);
        if (state.currentTopology?.id === action.payload) state.currentTopology = null;
      });
  },
});

export const {
  setCurrentTopology, addDevice, updateDevice, removeDevice,
  addConnection, updateConnection, removeConnection,
  updateDevicePosition, clearError,
} = topologySlice.actions;
export default topologySlice.reducer;
