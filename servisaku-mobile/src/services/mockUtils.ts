import { config } from '@/config/env';

/** Simulate realistic network latency for mock service calls. */
export function latency(): Promise<void> {
  const { min, max } = config.MOCK_LATENCY;
  const ms = min + Math.random() * (max - min);
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Resolve a value after a simulated round-trip. Deep-clones to mimic JSON I/O. */
export async function mockResponse<T>(data: T): Promise<T> {
  await latency();
  return JSON.parse(JSON.stringify(data)) as T;
}

let idCounter = 1000;
/** Generate a pseudo-unique id for newly created mock entities. */
export const mockId = (prefix: string): string => `${prefix}_${++idCounter}`;
