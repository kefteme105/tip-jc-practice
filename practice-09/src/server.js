import { createApp } from './app.js';

const raw = process.argv[2] ?? process.env.API_PORT ?? '5505';
const port = Number(raw);
if (!/^\d+$/.test(raw) || !Number.isInteger(port) || port < 1024 || port > 65535) {
  console.error('Порт должен быть целым числом от 1024 до 65535.');
  process.exit(1);
}
const enableTaskCreation = process.env.KR3_MODE === '1';
const server = createApp({ enableTaskCreation }).listen(port, '127.0.0.1', () => {
  console.log(`API ПР9: http://127.0.0.1:${port}/api`);
  console.log(enableTaskCreation ? 'Режим КР3: чтение и POST с валидацией.' : 'Остановка: Ctrl+C. В ПР9 доступны только операции чтения.');
});
server.on('error', error => {
  console.error(error.code === 'EADDRINUSE' ? `Порт ${port} занят.` : error.message);
  process.exitCode = 1;
});
