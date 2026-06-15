import { v4 as uuidv4 } from 'uuid';
import {
  Device,
  Connection,
  Topology,
  Packet,
  LayerInfo,
  DeviceType,
  NetworkEvent,
  NetworkStatistics,
  ProtocolType,
} from '@domain/entities/Topology';
import { IpAddress } from '@domain/value-objects/IpAddress';

export interface PingResult {
  source: string;
  destination: string;
  success: boolean;
  roundTripTime: number;
  packetsTransmitted: number;
  packetsReceived: number;
  packetLoss: number;
  hops: PingHop[];
  ttl: number;
}

export interface PingHop {
  hop: number;
  ip: string;
  hostname: string;
  rtt: number;
  status: 'SUCCESS' | 'TIMEOUT' | 'ERROR';
}

export interface TracerouteResult {
  source: string;
  destination: string;
  hops: TracerouteHop[];
  totalTime: number;
  success: boolean;
}

export interface TracerouteHop {
  hop: number;
  ip: string;
  hostname: string;
  rtt: number[];
  status: 'SUCCESS' | 'TIMEOUT' | 'ERROR';
}

export interface PortScanResult {
  target: string;
  hostStatus: 'UP' | 'DOWN';
  ports: PortInfo[];
  totalPortsScanned: number;
  openPorts: number;
  scanTime: number;
}

export interface PortInfo {
  port: number;
  protocol: 'TCP' | 'UDP';
  state: 'OPEN' | 'CLOSED' | 'FILTERED';
  service: string;
}

export class SimulationEngine {
  private topologies: Map<string, Topology> = new Map();

  loadTopology(topology: Topology): void {
    this.topologies.set(topology.id, topology);
  }

  getTopology(id: string): Topology | undefined {
    return this.topologies.get(id);
  }

  removeTopology(id: string): void {
    this.topologies.delete(id);
  }

  simulatePing(topologyId: string, sourceId: string, destId: string): PingResult {
    const topology = this.topologies.get(topologyId);
    if (!topology) {
      throw new Error('Topology not found');
    }

    const source = topology.devices.find((d) => d.id === sourceId);
    const dest = topology.devices.find((d) => d.id === destId);
    if (!source || !dest) {
      throw new Error('Device not found');
    }

    const path = this.findPath(topology, sourceId, destId);
    const sourceIp = source.config.interfaces[0]?.ipAddress || '0.0.0.0';
    const destIp = dest.config.interfaces[0]?.ipAddress || '0.0.0.0';

    const hops: PingHop[] = [];
    let totalRtt = 0;
    let successCount = 0;

    for (let i = 0; i < path.length; i++) {
      const device = topology.devices.find((d) => d.id === path[i]);
      const rtt = this.calculateLatency(topology, path, i);
      const isSuccess = Math.random() > 0.05;
      totalRtt += rtt;
      if (isSuccess) successCount++;

      hops.push({
        hop: i + 1,
        ip: device?.config.interfaces[0]?.ipAddress || '0.0.0.0',
        hostname: device?.config.hostname || 'unknown',
        rtt,
        status: isSuccess ? 'SUCCESS' : 'TIMEOUT',
      });
    }

    const packetLoss = ((hops.length - successCount) / hops.length) * 100;

    const event: NetworkEvent = {
      id: uuidv4(),
      timestamp: new Date(),
      type: 'PACKET_SENT',
      severity: packetLoss > 0 ? 'WARNING' : 'INFO',
      source: sourceIp,
      destination: destIp,
      message: `Ping ${packetLoss > 0 ? 'with loss' : 'successful'} from ${source.config.hostname} to ${dest.config.hostname} (${packetLoss.toFixed(0)}% loss)`,
      details: { hops: hops.length, rtt: totalRtt },
      topologyId,
    };

    return {
      source: sourceIp,
      destination: destIp,
      success: packetLoss < 100,
      roundTripTime: totalRtt,
      packetsTransmitted: hops.length,
      packetsReceived: successCount,
      packetLoss,
      hops,
      ttl: 64,
    };
  }

  simulateTraceroute(topologyId: string, sourceId: string, destId: string): TracerouteResult {
    const topology = this.topologies.get(topologyId);
    if (!topology) throw new Error('Topology not found');

    const path = this.findPath(topology, sourceId, destId);
    const hops: TracerouteHop[] = [];
    let totalTime = 0;

    for (let i = 0; i < path.length; i++) {
      const device = topology.devices.find((d) => d.id === path[i]);
      const rtts: number[] = [];
      let status: 'SUCCESS' | 'TIMEOUT' | 'ERROR' = 'SUCCESS';

      for (let probe = 0; probe < 3; probe++) {
        const rtt = this.calculateLatency(topology, path, i) + Math.random() * 2;
        rtts.push(Math.round(rtt * 100) / 100);
        if (Math.random() < 0.03) {
          rtts[probe] = -1;
          status = 'TIMEOUT';
        }
      }

      totalTime += rtts.filter((r) => r >= 0).reduce((a, b) => a + b, 0);

      hops.push({
        hop: i + 1,
        ip: device?.config.interfaces[0]?.ipAddress || '*',
        hostname: device?.config.hostname || '*',
        rtt: rtts,
        status,
      });
    }

    return {
      source: topology.devices.find((d) => d.id === sourceId)?.config.interfaces[0]?.ipAddress || '0.0.0.0',
      destination: topology.devices.find((d) => d.id === destId)?.config.interfaces[0]?.ipAddress || '0.0.0.0',
      hops,
      totalTime: Math.round(totalTime * 100) / 100,
      success: hops.every((h) => h.status === 'SUCCESS'),
    };
  }

