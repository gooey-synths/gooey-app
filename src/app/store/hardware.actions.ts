import { createAction, props } from '@ngrx/store';

export const connectDevice = createAction('[Hardware] Connect Device');

export const connectDeviceSuccess = createAction('[Hardware] Connect Device Success');

export const connectDeviceFailure = createAction(
  '[Hardware] Connect Device Failure',
  props<{ error: Error }>(),
);

export const disconnectDevice = createAction('[Hardware] Disconnect Device');

export const disconnectDeviceSuccess = createAction('[Hardware] Disconnect Device Success');

export const deviceDisconnected = createAction('[Hardware] Device Disconnected');

export const sendToHardware = createAction('[Hardware] Send To Hardware');

export const sendToHardwareSuccess = createAction('[Hardware] Send To Hardware Success');

export const sendToHardwareFailure = createAction(
  '[Hardware] Send To Hardware Failure',
  props<{ error: Error }>(),
);
