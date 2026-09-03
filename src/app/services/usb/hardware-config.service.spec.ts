import { TestBed } from '@angular/core/testing';
import { HardwareConfigService } from './hardware-config.service';
import { SerialService } from './serial.service';

describe('HardwareConfigService', () => {
  let service: HardwareConfigService;
  let serial: jasmine.SpyObj<SerialService>;

  beforeEach(() => {
    serial = jasmine.createSpyObj<SerialService>('SerialService', ['send']);
    (serial.send as jasmine.Spy).and.resolveTo();

    TestBed.configureTestingModule({
      providers: [HardwareConfigService, { provide: SerialService, useValue: serial }],
    });

    service = TestBed.inject(HardwareConfigService);
  });

  it('sends the hardcoded payload to the serial service', async () => {
    await service.send();

    const expected = {
      modules: [
        { name: 'ai0', id: 2, args: { idx: '0' } },
        { name: 'ai1', id: 2, args: { idx: '1' } },
        { name: 'ai2', id: 2, args: { idx: '2' } },
        { name: 'ai3', id: 2, args: { idx: '3' } },
        { name: 'ai4', id: 2, args: { idx: '4' } },
        { name: 'ai5', id: 2, args: { idx: '5' } },
        { name: 'ai6', id: 2, args: { idx: '6' } },
        { name: 'ai7', id: 2, args: { idx: '7' } },
        { name: 'ao0', id: 1, args: { idx: '0' } },
        { name: 'ao1', id: 1, args: { idx: '1' } },
        { name: 'ao2', id: 1, args: { idx: '2' } },
        { name: 'ao3', id: 1, args: { idx: '3' } },
        { name: 'ao4', id: 1, args: { idx: '4' } },
        { name: 'ao5', id: 1, args: { idx: '5' } },
        { name: 'ao6', id: 1, args: { idx: '6' } },
        { name: 'ao7', id: 1, args: { idx: '7' } },
        { name: 'di0', id: 4, args: { idx: '0' } },
        { name: 'di1', id: 4, args: { idx: '1' } },
        { name: 'di2', id: 4, args: { idx: '2' } },
        { name: 'di3', id: 4, args: { idx: '3' } },
        { name: 'do0', id: 3, args: { idx: '0' } },
        { name: 'do1', id: 3, args: { idx: '1' } },
        { name: 'do2', id: 3, args: { idx: '2' } },
        { name: 'do3', id: 3, args: { idx: '3' } },
      ],
      connections: [
        { input_mod: 8, input_port_name: 'out', output_mod: 0, output_port_name: 'in' },
        { input_mod: 9, input_port_name: 'out', output_mod: 1, output_port_name: 'in' },
        { input_mod: 10, input_port_name: 'out', output_mod: 2, output_port_name: 'in' },
        { input_mod: 11, input_port_name: 'out', output_mod: 3, output_port_name: 'in' },
        { input_mod: 12, input_port_name: 'out', output_mod: 4, output_port_name: 'in' },
        { input_mod: 13, input_port_name: 'out', output_mod: 5, output_port_name: 'in' },
        { input_mod: 14, input_port_name: 'out', output_mod: 6, output_port_name: 'in' },
        { input_mod: 15, input_port_name: 'out', output_mod: 7, output_port_name: 'in' },
        { input_mod: 20, input_port_name: 'out', output_mod: 16, output_port_name: 'in' },
        { input_mod: 21, input_port_name: 'out', output_mod: 17, output_port_name: 'in' },
        { input_mod: 22, input_port_name: 'out', output_mod: 18, output_port_name: 'in' },
        { input_mod: 23, input_port_name: 'out', output_mod: 19, output_port_name: 'in' },
      ],
    };
    expect(serial.send).toHaveBeenCalledWith(JSON.stringify(expected));
  });

  it('propagates errors thrown by the serial service', async () => {
    (serial.send as jasmine.Spy).and.rejectWith(new Error('not connected'));

    await expectAsync(service.send()).toBeRejectedWithError('not connected');
  });
});
