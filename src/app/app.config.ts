import { ApplicationConfig, inject, provideAppInitializer, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';
import { provideState, provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { flowchartReducer } from './store/reducers';
import { FlowchartEffects } from './store/effects';
import { hardwareReducer } from './store/hardware.reducer';
import { HardwareEffects } from './store/hardware.effects';
import { FileService } from './services/file.service';
import { HardwareConfigService } from './services/usb/hardware-config.service';
import { NodeDefinitionService } from './nodes/node-definition.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    // Blocks bootstrap until the definitions folder has been read, which is
    // what lets NodeDefinitionService.getDefinitions() stay synchronous for
    // the components that read it in field initializers.
    provideAppInitializer(() => inject(NodeDefinitionService).load()),
    provideRouter(routes),
    provideStore(),
    provideState({ name: 'flowchart', reducer: flowchartReducer }),
    provideState({ name: 'hardware', reducer: hardwareReducer }),
    provideEffects([FlowchartEffects, HardwareEffects]),
    FileService,
    HardwareConfigService,
    provideHttpClient(),
    { provide: 'Window', useValue: window },
  ]
};
