import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { maskSecret } from '../../src/utils/output.js';

describe('output', () => {
  describe('maskSecret', () => {
    it('masks keys longer than 8 chars', () => {
      const masked = maskSecret('sk_abcdefghijklmnop');
      expect(masked).toBe('sk_abcde...');
    });

    it('returns *** for short keys', () => {
      expect(maskSecret('abc')).toBe('***');
    });
  });

  describe('printResult', () => {
    let writeSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      writeSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('prints string directly', async () => {
      const { printResult } = await import('../../src/utils/output.js');
      printResult('hello world');
      expect(writeSpy).toHaveBeenCalledWith('hello world\n');
    });

    it('prints JSON when json option is set', async () => {
      const { printResult } = await import('../../src/utils/output.js');
      printResult({ key: 'value' }, { json: true });
      const call = writeSpy.mock.calls[0]?.[0] as string;
      expect(JSON.parse(call)).toEqual({ key: 'value' });
    });
  });

  describe('printError', () => {
    it('writes to stderr with Error prefix', async () => {
      const stderrSpy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
      const { printError } = await import('../../src/utils/output.js');
      printError('something went wrong');
      expect(stderrSpy).toHaveBeenCalledWith('Error: something went wrong\n');
      stderrSpy.mockRestore();
    });
  });
});
