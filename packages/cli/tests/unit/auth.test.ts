import { describe, it, expect } from 'vitest';
import { maskSecret } from '../../src/utils/auth.js';

describe('auth', () => {
  describe('maskSecret', () => {
    it('masks keys longer than 8 chars', () => {
      expect(maskSecret('sk_abcdefghijklmnop')).toBe('sk_abcde...');
    });

    it('returns *** for short keys', () => {
      expect(maskSecret('short')).toBe('***');
    });

    it('returns *** for exactly 8 chars', () => {
      expect(maskSecret('12345678')).toBe('***');
    });

    it('masks a real-format key', () => {
      const key = 'sk_' + 'a'.repeat(48);
      const masked = maskSecret(key);
      expect(masked).toBe('sk_aaaaa...');
      expect(masked).not.toContain(key);
    });
  });
});
