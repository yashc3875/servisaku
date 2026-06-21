// Single source for the dynamic booking engine's global settings + catalogue.
// Reads the vendored servisaku-services-config.json (the master config the seed
// also imports), so fee/surcharge defaults and the config version stay in lock-
// step with the seeded catalogue. Ops can later override fees via PriceRule rows;
// this is the fallback/default layer.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const bookingEngineConfig = JSON.parse(
  readFileSync(join(__dirname, '../../prisma/data/servisaku-services-config.json'), 'utf8'),
);

export const CONFIG_VERSION = bookingEngineConfig.version || '1.0';
export const GLOBAL_CONFIG = {
  currency: bookingEngineConfig.currency || 'MYR',
  ...bookingEngineConfig.globalConfig,
};
