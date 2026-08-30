import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { SerialService } from '../services/usb/serial.service';
import { HardwareConfigService } from '../services/usb/hardware-config.service';
import {
  connectDevice,
  connectDeviceSuccess,
  connectDeviceFailure,
  disconnectDevice,
  disconnectDeviceSuccess,
  deviceDisconnected,
  sendToHardware,
  sendToHardwareSuccess,
  sendToHardwareFailure,
} from './hardware.actions';

@Injectable()
export class HardwareEffects {
  private actions$ = inject(Actions);
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

  deviceDisconnected$ = createEffect(() =>
    this.serial.deviceDisconnected$.pipe(map(() => deviceDisconnected())),
  );

  sendToHardware$ = createEffect(() =>
    this.actions$.pipe(
      ofType(sendToHardware),
      switchMap(() =>
        from(this.hardwareConfig.send()).pipe(
          map(() => sendToHardwareSuccess()),
          catchError((error: Error) => of(sendToHardwareFailure({ error }))),
        ),
      ),
    ),
  );
}
