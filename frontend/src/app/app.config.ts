import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
//import { provideRouter } from '@angular/router';
import { provideAnimations} from '@angular/platform-browser/animations'

import { provideHttpClient, withFetch } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideHttpClient(withFetch()),
    provideAnimations()
  ]
};
