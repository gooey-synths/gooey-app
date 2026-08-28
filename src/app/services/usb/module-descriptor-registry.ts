import { Injectable, InjectionToken } from '@angular/core';
import { ModuleDescriptor } from './module-descriptor';

export interface ModuleDescriptorRegistry {
  getDescriptor(type: string): ModuleDescriptor | undefined;
}

export const MODULE_DESCRIPTOR_REGISTRY = new InjectionToken<ModuleDescriptorRegistry>(
  'MODULE_DESCRIPTOR_REGISTRY',
);

const EMPTY: ModuleDescriptor[] = [];

@Injectable({ providedIn: 'root' })
export class DefaultModuleDescriptorRegistry implements ModuleDescriptorRegistry {
  getDescriptor(): ModuleDescriptor | undefined {
    return undefined;
  }

  all(): ModuleDescriptor[] {
    return EMPTY;
  }
}
