import { Injectable, inject } from '@angular/core';
import { HardwareConfigMapper, validateGraphDescription } from './hardware-config.mapper';
import { SerialService } from './serial.service';
import {
  ModuleDescriptorRegistry,
  MODULE_DESCRIPTOR_REGISTRY,
} from './module-descriptor-registry';
import { ModuleDescriptor } from './module-descriptor';
import { FlowchartState } from '../../store/reducers';

@Injectable({ providedIn: 'root' })
export class HardwareConfigService {
  private mapper = inject(HardwareConfigMapper);
  private serial = inject(SerialService);
  private registry = inject(MODULE_DESCRIPTOR_REGISTRY) as ModuleDescriptorRegistry;

  async send(state: FlowchartState): Promise<void> {
    const descriptors = this.loadDescriptors(state);
    const graph = this.mapper.toHardwareConfig(state, descriptors);
    validateGraphDescription(graph);
    const json = JSON.stringify(graph);
    await this.serial.send(json);
  }

  private loadDescriptors(state: FlowchartState): ModuleDescriptor[] {
    const types = [...new Set(state.nodes.map((node) => node.type))];
    return types
      .map((type) => this.registry.getDescriptor(type))
      .filter((d): d is ModuleDescriptor => d !== undefined);
  }
}
