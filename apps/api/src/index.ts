import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { json } from 'body-parser';
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

app.use('/healthcheck', healthcheckRouter);
app.use('/health', healthcheckRouter); // Render health check endpoint
app.use('/simulate', simulateRouter);
app.use('/reports', reportsRouter);
app.use('/benchmarks', benchmarksRouter);
app.use('/telemetry', telemetryRouter);
app.use('/admin', adminRouter);
app.use('/scenarios', scenariosRouter);
app.use('/v2', v2Router);
app.use('/content', contentRouter);

app.use(errorHandler);

const PORT = process.env.PORT || process.env.API_PORT || 4000;
app.listen(PORT, () => {
  logger.info(`API server running on port ${PORT}`);
});
