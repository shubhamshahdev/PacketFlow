import { v4 as uuidv4 } from 'uuid';

export enum DeviceType {
  ROUTER = 'ROUTER',
  SWITCH = 'SWITCH',
  PC = 'PC',
  SERVER = 'SERVER',
  FIREWALL = 'FIREWALL',
  WIRELESS_AP = 'WIRELESS_AP',
  LAPTOP = 'LAPTOP',
  PRINTER = 'PRINTER',
}

export enum ConnectionType {
  ETHERNET = 'ETHERNET',
  FIBER = 'FIBER',
  WIRELESS = 'WIRELESS',
  SERIAL = 'SERIAL',
}

export enum ProtocolType {
  STATIC = 'STATIC',
  RIP = 'RIP',
  OSPF = 'OSPF',
  BGP = 'BGP',
}

export interface Position {
  x: number;
  y: number;
}

export interface DeviceInterface {
  id: string;
  name: string;
  ipAddress: string;
  subnetMask: string;
  macAddress: string;
  status: 'UP' | 'DOWN';
  type: string;
}

export interface DeviceConfig {
  hostname: string;
  interfaces: DeviceInterface[];
  routingProtocol?: ProtocolType;
  staticRoutes?: StaticRoute[];
  vlanConfig?: VLANConfig[];
  dhcpPool?: DHCPPool;
  dnsRecords?: DNSRecord[];
  firewallRules?: FirewallRule[];
}

export interface StaticRoute {
  destination: string;
  nextHop: string;
  metric: number;
}

export interface VLANConfig {
  vlanId: number;
  name: string;
  subnet: string;
  interfaces: string[];
}

export interface DHCPPool {
  subnet: string;
  startRange: string;
  endRange: string;
  defaultGateway: string;
  dnsServer: string;
  leaseTime: number;
}

export interface DNSRecord {
  hostname: string;
  ipAddress: string;
  type: 'A' | 'AAAA' | 'CNAME' | 'MX';
  ttl: number;
}

export interface FirewallRule {
  id: string;
  name: string;
  sourceIp: string;
  destinationIp: string;
  sourcePort: number;
  destinationPort: number;
  protocol: 'TCP' | 'UDP' | 'ICMP' | 'ANY';
  action: 'ALLOW' | 'DENY';
  priority: number;
  enabled: boolean;
}

export interface Device {
  id: string;
  name: string;
  type: DeviceType;
  position: Position;
  config: DeviceConfig;
  status: 'ONLINE' | 'OFFLINE' | 'DEGRADED';
  lastSeen: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Connection {
  id: string;
  sourceDeviceId: string;
  targetDeviceId: string;
  sourceInterface: string;
  targetInterface: string;
  type: ConnectionType;
  bandwidth: number;
  latency: number;
  status: 'UP' | 'DOWN' | 'DEGRADED';
  isTrunk: boolean;
  vlanAllowed?: number[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Packet {
  id: string;
  sourceIp: string;
  destinationIp: string;
  sourceMac: string;
  destinationMac: string;
  protocol: string;
  size: number;
  ttl: number;
  hopCount: number;
  currentHop: string;
  path: string[];
  payload: string;
  layerInfo: LayerInfo;
  timestamp: Date;
}

export interface LayerInfo {
  physical: { signalStrength: number; medium: string; encoding: string };
  dataLink: { sourceMac: string; destinationMac: string; frameType: string; vlanTag?: number };
  network: { sourceIp: string; destinationIp: string; ttl: number; protocol: string };
  transport: { sourcePort: number; destinationPort: number; protocol: string; sequenceNumber: number };
  session: { sessionId: string; protocol: string; state: string };
  presentation: { encoding: string; encryption: string; compression: string };
  application: { protocol: string; payload: string; contentType: string };
}

export interface Topology {
  id: string;
  name: string;
  description: string;
  devices: Device[];
  connections: Connection[];
  userId: string;
  isPublic: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface NetworkEvent {
  id: string;
  timestamp: Date;
  type: 'PACKET_SENT' | 'PACKET_RECEIVED' | 'PACKET_DROPPED' | 'CONNECTION_UP' | 'CONNECTION_DOWN' | 'ROUTE_CHANGE' | 'DEVICE_ONLINE' | 'DEVICE_OFFLINE' | 'ERROR' | 'INFO';
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  source: string;
  destination: string;
  message: string;
  details: Record<string, unknown>;
  topologyId: string;
}

export interface NetworkStatistics {
  id: string;
  timestamp: Date;
  totalPackets: number;
  totalBytes: number;
  packetsPerSecond: number;
  bytesPerSecond: number;
  activeDevices: number;
  activeConnections: number;
  packetLoss: number;
  averageLatency: number;
  bandwidthUsage: number;
  topologyId: string;
}

export function createDevice(overrides: Partial<Device> = {}): Device {
  const now = new Date();
  return {
    id: uuidv4(),
    name: 'Unnamed Device',
    type: DeviceType.PC,
    position: { x: 0, y: 0 },
    status: 'OFFLINE',
    config: {
      hostname: 'device',
      interfaces: [],
    },
    lastSeen: now,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

export function createConnection(overrides: Partial<Connection> = {}): Connection {
  const now = new Date();
  return {
    id: uuidv4(),
    sourceDeviceId: '',
    targetDeviceId: '',
    sourceInterface: '',
    targetInterface: '',
    type: ConnectionType.ETHERNET,
    bandwidth: 1000,
    latency: 1,
    status: 'DOWN',
    isTrunk: false,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

export function createTopology(overrides: Partial<Topology> = {}): Topology {
  const now = new Date();
  return {
    id: uuidv4(),
    name: 'New Topology',
    description: '',
    devices: [],
    connections: [],
    userId: '',
    isPublic: false,
    tags: [],
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}
