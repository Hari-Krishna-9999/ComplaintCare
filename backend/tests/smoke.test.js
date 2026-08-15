const test = require('node:test');
const assert = require('node:assert/strict');
const app = require('../app');

const makeRequest = async (method, path) => {
  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  const { port } = server.address();

  try {
    const response = await fetch(`http://127.0.0.1:${port}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const text = await response.text();
    return { status: response.status, body: text };
  } finally {
    await new Promise((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  }
};

test('GET /api/health returns success payload', async () => {
  const result = await makeRequest('GET', '/api/health');
  assert.equal(result.status, 200);
  const payload = JSON.parse(result.body);
  assert.equal(payload.success, true);
  assert.equal(payload.message, 'ComplaintCare API is running');
});

test('GET /api returns success payload', async () => {
  const result = await makeRequest('GET', '/api');
  assert.equal(result.status, 200);
  const payload = JSON.parse(result.body);
  assert.equal(payload.success, true);
});
