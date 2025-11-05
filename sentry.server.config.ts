import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Environment
  environment: process.env.NODE_ENV || 'development',

  // Ignore common errors
  ignoreErrors: [
    'ECONNREFUSED',
    'ENOTFOUND',
    'ETIMEDOUT',
  ],

  // Filter out local/development errors in production
  beforeSend(event, hint) {
    // Don't send events if Sentry is not configured
    if (!SENTRY_DSN) {
      return null;
    }

    // Add extra context for server-side errors
    if (event.exception) {
      const error = hint.originalException;
      if (error instanceof Error) {
        event.extra = {
          ...event.extra,
          errorMessage: error.message,
          errorStack: error.stack,
        };
      }
    }

    return event;
  },
});
