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
  lastSeen: string;
  createdAt: string;
  updatedAt: string;
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
  createdAt: string;
  updatedAt: string;
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
  timestamp: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface NetworkEvent {
  id: string;
  timestamp: string;
  type: string;
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  source: string;
  destination: string;
  message: string;
  details: Record<string, unknown>;
  topologyId: string;
}

export interface NetworkStatistics {
  id: string;
  timestamp: string;
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

export interface User {
  id: string;
  email: string;
  username: string;
  role: 'ADMIN' | 'USER' | 'VIEWER';
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface TopologyState {
  topologies: Topology[];
  currentTopology: Topology | null;
  isLoading: boolean;
  error: string | null;
}

export interface SimulationState {
  packets: Packet[];
  statistics: NetworkStatistics | null;
  events: NetworkEvent[];
  pingResult: PingResult | null;
  tracerouteResult: TracerouteResult | null;
  portScanResult: PortScanResult | null;
  isSimulating: boolean;
  error: string | null;
}

export interface ThemeState {
  mode: 'light' | 'dark';
}
