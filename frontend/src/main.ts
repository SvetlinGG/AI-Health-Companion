import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { NavbarComponent } from './app/navbar.component';
import { routes } from './app/app.routes';
import { appConfig } from './app/app.config';
import { SpeedInsights } from "@vercel/speed-insights/next"

bootstrapApplication(NavbarComponent, {
  providers: [
    provideRouter(routes),
    ...appConfig.providers
  ]
})
  .catch((err) => console.error(err));
