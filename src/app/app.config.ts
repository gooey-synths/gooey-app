import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
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
import { HardwareConfigMapper } from './services/usb/hardware-config.mapper';
import {
  DefaultModuleDescriptorRegistry,
  MODULE_DESCRIPTOR_REGISTRY,
} from './services/usb/module-descriptor-registry';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideStore(),
    provideState({ name: 'flowchart', reducer: flowchartReducer }),
    provideState({ name: 'hardware', reducer: hardwareReducer }),
    provideEffects([FlowchartEffects, HardwareEffects]),
    FileService,
    HardwareConfigService,
    provideHttpClient(),
    { provide: 'Window', useValue: window },
    { provide: MODULE_DESCRIPTOR_REGISTRY, useClass: DefaultModuleDescriptorRegistry },
    { provide: HardwareConfigMapper, useFactory: () => new HardwareConfigMapper() },
  ]
};
