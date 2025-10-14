// dlr-check.js
// Usage:
//   node dlr-check.js <msg-id>
// Example:
//   node dlr-check.js 34f8007ad6921faf28bdbd72b154487e

const axios = require('axios');
require('dotenv').config();

const KWT_USERNAME = process.env.KWT_USERNAME;
const KWT_PASSWORD = process.env.KWT_PASSWORD;

function assertEnv() {
  const missing = [];
  if (!KWT_USERNAME) missing.push('KWT_USERNAME');
  if (!KWT_PASSWORD) missing.push('KWT_PASSWORD');
  if (missing.length) {
    console.error(`[ERROR] Missing env vars: ${missing.join(', ')}`);
    console.error('Create a .env file with the required variables or export them in your shell.');
    process.exit(1);
  }
}

async function postJson(url, payload) {
  return axios.post(url, payload, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 15000,
    httpsAgent: new (require('https').Agent)({ keepAlive: true })
  });
}

async function checkDlr(msgId) {
  const url = 'https://www.kwtsms.com/API/dlr/';
  const payload = {
    username: KWT_USERNAME,
    password: KWT_PASSWORD,
    'msg-id': msgId
  };
  const resp = await postJson(url, payload);
  return resp.data;
}

async function checkBalance() {
  const url = 'https://www.kwtsms.com/API/balance/';
  const payload = { username: KWT_USERNAME, password: KWT_PASSWORD };
  const resp = await postJson(url, payload);
  return resp.data;
}

async function checkSenderId() {
  const url = 'https://www.kwtsms.com/API/senderid/';
  const payload = { username: KWT_USERNAME, password: KWT_PASSWORD };
  const resp = await postJson(url, payload);
  return resp.data;
}

(async () => {
  assertEnv();

  const msgId = process.argv[2];
  if (!msgId) {
    console.error('Usage: node dlr-check.js <msg-id>');
    process.exit(1);
  }

  try {
    console.log('Checking DLR for msg-id:', msgId);
    const dlr = await checkDlr(msgId);
    console.log('DLR response:', JSON.stringify(dlr, null, 2));

    console.log('\nChecking account balance...');
    const bal = await checkBalance();
    console.log('Balance response:', JSON.stringify(bal, null, 2));

    console.log('\nChecking sender IDs...');
    const sids = await checkSenderId();
    console.log('SenderID response:', JSON.stringify(sids, null, 2));

    // Small interpretation helper:
    if (dlr && dlr.status) {
      console.log('\nHuman-readable DLR status:', dlr.status);
    } else if (dlr && dlr.result === 'ERROR') {
      console.warn('\nDLR returned ERROR:', dlr.code, dlr.description || '');
    } else {
      console.log('\nDLR returned (full):', dlr);
    }
  } catch (err) {
    if (err.response) {
      console.error('API returned error status:', err.response.status);
      console.error('Body:', JSON.stringify(err.response.data, null, 2));
    } else {
      console.error('Request error:', err.message);
    }
    process.exit(1);
  }
})();
