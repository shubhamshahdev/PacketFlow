import { SimulationEngine } from '../../src/application/services/SimulationEngine';
import { createTopology, createDevice, createConnection, DeviceType, ConnectionType } from '../../src/domain/entities/Topology';

describe('SimulationEngine', () => {
  let engine: SimulationEngine;
  let topology: ReturnType<typeof createTopology>;

  beforeEach(() => {
    engine = new SimulationEngine();
    topology = createTopology({
      name: 'Test Topology',
      devices: [
        createDevice({ id: 'device-1', name: 'PC1', type: DeviceType.PC, status: 'ONLINE', config: { hostname: 'pc1', interfaces: [{ id: 'if-1', name: 'eth0', ipAddress: '192.168.1.10', subnetMask: '255.255.255.0', macAddress: 'AA:BB:CC:DD:EE:01', status: 'UP', type: 'ethernet' }] } }),
        createDevice({ id: 'device-2', name: 'Router1', type: DeviceType.ROUTER, status: 'ONLINE', config: { hostname: 'router1', interfaces: [{ id: 'if-2', name: 'ge0', ipAddress: '192.168.1.1', subnetMask: '255.255.255.0', macAddress: 'AA:BB:CC:DD:EE:02', status: 'UP', type: 'ethernet' }] } }),
        createDevice({ id: 'device-3', name: 'Server1', type: DeviceType.SERVER, status: 'ONLINE', config: { hostname: 'server1', interfaces: [{ id: 'if-3', name: 'eth0', ipAddress: '10.0.0.10', subnetMask: '255.255.255.0', macAddress: 'AA:BB:CC:DD:EE:03', status: 'UP', type: 'ethernet' }] } }),
      ],
      connections: [
        createConnection({ id: 'conn-1', sourceDeviceId: 'device-1', targetDeviceId: 'device-2', status: 'UP', type: ConnectionType.ETHERNET, bandwidth: 1000, latency: 1 }),
        createConnection({ id: 'conn-2', sourceDeviceId: 'device-2', targetDeviceId: 'device-3', status: 'UP', type: ConnectionType.ETHERNET, bandwidth: 100, latency: 5 }),
      ],
    });
    engine.loadTopology(topology);
  });

  describe('simulatePing', () => {
    it('should return ping result between two devices', () => {
      const result = engine.simulatePing(topology.id, 'device-1', 'device-3');
      expect(result.source).toBe('192.168.1.10');
      expect(result.destination).toBe('10.0.0.10');
      expect(result.packetsTransmitted).toBeGreaterThan(0);
      expect(result.hops.length).toBeGreaterThan(0);
      expect(typeof result.packetLoss).toBe('number');
    });

    it('should throw for non-existent topology', () => {
      expect(() => engine.simulatePing('fake-id', 'device-1', 'device-3')).toThrow();
    });
  });

  describe('simulateTraceroute', () => {
    it('should return traceroute result', () => {
      const result = engine.simulateTraceroute(topology.id, 'device-1', 'device-3');
      expect(result.hops.length).toBeGreaterThan(0);
      expect(typeof result.totalTime).toBe('number');
    });
  });

  describe('simulatePortScan', () => {
    it('should scan ports on a device', () => {
      const ports = [22, 80, 443, 8080];
      const result = engine.simulatePortScan(topology.id, 'device-3', ports);
      expect(result.target).toBe('10.0.0.10');
      expect(result.totalPortsScanned).toBe(4);
      expect(result.ports.length).toBe(4);
    });
  });

  describe('simulatePacketFlow', () => {
    it('should generate packets along the path', () => {
      const packets = engine.simulatePacketFlow(topology.id, 'device-1', 'device-3');
      expect(packets.length).toBeGreaterThan(0);
      expect(packets[0].sourceIp).toBe('192.168.1.10');
      expect(packets[0].destinationIp).toBe('10.0.0.10');
    });
  });

  describe('getDeviceRoutingTable', () => {
    it('should return routing table for router', () => {
      const table = engine.getDeviceRoutingTable(topology.id, 'device-2');
      expect(Array.isArray(table)).toBe(true);
    });
  });

  describe('generateStatistics', () => {
    it('should generate network statistics', () => {
      const stats = engine.generateStatistics(topology.id);
      expect(stats.activeDevices).toBe(3);
      expect(stats.activeConnections).toBe(2);
      expect(stats.totalPackets).toBeGreaterThanOrEqual(0);
    });
  });
});
