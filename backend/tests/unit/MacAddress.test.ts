import { MacAddress } from '../../src/domain/value-objects/MacAddress';

describe('MacAddress', () => {
  describe('fromString', () => {
    it('should create valid MAC address', () => {
      const mac = MacAddress.fromString('AA:BB:CC:DD:EE:FF');
      expect(mac.toString()).toBe('AA:BB:CC:DD:EE:FF');
    });

    it('should accept different formats', () => {
      expect(MacAddress.fromString('aa-bb-cc-dd-ee-ff').toString()).toBe('AA:BB:CC:DD:EE:FF');
      expect(MacAddress.fromString('aabb.ccdd.eeff').toString()).toBe('AA:BB:CC:DD:EE:FF');
    });

    it('should throw on invalid MAC', () => {
      expect(() => MacAddress.fromString('not-a-mac')).toThrow();
      expect(() => MacAddress.fromString('')).toThrow();
    });
  });

  describe('random', () => {
    it('should generate valid MAC', () => {
      const mac = MacAddress.random();
      expect(mac.toString()).toMatch(/^([0-9A-F]{2}:){5}[0-9A-F]{2}$/);
    });
  });

  describe('isUnicast', () => {
    it('should detect unicast MAC', () => {
      expect(MacAddress.fromString('AA:BB:CC:DD:EE:FF').isUnicast()).toBe(true);
    });

    it('should detect multicast MAC', () => {
      expect(MacAddress.fromString('01:BB:CC:DD:EE:FF').isMulticast()).toBe(true);
    });
  });

  describe('isBroadcast', () => {
    it('should detect broadcast MAC', () => {
      expect(MacAddress.fromString('FF:FF:FF:FF:FF:FF').isBroadcast()).toBe(true);
      expect(MacAddress.fromString('AA:BB:CC:DD:EE:FF').isBroadcast()).toBe(false);
    });
  });

  describe('toString', () => {
    it('should support different formats', () => {
      const mac = MacAddress.fromString('AA:BB:CC:DD:EE:FF');
      expect(mac.toString('-')).toBe('AA-BB-CC-DD-EE-FF');
      expect(mac.toString('.')).toBe('AA.BB.CC.DD.EE.FF');
      expect(mac.toString('none')).toBe('AABBCCDDEEFF');
    });
  });
});
