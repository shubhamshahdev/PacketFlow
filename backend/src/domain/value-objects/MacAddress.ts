export class MacAddress {
  private readonly hex: string;

  private constructor(hex: string) {
    this.hex = hex;
    Object.freeze(this);
  }

  static fromString(mac: string): MacAddress {
    const cleaned = mac.replace(/[:\-.]/g, '').toUpperCase();
    if (!/^[0-9A-F]{12}$/.test(cleaned)) {
      throw new Error(`Invalid MAC address: ${mac}`);
    }
    return new MacAddress(cleaned);
  }

  static random(): MacAddress {
    const hex = Array.from({ length: 6 }, () =>
      Math.floor(Math.random() * 256)
        .toString(16)
        .padStart(2, '0')
    ).join('');
    return new MacAddress(hex.toUpperCase());
  }

  toString(format: ':' | '-' | '.' | 'none' = ':'): string {
    if (format === 'none') return this.hex;
    const parts = this.hex.match(/.{2}/g) || [];
    return parts.join(format);
  }

  equals(other: MacAddress): boolean {
    return this.hex === other.hex;
  }

  isUnicast(): boolean {
    const firstByte = parseInt(this.hex.substring(0, 2), 16);
    return (firstByte & 1) === 0;
  }

  isMulticast(): boolean {
    const firstByte = parseInt(this.hex.substring(0, 2), 16);
    return (firstByte & 1) === 1;
  }

  isBroadcast(): boolean {
    return this.hex === 'FFFFFFFFFFFF';
  }

  getOui(): string {
    return this.hex.substring(0, 6);
  }
}
