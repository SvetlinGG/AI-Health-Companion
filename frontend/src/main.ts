import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { NavbarComponent } from './app/navbar.component';
import { provideRouter } from '@angular/router';
import { routes} from './app/app.routes'

bootstrapApplication(NavbarComponent, {
  providers: [
    provideRouter(routes),
    ...appConfig.providers
  ]
})
  .catch((err) => console.error(err));
