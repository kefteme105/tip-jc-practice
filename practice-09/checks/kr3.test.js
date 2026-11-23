import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';

test('КР3: валидация POST и продолжение работы после ошибки', async () => {
  const server = createApp({ enableTaskCreation: true }).listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const base = 'http://127.0.0.1:' + server.address().port + '/api';
  try {
    for (const draft of [{}, { title: '   ' }, { title: 123 }, null]) {
      const response = await fetch(base + '/tasks', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(draft),
      });
      assert.equal(response.status, 400);
      const payload = await response.json();
      assert.ok(['VALIDATION_ERROR', 'INVALID_JSON'].includes(payload.error.code));
    }
    const health = await fetch(base + '/health');
    assert.equal(health.status, 200);
    const created = await fetch(base + '/tasks', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: '  Проверка КР3  ', priority: 'high', categoryId: 2 }),
    });
    assert.equal(created.status, 201);
    assert.equal((await created.json()).data.title, 'Проверка КР3');
    const list = await (await fetch(base + '/tasks')).json();
    assert.equal(list.meta.total, 13);
  } finally { await new Promise(resolve => server.close(resolve)); }
});
