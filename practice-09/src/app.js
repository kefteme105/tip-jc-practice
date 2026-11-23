import express from 'express';
import { createStore } from './store.js';
import { createRouter } from './routes.js';
import { ApiError, errorHandler } from './errors.js';

export function createApp({ store = createStore(), enableTaskCreation = false } = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.disable('etag');
  app.set('case sensitive routing', true);
  app.use((req, res, next) => {
    res.set({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': enableTaskCreation ? 'GET, HEAD, OPTIONS, POST' : 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Accept, Content-Type',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    });
    if (req.method === 'OPTIONS') return res.status(204).end();
    next();
  });
  if (enableTaskCreation) {
    app.use(express.json({ limit: '16kb' }));
    app.use((error, req, res, next) => next(new ApiError(
      error.status === 413 ? 413 : 400, 'INVALID_JSON', 'Некорректное JSON-тело запроса.'
    )));
  }
  app.use('/api', createRouter(store, enableTaskCreation));
  app.use((req, res, next) => next(new ApiError(404, 'ROUTE_NOT_FOUND', 'Маршрут не найден.')));
  app.use(errorHandler);
  return app;
}
