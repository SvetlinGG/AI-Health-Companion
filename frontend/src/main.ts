import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/navbar.component';
import { provideRouter } from '@angular/router';

bootstrapApplication(NavbarComponent, {
  providers: [
    provideRouter(appRoutes),
    ...appConfig.providers
  ]
})
  .catch((err) => console.error(err));
