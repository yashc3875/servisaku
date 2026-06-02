import { createClient } from '@base44/sdk';

const base44 = createClient({ appId: 'demo-app', serverUrl: 'https://base44.app' });
console.log('loginWithProvider:', base44.auth.loginWithProvider.toString());
console.log('resendOtp:', base44.auth.resendOtp.toString());
console.log('verifyOtp:', base44.auth.verifyOtp.toString());
