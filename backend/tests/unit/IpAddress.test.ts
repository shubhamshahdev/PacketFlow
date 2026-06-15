import { IpAddress } from '../../src/domain/value-objects/IpAddress';

describe('IpAddress', () => {
  describe('fromString', () => {
    it('should create valid IP address', () => {
      const ip = IpAddress.fromString('192.168.1.1');
      expect(ip.toString()).toBe('192.168.1.1');
    });

    it('should throw on invalid IP', () => {
      expect(() => IpAddress.fromString('999.999.999.999')).toThrow();
      expect(() => IpAddress.fromString('not-an-ip')).toThrow();
      expect(() => IpAddress.fromString('')).toThrow();
    });
  });

  describe('fromNumber', () => {
    it('should convert correctly', () => {
      const ip = IpAddress.fromNumber(3232235521);
      expect(ip.toString()).toBe('192.168.1.1');
    });
  });

  describe('toNumber', () => {
    it('should convert IP to number', () => {
      const ip = IpAddress.fromString('192.168.1.1');
      expect(ip.toNumber()).toBe(3232235521);
    });
  });

  describe('equals', () => {
    it('should detect equal IPs', () => {
      const a = IpAddress.fromString('10.0.0.1');
      const b = IpAddress.fromString('10.0.0.1');
      expect(a.equals(b)).toBe(true);
    });

    it('should detect different IPs', () => {
      const a = IpAddress.fromString('10.0.0.1');
      const b = IpAddress.fromString('10.0.0.2');
      expect(a.equals(b)).toBe(false);
    });
  });

  describe('isInSubnet', () => {
    it('should check subnet membership', () => {
      const ip = IpAddress.fromString('192.168.1.50');
      expect(ip.isInSubnet('192.168.1.0', '255.255.255.0')).toBe(true);
      expect(ip.isInSubnet('10.0.0.0', '255.0.0.0')).toBe(false);
    });
  });

  describe('getClass', () => {
    it('should return correct class', () => {
      expect(IpAddress.fromString('10.0.0.1').getClass()).toBe('A');
      expect(IpAddress.fromString('172.16.0.1').getClass()).toBe('B');
      expect(IpAddress.fromString('192.168.1.1').getClass()).toBe('C');
      expect(IpAddress.fromString('224.0.0.1').getClass()).toBe('D');
      expect(IpAddress.fromString('240.0.0.1').getClass()).toBe('E');
    });
  });

  describe('isPrivate', () => {
    it('should detect private IPs', () => {
      expect(IpAddress.fromString('10.0.0.1').isPrivate()).toBe(true);
      expect(IpAddress.fromString('172.16.0.1').isPrivate()).toBe(true);
      expect(IpAddress.fromString('192.168.1.1').isPrivate()).toBe(true);
    });

    it('should detect public IPs', () => {
      expect(IpAddress.fromString('8.8.8.8').isPrivate()).toBe(false);
      expect(IpAddress.fromString('1.1.1.1').isPrivate()).toBe(false);
    });
  });
});
