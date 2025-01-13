import * as Sentry from '@sentry/nestjs';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
const isProduction = process.env['NODE_ENV'] === 'production';
if (isProduction)
  Sentry.init({
    dsn: process.env['SENTRY_DSN'],
    integrations: [
      // Add our Profiling integration
      nodeProfilingIntegration(),
    ],
    environment: process.env['NODE_ENV'],
    // Add Tracing by setting tracesSampleRate
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
    // Set sampling rate for profiling
    // This is relative to tracesSampleRate
    profilesSampleRate: 1.0,
  });
