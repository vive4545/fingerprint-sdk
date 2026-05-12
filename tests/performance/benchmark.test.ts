import { test, expect } from '@playwright/test';
import fs from 'fs';
import zlib from 'zlib';
import { promisify } from 'util';

const gzip = promisify(zlib.gzip);

test.describe('Performance Benchmarks', () => {
  test('bundle size should be under 20KB gzipped', async () => {
    const bundlePath = './dist/index.js';
    if (!fs.existsSync(bundlePath)) {
      console.log('Bundle not found, skipping size check');
      return;
    }
    const bundle = fs.readFileSync(bundlePath);
    const compressed = await gzip(bundle);
    const sizeKB = compressed.length / 1024;
    
    console.log(`Gzipped Bundle Size: ${sizeKB.toFixed(2)} KB`);
    expect(sizeKB).toBeLessThan(20);
  });
});
