import * as Sentry from '@sentry/nestjs';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
const isProduction = process.env['NODE_ENV'] === 'production';
if (isProduction)
  Sentry.init({
    dsn: process.env['SENTRY_DSN'],
    integrations: [nodeProfilingIntegration()],
    environment: process.env['NODE_ENV'],
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0,
  });
