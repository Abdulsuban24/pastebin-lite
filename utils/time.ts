// utils/time.ts
export function getCurrentTimeMs(req?: Request): number {
  if (process.env.TEST_MODE === '1' && req) {
    const testNow = req.headers.get('x-test-now-ms');
    if (testNow) {
      const parsed = parseInt(testNow, 10);
      if (!isNaN(parsed)) return parsed;
    }
  }
  return Date.now();
}