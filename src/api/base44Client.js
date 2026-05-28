import { createClient } from '@base44/sdk';

const appId = import.meta.env.VITE_BASE44_APP_ID || 'demo-app';
const serverUrl = import.meta.env.VITE_BASE44_BACKEND_URL || import.meta.env.VITE_BASE44_APP_BASE_URL || 'https://base44.app';

export const base44 = createClient({
  appId,
  serverUrl,
});

export default base44;
