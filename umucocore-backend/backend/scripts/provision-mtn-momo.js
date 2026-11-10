/**
 * MTN MoMo sandbox provisioning.
 *
 * Walks the full credential chain using only your subscription key:
 *   1. Create an API user           → POST /v1_0/apiuser
 *   2. Get the API key               → POST /v1_0/apiuser/{id}/apikey
 *   3. Get an access token (verify)  → POST /collection/v1_0/   (Basic auth)
 *   4. Test request-to-pay           → POST /collection/v1_0/requesttopay
 *   5. Check payment status          → GET  /collection/v1_0/requesttopay/{ref}
 *
 * Writes the API user + API key back into .env automatically.
 *
 * Usage:  node scripts/provision-mtn-momo.js
 */
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Load .env (dotenv is already in node_modules)
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const BASE_URL = (process.env.MTN_MOMO_BASE_URL || 'https://sandbox.momodeveloper.mtn.com').replace(/\/$/, '');
const SUBSCRIPTION_KEY = process.env.MTN_MOMO_SUBSCRIPTION_KEY;
const CALLBACK_HOST = process.env.MTN_MOMO_CALLBACK_HOST || 'localhost';
const TARGET_ENV = process.env.MTN_MOMO_TARGET_ENV || 'sandbox';

// Test MSISDNs from the MTN sandbox docs:
//   46733123453 → SUCCESS   (we use this one)
//   46733123450 → FAILED
//   46733123451 → REJECTED
//   46733123452 → TIMEOUT
//   46733123454 → PENDING
const TEST_MSISDN = '46733123453';

if (!SUBSCRIPTION_KEY) {
  console.error('✗ MTN_MOMO_SUBSCRIPTION_KEY is not set in backend/.env');
  console.error('  Add your primary subscription key and re-run.');
  process.exit(1);
}

// ─── Step 1: Create API user ─────────────────────────────────────────────────

async function createApiUser() {
  const userId = crypto.randomUUID();
  const res = await fetch(`${BASE_URL}/v1_0/apiuser`, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': SUBSCRIPTION_KEY,
      'X-Reference-Id': userId,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ providerCallbackHost: CALLBACK_HOST }),
  });

  if (res.status !== 201) {
    const text = await res.text().catch(() => '');
    throw new Error(`createApiUser → ${res.status} ${text || '(no body)'}`);
  }

  console.log(`  ✓ API user created: ${userId}`);
  return userId;
}

// ─── Step 2: Get API key ──────────────────────────────────────────────────────

async function getApiKey(userId) {
  const res = await fetch(`${BASE_URL}/v1_0/apiuser/${userId}/apikey`, {
    method: 'POST',
    headers: { 'Ocp-Apim-Subscription-Key': SUBSCRIPTION_KEY },
  });

  if (res.status !== 200 && res.status !== 201) {
    const text = await res.text().catch(() => '');
    throw new Error(`getApiKey → ${res.status} ${text || '(no body)'}`);
  }

  const data = await res.json();
  if (!data.apiKey) throw new Error('getApiKey → response missing apiKey field');

  console.log('  ✓ API key retrieved');
  return data.apiKey;
}

// ─── Step 3: Get access token ────────────────────────────────────────────────

async function getAccessToken(userId, apiKey) {
  const credentials = Buffer.from(`${userId}:${apiKey}`).toString('base64');

  // The collection token endpoint — try with trailing slash first, then /token/
  const endpoints = ['/collection/v1_0/', '/collection/v1_0/token/'];
  for (const ep of endpoints) {
    const res = await fetch(`${BASE_URL}${ep}`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Ocp-Apim-Subscription-Key': SUBSCRIPTION_KEY,
      },
    });

    if (res.status === 200 || res.status === 201) {
      const data = await res.json();
      if (data.access_token) {
        console.log(`  ✓ Access token obtained via ${ep} (expires in ${data.expires_in}s)`);
        return data.access_token;
      }
    }
  }

  throw new Error('getAccessToken → all token endpoints failed');
}

// ─── Step 4: Test request-to-pay ──────────────────────────────────────────────

async function requestToPay(token) {
  const referenceId = crypto.randomUUID();
  const res = await fetch(`${BASE_URL}/collection/v1_0/requesttopay`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Ocp-Apim-Subscription-Key': SUBSCRIPTION_KEY,
      'X-Reference-Id': referenceId,
      'X-Target-Environment': TARGET_ENV,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: '100',
      currency: 'RWF',
      externalId: 'codehills-test-001',
      payer: { partyIdType: 'MSISDN', partyId: TEST_MSISDN },
      payerMessage: 'CodeHills sandbox test',
      payeeNote: 'Sandbox provisioning test',
    }),
  });

  if (res.status !== 202) {
    const text = await res.text().catch(() => '');
    throw new Error(`requestToPay → ${res.status} ${text || '(no body)'}`);
  }

  console.log(`  ✓ Request to pay accepted (ref: ${referenceId})`);
  return referenceId;
}

// ─── Step 5: Check payment status ────────────────────────────────────────────

async function getPaymentStatus(token, referenceId) {
  // Brief delay so the sandbox processes the mock payment
  await new Promise((r) => setTimeout(r, 2000));

  const res = await fetch(`${BASE_URL}/collection/v1_0/requesttopay/${referenceId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Ocp-Apim-Subscription-Key': SUBSCRIPTION_KEY,
      'X-Target-Environment': TARGET_ENV,
    },
  });

  if (res.status !== 200) {
    const text = await res.text().catch(() => '');
    throw new Error(`getPaymentStatus → ${res.status} ${text || '(no body)'}`);
  }

  const data = await res.json();
  console.log(`  ✓ Payment status: ${data.status} (amount: ${data.amount} ${data.currency})`);
  return data;
}

// ─── Update .env ──────────────────────────────────────────────────────────────

function updateEnv(userId, apiKey) {
  const envPath = path.resolve(__dirname, '..', '.env');
  let content = fs.readFileSync(envPath, 'utf8');

  content = content.replace(/MTN_MOMO_API_USER=.*/, `MTN_MOMO_API_USER=${userId}`);
  content = content.replace(/MTN_MOMO_API_KEY=.*/, `MTN_MOMO_API_KEY=${apiKey}`);

  fs.writeFileSync(envPath, content);
  console.log('  ✓ .env updated (MTN_MOMO_API_USER + MTN_MOMO_API_KEY)');
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\nMTN MoMo Sandbox Provisioning');
  console.log('═'.repeat(50));
  console.log(`  Base URL : ${BASE_URL}`);
  console.log(`  Target   : ${TARGET_ENV}`);
  console.log(`  Test No. : ${TEST_MSISDN} (expected: SUCCESS)\n`);

  try {
    console.log('Step 1: Create API user');
    const userId = await createApiUser();

    console.log('Step 2: Get API key');
    const apiKey = await getApiKey(userId);

    console.log('Step 3: Get access token');
    const token = await getAccessToken(userId, apiKey);

    console.log('Step 4: Test request-to-pay');
    const ref = await requestToPay(token);

    console.log('Step 5: Check payment status');
    await getPaymentStatus(token, ref);

    console.log('\nStep 6: Save credentials to .env');
    updateEnv(userId, apiKey);

    console.log('\n' + '═'.repeat(50));
    console.log('Provisioning complete! All 5 steps passed.');
    console.log('Your .env now has MTN_MOMO_API_USER and MTN_MOMO_API_KEY.\n');
  } catch (err) {
    console.error('\n✗ Provisioning failed:', err.message);
    process.exit(1);
  }
}

main();
