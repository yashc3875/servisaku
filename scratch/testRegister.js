import { createClient } from '@base44/sdk';

const base44 = createClient({ appId: 'yashchavan-group/yashchavan-project', serverUrl: 'https://base44.app' });

async function test() {
  try {
    const res = await base44.auth.register({
      email: `test_${Date.now()}@test.com`,
      password: 'Password123!',
      full_name: 'Test User'
    });
    console.log('Success!', res);
  } catch (err) {
    console.error('Error:', err.response?.data || err.message);
  }
}

test();
