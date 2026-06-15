import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { SimulationState } from '@/types';
import { api } from '@/services/api';

const initialState: SimulationState = {
  packets: [],
  statistics: null,
  events: [],
  pingResult: null,
  tracerouteResult: null,
  portScanResult: null,
  isSimulating: false,
  error: null,
};

export const simulatePing = createAsyncThunk(
  'simulation/ping',
  async ({ topologyId, sourceId, destinationId }: { topologyId: string; sourceId: string; destinationId: string }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/topologies/${topologyId}/ping`, { sourceId, destinationId });
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue((error as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || 'Ping failed');
    }
  }
);

export const simulateTraceroute = createAsyncThunk(
  'simulation/traceroute',
  async ({ topologyId, sourceId, destinationId }: { topologyId: string; sourceId: string; destinationId: string }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/topologies/${topologyId}/traceroute`, { sourceId, destinationId });
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue((error as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || 'Traceroute failed');
    }
  }
);

export const simulatePortScan = createAsyncThunk(
  'simulation/portScan',
  async ({ topologyId, targetId, ports }: { topologyId: string; targetId: string; ports: number[] }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/topologies/${topologyId}/port-scan`, { targetId, ports });
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue((error as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || 'Port scan failed');
    }
  }
);

export const simulatePacketFlow = createAsyncThunk(
  'simulation/packetFlow',
  async ({ topologyId, sourceId, destinationId }: { topologyId: string; sourceId: string; destinationId: string }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/topologies/${topologyId}/packet-flow`, { sourceId, destinationId });
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue((error as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || 'Packet flow simulation failed');
    }
  }
);

export const fetchStatistics = createAsyncThunk(
  'simulation/statistics',
  async (topologyId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/topologies/${topologyId}/statistics`);
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue((error as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || 'Failed to fetch statistics');
    }
  }
);

export const fetchEvents = createAsyncThunk(
  'simulation/events',
  async ({ topologyId, limit }: { topologyId: string; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/topologies/${topologyId}/events`, { params: { limit: limit || 100 } });
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue((error as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || 'Failed to fetch events');
    }
  }
);

const simulationSlice = createSlice({
  name: 'simulation',
  initialState,
  reducers: {
    clearSimulation(state) {
      state.packets = [];
      state.pingResult = null;
      state.tracerouteResult = null;
      state.portScanResult = null;
      state.error = null;
    },
    addPacket(state, action) {
      state.packets.push(action.payload);
      if (state.packets.length > 100) state.packets.shift();
    },
    clearPackets(state) {
      state.packets = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(simulatePing.pending, (state) => { state.isSimulating = true; state.error = null; })
      .addCase(simulatePing.fulfilled, (state, action) => { state.isSimulating = false; state.pingResult = action.payload; })
      .addCase(simulatePing.rejected, (state, action) => { state.isSimulating = false; state.error = action.payload as string; })
      .addCase(simulateTraceroute.fulfilled, (state, action) => { state.tracerouteResult = action.payload; })
      .addCase(simulatePortScan.fulfilled, (state, action) => { state.portScanResult = action.payload; })
      .addCase(simulatePacketFlow.fulfilled, (state, action) => { state.packets = action.payload; })
      .addCase(fetchStatistics.fulfilled, (state, action) => { state.statistics = action.payload; })
      .addCase(fetchEvents.fulfilled, (state, action) => { state.events = action.payload.data || action.payload; });
  },
});

export const { clearSimulation, addPacket, clearPackets } = simulationSlice.actions;
export default simulationSlice.reducer;
