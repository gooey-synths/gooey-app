import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store, select } from '@ngrx/store';
import { from, of } from 'rxjs';
import { catchError, map, switchMap, withLatestFrom } from 'rxjs/operators';
import { SerialService } from '../services/usb/serial.service';
import { HardwareConfigService } from '../services/usb/hardware-config.service';
import { FlowchartState } from './reducers';
import { selectAllNodes, selectAllConnections } from './selectors';
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

@Injectable()
export class HardwareEffects {
  private actions$ = inject(Actions);
  private store = inject<Store<FlowchartState>>(Store);
  private serial = inject(SerialService);
  private hardwareConfig = inject(HardwareConfigService);

  connectDevice$ = createEffect(() =>
    this.actions$.pipe(
      ofType(connectDevice),
      switchMap(() =>
        from(this.serial.connect()).pipe(
          map(() => connectDeviceSuccess()),
          catchError((error: Error) => of(connectDeviceFailure({ error }))),
        ),
      ),
    ),
  );

  disconnectDevice$ = createEffect(() =>
    this.actions$.pipe(
      ofType(disconnectDevice),
      switchMap(() =>
        from(this.serial.disconnect()).pipe(
          map(() => disconnectDeviceSuccess()),
          catchError(() => of(disconnectDeviceSuccess())),
        ),
      ),
    ),
  );

  sendToHardware$ = createEffect(() =>
    this.actions$.pipe(
      ofType(sendToHardware),
      withLatestFrom(
        this.store.pipe(select(selectAllNodes)),
        this.store.pipe(select(selectAllConnections)),
      ),
      switchMap(([, nodes, connections]) => {
        const state: FlowchartState = { nodes, connections };
        return from(this.hardwareConfig.send(state)).pipe(
          map(() => sendToHardwareSuccess()),
          catchError((error: Error) => of(sendToHardwareFailure({ error }))),
        );
      }),
    ),
  );
}
