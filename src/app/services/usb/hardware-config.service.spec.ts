import { TestBed } from '@angular/core/testing';
import { HardwareConfigService } from './hardware-config.service';
import { HardwareConfigMapper } from './hardware-config.mapper';
import { SerialService } from './serial.service';
import { MODULE_DESCRIPTOR_REGISTRY } from './module-descriptor-registry';
import { createModuleDescriptor } from './module-descriptor';
import { FlowchartState, SynthNode } from '../../store/reducers';

const vcoDescriptor = createModuleDescriptor({
  type: 'vco',
  hwModuleId: 1056,
  outputs: [{ name: 'out', hwPortName: 'analog' }],
  args: { frequency: { key: 'center_freq' } },
});

const state: FlowchartState = {
  nodes: [
    {
      id: 'a',
      type: 'vco',
      position: { x: 0, y: 0 },
      config: {
        waveform: 'sine',
        frequency: 440,
        pw: 0.5,
        inputs: { cv: 'cv-a' },
        outputs: { out: 'out-a' },
      },
    } as unknown as SynthNode,
  ],
  connections: [],
};

const graph = { modules: [{ id: 1056, args: { center_freq: '440' } }], connections: [] };

describe('HardwareConfigService', () => {
  let service: HardwareConfigService;
  let mapper: jasmine.SpyObj<HardwareConfigMapper>;
  let serial: jasmine.SpyObj<SerialService>;

  beforeEach(() => {
    mapper = jasmine.createSpyObj<HardwareConfigMapper>('HardwareConfigMapper', [
      'toHardwareConfig',
    ]);
    serial = jasmine.createSpyObj<SerialService>('SerialService', ['send']);
    (serial.send as jasmine.Spy).and.resolveTo();

    TestBed.configureTestingModule({
      providers: [
        HardwareConfigService,
        { provide: HardwareConfigMapper, useValue: mapper },
        { provide: SerialService, useValue: serial },
        {
          provide: MODULE_DESCRIPTOR_REGISTRY,
          useValue: { getDescriptor: (type: string) => (type === 'vco' ? vcoDescriptor : undefined) },
        },
      ],
    });

    service = TestBed.inject(HardwareConfigService);
  });

  it('maps flowcharts to compact JSON and sends it to the serial service', async () => {
    (mapper.toHardwareConfig as jasmine.Spy).and.returnValue(graph);

    await service.send(state);

    expect(mapper.toHardwareConfig).toHaveBeenCalled();
    expect(serial.send).toHaveBeenCalledWith(JSON.stringify(graph));
  });

  it('loads a descriptor for each node type from the registry', async () => {
    (mapper.toHardwareConfig as jasmine.Spy).and.returnValue(graph);

    await service.send(state);

    expect(mapper.toHardwareConfig).toHaveBeenCalledWith(state, [vcoDescriptor]);
  });

  it('sends an empty graph when there are no nodes', async () => {
    (mapper.toHardwareConfig as jasmine.Spy).and.returnValue({ modules: [], connections: [] });

    await service.send({ nodes: [], connections: [] });

    expect(serial.send).toHaveBeenCalledWith('{"modules":[],"connections":[]}');
  });

  it('propagates errors thrown by the mapper', async () => {
    (mapper.toHardwareConfig as jasmine.Spy).and.callFake(() => {
      throw new Error('boom');
    });

    await expectAsync(service.send(state)).toBeRejectedWithError('boom');
  });

  it('propagates errors thrown by the serial service', async () => {
    (mapper.toHardwareConfig as jasmine.Spy).and.returnValue(graph);
    (serial.send as jasmine.Spy).and.rejectWith(new Error('not connected'));

    await expectAsync(service.send(state)).toBeRejectedWithError('not connected');
  });
});
