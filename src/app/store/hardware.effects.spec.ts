import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of } from 'rxjs';
import { Action } from '@ngrx/store';
import { HardwareEffects } from './hardware.effects';
import {
  connectDevice,
  connectDeviceSuccess,
  connectDeviceFailure,
  disconnectDevice,
  disconnectDeviceSuccess,
  sendToHardware,
  sendToHardwareSuccess,
  sendToHardwareFailure,
} from './hardware.actions';
import { SerialService } from '../services/usb/serial.service';
import { HardwareConfigService } from '../services/usb/hardware-config.service';
import { provideMockStore } from '@ngrx/store/testing';
import { selectAllNodes, selectAllConnections } from './selectors';
import { FlowchartState } from './reducers';

describe('HardwareEffects', () => {
  let actions$ = new Observable<Action>();
  let effects: HardwareEffects;
  let serial: jasmine.SpyObj<SerialService>;
  let hardwareConfig: jasmine.SpyObj<HardwareConfigService>;

  const mockState: FlowchartState = { nodes: [], connections: [] };

  beforeEach(() => {
    serial = jasmine.createSpyObj<SerialService>('SerialService', ['connect', 'disconnect']);
    hardwareConfig = jasmine.createSpyObj<HardwareConfigService>('HardwareConfigService', [
      'send',
    ]);
    (serial.connect as jasmine.Spy).and.resolveTo();
    (serial.disconnect as jasmine.Spy).and.resolveTo();
    (hardwareConfig.send as jasmine.Spy).and.resolveTo();

    TestBed.configureTestingModule({
      providers: [
        HardwareEffects,
        provideMockStore({
          selectors: [
            { selector: selectAllNodes, value: mockState.nodes },
            { selector: selectAllConnections, value: mockState.connections },
          ],
        }),
        provideMockActions(() => actions$),
        { provide: SerialService, useValue: serial },
        { provide: HardwareConfigService, useValue: hardwareConfig },
      ],
    });

    effects = TestBed.inject(HardwareEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('connectDevice$', () => {
    it('dispatches connectDeviceSuccess on successful connect', (done) => {
      actions$ = of(connectDevice());

      effects.connectDevice$.subscribe({
        next: (result) => {
          expect(result).toEqual(connectDeviceSuccess());
          expect(serial.connect).toHaveBeenCalled();
          done();
        },
        error: done.fail,
      });
    });

    it('dispatches connectDeviceFailure when connect rejects', (done) => {
      (serial.connect as jasmine.Spy).and.rejectWith(new Error('denied'));
      actions$ = of(connectDevice());

      effects.connectDevice$.subscribe({
        next: (result) => {
          expect(result).toEqual(connectDeviceFailure({ error: new Error('denied') }));
          done();
        },
        error: done.fail,
      });
    });
  });

  describe('disconnectDevice$', () => {
    it('dispatches disconnectDeviceSuccess on successful disconnect', (done) => {
      actions$ = of(disconnectDevice());

      effects.disconnectDevice$.subscribe({
        next: (result) => {
          expect(result).toEqual(disconnectDeviceSuccess());
          expect(serial.disconnect).toHaveBeenCalled();
          done();
        },
        error: done.fail,
      });
    });
  });

  describe('sendToHardware$', () => {
    it('sends the current node/connection state and dispatches success', (done) => {
      actions$ = of(sendToHardware());

      effects.sendToHardware$.subscribe({
        next: (result) => {
          expect(result).toEqual(sendToHardwareSuccess());
          expect(hardwareConfig.send).toHaveBeenCalled();
          done();
        },
        error: done.fail,
      });
    });

    it('dispatches sendToHardwareFailure when send rejects', (done) => {
      (hardwareConfig.send as jasmine.Spy).and.rejectWith(new Error('timeout'));
      actions$ = of(sendToHardware());

      effects.sendToHardware$.subscribe({
        next: (result) => {
          expect(result).toEqual(sendToHardwareFailure({ error: new Error('timeout') }));
          done();
        },
        error: done.fail,
      });
    });
  });
});
