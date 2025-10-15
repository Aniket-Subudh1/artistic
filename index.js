const axios = require('axios');
require('dotenv').config();

async function sendSms({ username, password, sender, mobile, message, test }) {
  if (!username || !password) throw new Error('Missing KWT_USERNAME or KWT_PASSWORD env vars.');
  if (!sender) throw new Error('Missing KWT_SENDER env var.');
  if (!mobile) throw new Error('Missing destination mobile number.');
  if (!message) throw new Error('Missing message text.');

  const url = 'https://www.kwtsms.com/API/send/';
  const payload = {
    username,
    password,
    sender,
    mobile,        
    lang: '1',      
    test: test ? '1' : '0',
    message
  };

  try {
    const resp = await axios.post(url, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 15000,
      httpsAgent: new (require('https').Agent)({ keepAlive: true })
    });

    console.log('HTTP status:', resp.status);
    console.log('Response data:', JSON.stringify(resp.data, null, 2));
    return resp.data;
  } catch (err) {
    if (err.response) {
      console.error('API returned error status:', err.response.status);
      console.error('Body:', err.response.data);
    } else {
      console.error('Request error:', err.message);
    }
    throw err;
  }
}

(async () => {
  const mobile = '96599213471';

  const username = process.env.KWT_USERNAME;
  const password = process.env.KWT_PASSWORD;
  const sender = process.env.KWT_SENDER || 'KWT-SMS';
  const testMode = (process.env.TEST_MODE === '1');

  const message = `Test SMS to +965 57775487 sent at ${new Date().toISOString()}`;

  try {
    const result = await sendSms({
      username,
      password,
      sender,
      mobile,
      message,
      test: testMode
    });

    if (result && result.result === 'OK') {
      console.log('Send queued/sent successfully. Message ID:', result['msg-id'] || '(none returned)');
    } else {
      console.log('Send result:', result);
    }
  } catch (e) {
    console.error('Failed to send SMS. See errors above.');
  }
})();
