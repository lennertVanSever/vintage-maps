import './webcomponents/index.js';
import * as Sentry from '@sentry/browser';
import { Integrations } from '@sentry/tracing';
import { Map } from './map/index.js';

Sentry.init({
  dsn:
    'https://37708f2c5927483aa1cbef5e7bac5a2a@o557529.ingest.sentry.io/5689898',
  release: 'vintage-map',
  integrations: [new Integrations.BrowserTracing()],
  tracesSampleRate: 1.0,
});

export const map = new Map();
