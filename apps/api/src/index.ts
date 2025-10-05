import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { json } from 'body-parser';
import path from 'node:path';
import { loadEnv } from './utils/env';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { validateRequest } from './middleware/validateRequest';
import { v1DeprecationMiddleware } from './middleware/v1Deprecation';
import healthcheckRouter from './routes/healthcheck';
import simulateRouter from './routes/simulate';
import reportsRouter from './routes/reports';
import benchmarksRouter from './routes/benchmarks';
import telemetryRouter from './routes/telemetry';
import adminRouter from './routes/admin';
import scenariosRouter from './routes/scenarios';
import v2Router from './routes/v2';
import contentRouter from './routes/content';

loadEnv();

const app = express();
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: false
}));
app.use(morgan('dev', { stream: logger.stream }));
app.use(json());
app.use(validateRequest);
app.use(v1DeprecationMiddleware);

// Mount all API routes under /api prefix
app.use('/api/healthcheck', healthcheckRouter);
app.use('/api/health', healthcheckRouter); // Docker/standard health endpoint
app.use('/api/simulate', simulateRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/benchmarks', benchmarksRouter);
app.use('/api/telemetry', telemetryRouter);
app.use('/api/admin', adminRouter);
app.use('/api/scenarios', scenariosRouter);
app.use('/api/v2', v2Router);
app.use('/api/content', contentRouter);

// Legacy routes for backward compatibility (Render deployment)
app.use('/healthcheck', healthcheckRouter);
app.use('/health', healthcheckRouter);
app.use('/simulate', simulateRouter);
app.use('/reports', reportsRouter);
app.use('/benchmarks', benchmarksRouter);
app.use('/telemetry', telemetryRouter);
app.use('/admin', adminRouter);
app.use('/scenarios', scenariosRouter);
app.use('/v2', v2Router);
app.use('/content', contentRouter);

// Serve SPA static files (in production/Docker mode)
const DIST = path.resolve(__dirname, '../../../web/dist');
app.use(express.static(DIST, { maxAge: '1h', index: 'index.html' }));

// SPA fallback: anything that is NOT /api/* should serve index.html
app.get(/^(?!\/api\/).*/, (_req, res) => {
  res.sendFile(path.join(DIST, 'index.html'));
});

app.use(errorHandler);

const PORT = process.env.PORT || process.env.API_PORT || 4000;
app.listen(PORT, () => {
  logger.info(`API server running on port ${PORT}`);
});
