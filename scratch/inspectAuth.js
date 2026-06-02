import { createClient } from '@base44/sdk';

const base44 = createClient({ appId: 'demo-app', serverUrl: 'https://base44.app' });
console.log('loginViaEmailPassword:', base44.auth.loginViaEmailPassword.toString());
console.log('updateMe:', base44.auth.updateMe.toString());
