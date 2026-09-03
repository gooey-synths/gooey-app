import { createReducer, on } from '@ngrx/store';
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

export type DeviceStatus = 'disconnected' | 'connecting' | 'connected' | 'disconnecting';
export type SendStatus = 'idle' | 'sending' | 'success' | 'error';

export interface HardwareState {
  deviceStatus: DeviceStatus;
  sendStatus: SendStatus;
  lastError: string | null;
}

const errorMessage = (error: Error): string => error.message;

export const initialHardwareState: HardwareState = {
  deviceStatus: 'disconnected',
  sendStatus: 'idle',
  lastError: null,
};

export const hardwareReducer = createReducer(
  initialHardwareState,
  on(connectDevice, (state) => ({ ...state, deviceStatus: 'connecting' as const })),
  on(connectDeviceSuccess, (state) => ({
    ...state,
    deviceStatus: 'connected' as const,
    lastError: null,
  })),
  on(connectDeviceFailure, (state, { error }) => ({
    ...state,
    deviceStatus: 'disconnected' as const,
    lastError: errorMessage(error),
  })),
  on(disconnectDevice, (state) => ({ ...state, deviceStatus: 'disconnecting' as const })),
  on(disconnectDeviceSuccess, (state) => ({
    ...state,
    deviceStatus: 'disconnected' as const,
  })),
  on(deviceDisconnected, (state) => ({
    ...state,
    deviceStatus: 'disconnected' as const,
  })),
  on(sendToHardware, (state) => ({ ...state, sendStatus: 'sending' as const })),
  on(sendToHardwareSuccess, (state) => ({
    ...state,
    sendStatus: 'success' as const,
    lastError: null,
  })),
  on(sendToHardwareFailure, (state, { error }) => ({
    ...state,
    sendStatus: 'error' as const,
    lastError: errorMessage(error),
  })),
);