  simulatePortScan(topologyId: string, targetId: string, ports: number[]): PortScanResult {
    const topology = this.topologies.get(topologyId);
    if (!topology) throw new Error('Topology not found');

    const target = topology.devices.find((d) => d.id === targetId);
    if (!target) throw new Error('Target device not found');

    const startTime = Date.now();
    const portInfos: PortInfo[] = [];
    let openCount = 0;

    const commonServices: Record<number, string> = {
      20: 'FTP-data', 21: 'FTP', 22: 'SSH', 23: 'Telnet', 25: 'SMTP',
      53: 'DNS', 80: 'HTTP', 110: 'POP3', 143: 'IMAP', 443: 'HTTPS',
      465: 'SMTPS', 587: 'SMTP', 993: 'IMAPS', 995: 'POP3S', 1433: 'MSSQL',
      3306: 'MySQL', 3389: 'RDP', 5432: 'PostgreSQL', 6379: 'Redis', 8080: 'HTTP-Alt',
      8443: 'HTTPS-Alt', 27017: 'MongoDB',
    };

    for (const port of ports) {
      const isOpen = Math.random() > 0.6;
      if (isOpen) openCount++;
      portInfos.push({
        port,
        protocol: Math.random() > 0.5 ? 'TCP' : 'UDP',
        state: isOpen ? 'OPEN' : Math.random() > 0.3 ? 'CLOSED' : 'FILTERED',
        service: commonServices[port] || 'unknown',
      });
    }

    return {
      target: target.config.interfaces[0]?.ipAddress || '0.0.0.0',
      hostStatus: 'UP',
      ports: portInfos,
      totalPortsScanned: ports.length,
      openPorts: openCount,
      scanTime: Date.now() - startTime,
    };
  }

  simulatePacketFlow(topologyId: string, sourceId: string, destId: string): Packet[] {
    const topology = this.topologies.get(topologyId);
    if (!topology) throw new Error('Topology not found');

    const path = this.findPath(topology, sourceId, destId);
    const packets: Packet[] = [];
    const source = topology.devices.find((d) => d.id === sourceId);
    const dest = topology.devices.find((d) => d.id === destId);
    if (!source || !dest) return packets;

    const sourceIp = source.config.interfaces[0]?.ipAddress || '10.0.0.1';
    const destIp = dest.config.interfaces[0]?.ipAddress || '10.0.0.2';
    const sourceMac = source.config.interfaces[0]?.macAddress || '00:00:00:00:00:01';

    for (let i = 0; i < path.length; i++) {
      const currentDevice = topology.devices.find((d) => d.id === path[i]);
      const nextMac = i < path.length - 1
        ? topology.devices.find((d) => d.id === path[i + 1])?.config.interfaces[0]?.macAddress || '00:00:00:00:00:00'
        : 'FF:FF:FF:FF:FF:FF';

      const ttl = 64 - i;
      const packet: Packet = {
        id: uuidv4(),
        sourceIp,
        destinationIp: destIp,
        sourceMac,
        destinationMac: nextMac,
        protocol: 'ICMP',
        size: Math.floor(Math.random() * 500) + 64,
        ttl: Math.max(ttl, 1),
        hopCount: i + 1,
        currentHop: currentDevice?.config.hostname || 'unknown',
        path: path.slice(0, i + 1),
        payload: `Packet from ${source.config.hostname} to ${dest.config.hostname}`,
        layerInfo: {
          physical: { signalStrength: Math.round(Math.random() * 100), medium: 'Ethernet', encoding: 'NRZ-I' },
          dataLink: { sourceMac, destinationMac: nextMac, frameType: 'Ethernet II', vlanTag: i },
          network: { sourceIp, destinationIp: destIp, ttl: Math.max(ttl, 1), protocol: 'ICMP' },
          transport: { sourcePort: 0, destinationPort: 0, protocol: 'ICMP', sequenceNumber: i },
          session: { sessionId: `sess-${i}`, protocol: 'ICMP', state: 'ESTABLISHED' },
          presentation: { encoding: 'Raw', encryption: 'None', compression: 'None' },
          application: { protocol: 'Ping', payload: `echo-request-${i}`, contentType: 'text/plain' },
        },
        timestamp: new Date(Date.now() + i * 10),
      };

      packets.push(packet);
    }

    return packets;
  }

