/**
 * Lightweight analytics & crash logging service.
 * Replace the console calls with Sentry or Firebase Crashlytics for production.
 *
 * Setup Sentry (recommended):
 *   npm install sentry-expo
 *   Then initialise in App.js with your DSN.
 */

const errorLog = [];

export function logError(error, context = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    message: error?.message || String(error),
    stack: error?.stack,
    context,
  };
  errorLog.push(entry);
  console.error('[AutoCard Error]', entry.message, context);

  // TODO: Sentry.captureException(error);
}

export function logEvent(eventName, params = {}) {
  console.log('[AutoCard Event]', eventName, params);

  // TODO: analytics().logEvent(eventName, params);
}

export function getErrorLog() {
  return [...errorLog];
}
