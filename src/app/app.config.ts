import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async'; 
import { providePrimeNG } from 'primeng/config';

import { routes } from './app.routes';
import Lara from '@primeuix/themes/lara';
import { provideServiceWorker } from '@angular/service-worker';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    providePrimeNG({
            theme: {
                preset: Lara,
                options: {
                  darkModeSelector: 'none',
                  cssLayer: {
                    name: 'primeng',
                    order: 'tailwind-base, primeng, tailwind-utilities'
                  }
                }
            }
        }), provideServiceWorker('ngsw-worker.js', {
            enabled: !isDevMode(),
            registrationStrategy: 'registerImmediately' //en produccion cambiar 
          })
  ]
};
