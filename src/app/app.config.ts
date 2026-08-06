import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';
import { provideState, provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { flowchartReducer } from './store/reducers';
import { FlowchartEffects } from './store/effects';
import { FileService } from './services/file.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideStore(),
    provideState({ name: 'flowchart', reducer: flowchartReducer }),
    provideEffects([FlowchartEffects]),
    FileService,
    provideHttpClient(),
    { provide: 'Window', useValue: window }
  ]
};
