export class IpAddress {
  private readonly octets: number[];

  private constructor(octets: number[]) {
    this.octets = octets;
    Object.freeze(this);
  }

  static fromString(ip: string): IpAddress {
    const octets = ip.split('.').map(Number);
    if (octets.length !== 4 || octets.some((o) => isNaN(o) || o < 0 || o > 255)) {
      throw new Error(`Invalid IP address: ${ip}`);
    }
    return new IpAddress(octets);
  }

  static fromNumber(num: number): IpAddress {
    const octets = [
      (num >>> 24) & 255,
      (num >>> 16) & 255,
      (num >>> 8) & 255,
      num & 255,
    ];
    return new IpAddress(octets);
  }

  toString(): string {
    return this.octets.join('.');
  }

  toNumber(): number {
    return this.octets.reduce((acc, octet) => (acc << 8) + octet, 0) >>> 0;
  }

  equals(other: IpAddress): boolean {
    return this.toNumber() === other.toNumber();
  }

  isInSubnet(subnet: string, mask: string): boolean {
    const subnetIp = IpAddress.fromString(subnet);
    const subnetMask = IpAddress.fromString(mask);
    const network = subnetIp.toNumber() & subnetMask.toNumber();
    const host = this.toNumber() & subnetMask.toNumber();
    return network === host;
  }

  getNetworkAddress(mask: string): IpAddress {
    const subnetMask = IpAddress.fromString(mask);
    return IpAddress.fromNumber(this.toNumber() & subnetMask.toNumber());
  }

  getBroadcastAddress(mask: string): IpAddress {
    const subnetMask = IpAddress.fromString(mask);
    return IpAddress.fromNumber(this.toNumber() | ~subnetMask.toNumber());
  }

  getClass(): 'A' | 'B' | 'C' | 'D' | 'E' {
    const first = this.octets[0];
    if (first < 128) return 'A';
    if (first < 192) return 'B';
    if (first < 224) return 'C';
    if (first < 240) return 'D';
    return 'E';
  }

  isPrivate(): boolean {
    const ip = this.toNumber();
    const ranges = [
      [IpAddress.fromString('10.0.0.0').toNumber(), IpAddress.fromString('10.255.255.255').toNumber()],
      [IpAddress.fromString('172.16.0.0').toNumber(), IpAddress.fromString('172.31.255.255').toNumber()],
      [IpAddress.fromString('192.168.0.0').toNumber(), IpAddress.fromString('192.168.255.255').toNumber()],
    ];
    return ranges.some(([start, end]) => ip >= start && ip <= end);
  }
}
