import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { config } from './app/app.config.server';

const bootstrap = (...args: any[]) => bootstrapApplication(AppComponent, config, ...args);

export default bootstrap;
