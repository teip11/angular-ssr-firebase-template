import { bootstrapApplication, BootstrapContext } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { config } from './app/app.config.server';

// Angular 19.2: The build tool passes a BootstrapContext as the first argument
// to the default export. It MUST be forwarded as the third arg to
// bootstrapApplication so the server platform is correctly initialised.
// Without this, NG0401 (Missing Platform) is thrown during route extraction.
const bootstrap = (context: BootstrapContext) =>
  bootstrapApplication(AppComponent, config, context);

export default bootstrap;
