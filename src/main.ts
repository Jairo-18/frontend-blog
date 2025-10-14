import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

window.addEventListener('unhandledrejection', (event) => {
  if (event.reason?.message?.includes('message channel closed')) {
    event.preventDefault();
    console.warn('Extension error suppressed:', event.reason);
  }
});

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