  generateStatistics(topologyId: string): NetworkStatistics {
    const topology = this.topologies.get(topologyId);
    if (!topology) throw new Error('Topology not found');

    return {
      id: uuidv4(),
      timestamp: new Date(),
      totalPackets: Math.floor(Math.random() * 10000),
      totalBytes: Math.floor(Math.random() * 10000000),
      packetsPerSecond: Math.round(Math.random() * 1000 * 100) / 100,
      bytesPerSecond: Math.round(Math.random() * 1000000 * 100) / 100,
      activeDevices: topology.devices.filter((d) => d.status === 'ONLINE').length,
      activeConnections: topology.connections.filter((c) => c.status === 'UP').length,
      packetLoss: Math.round(Math.random() * 3 * 100) / 100,
      averageLatency: Math.round((Math.random() * 50 + 1) * 100) / 100,
      bandwidthUsage: Math.round(Math.random() * 100 * 100) / 100,
      topologyId,
    };
  }

  getDeviceRoutingTable(topologyId: string, deviceId: string): Record<string, unknown>[] {
    const topology = this.topologies.get(topologyId);
    if (!topology) throw new Error('Topology not found');

    const device = topology.devices.find((d) => d.id === deviceId);
    if (!device) throw new Error('Device not found');

    const routingTable: Record<string, unknown>[] = [];
    const connections = topology.connections.filter(
      (c) => c.sourceDeviceId === deviceId || c.targetDeviceId === deviceId
    );

    for (const conn of connections) {
      const neighborId = conn.sourceDeviceId === deviceId ? conn.targetDeviceId : conn.sourceDeviceId;
      const neighbor = topology.devices.find((d) => d.id === neighborId);
      if (!neighbor) continue;

      const metric = device.type === DeviceType.ROUTER ? Math.floor(Math.random() * 5 + 1) : 0;
      routingTable.push({
        destination: neighbor.config.interfaces[0]?.ipAddress || '0.0.0.0',
        mask: '255.255.255.0',
        nextHop: neighbor.config.hostname,
        interface: conn.sourceInterface || 'eth0',
        metric,
        protocol: device.config.routingProtocol || 'STATIC',
        age: Math.floor(Math.random() * 100),
      });
    }

    return routingTable;
  }

  generateNetworkEvent(topologyId: string, type: NetworkEvent['type'] = 'INFO'): NetworkEvent {
    const topology = this.topologies.get(topologyId);
    const randomDevice = topology?.devices[Math.floor(Math.random() * (topology?.devices.length || 1))];

    return {
      id: uuidv4(),
      timestamp: new Date(),
      type,
      severity: type === 'ERROR' ? 'ERROR' : type === 'PACKET_DROPPED' ? 'WARNING' : 'INFO',
      source: randomDevice?.config.interfaces[0]?.ipAddress || 'unknown',
      destination: randomDevice?.config.interfaces[0]?.ipAddress || 'unknown',
      message: `${type} event generated at ${randomDevice?.config.hostname || 'unknown'}`,
      details: { topologyId, simulated: true },
      topologyId,
    };
  }

  private findPath(topology: Topology, sourceId: string, destId: string): string[] {
    if (sourceId === destId) return [sourceId];

    const visited = new Set<string>();
    const queue: { deviceId: string; path: string[] }[] = [{ deviceId: sourceId, path: [sourceId] }];
    visited.add(sourceId);

    while (queue.length > 0) {
      const { deviceId, path } = queue.shift()!;

      const connections = topology.connections.filter(
        (c) => (c.sourceDeviceId === deviceId || c.targetDeviceId === deviceId) && c.status === 'UP'
      );

      for (const conn of connections) {
        const neighbor = conn.sourceDeviceId === deviceId ? conn.targetDeviceId : conn.sourceDeviceId;

        if (neighbor === destId) {
          return [...path, destId];
        }

        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push({ deviceId: neighbor, path: [...path, neighbor] });
        }
      }
    }

    return [sourceId, destId];
  }

  private calculateLatency(topology: Topology, path: string[], hopIndex: number): number {
    if (hopIndex >= path.length - 1) return 0;

    const currentId = path[hopIndex];
    const nextId = path[hopIndex + 1];
    const connection = topology.connections.find(
      (c) =>
        (c.sourceDeviceId === currentId && c.targetDeviceId === nextId) ||
        (c.sourceDeviceId === nextId && c.targetDeviceId === currentId)
    );

    if (!connection) {
      const device = topology.devices.find((d) => d.id === currentId);
      const baseLatency = device?.type === DeviceType.ROUTER ? 5 : device?.type === DeviceType.SWITCH ? 1 : 10;
      return baseLatency + Math.random() * 2;
    }

    return connection.latency + Math.random() * connection.latency * 0.1;
  }
}
