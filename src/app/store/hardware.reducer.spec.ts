import {
  hardwareReducer,
  initialHardwareState,
  HardwareState,
} from './hardware.reducer';
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

describe('hardwareReducer', () => {
  it('returns the initial state', () => {
    const state = hardwareReducer(undefined, { type: 'NOOP' });

    expect(state).toEqual({
      deviceStatus: 'disconnected',
      sendStatus: 'idle',
      lastError: null,
    });
  });

  it('marks device as connecting on connectDevice', () => {
    const state = hardwareReducer(initialHardwareState, connectDevice());

    expect(state.deviceStatus).toBe('connecting');
  });

  it('marks device as connected and clears error on success', () => {
    const before: HardwareState = { deviceStatus: 'connecting', sendStatus: 'idle', lastError: null };
    const state = hardwareReducer(before, connectDeviceSuccess());

    expect(state.deviceStatus).toBe('connected');
    expect(state.lastError).toBeNull();
  });

  it('marks device disconnected and records error on failure', () => {
    const before: HardwareState = { deviceStatus: 'connecting', sendStatus: 'idle', lastError: null };
    const state = hardwareReducer(before, connectDeviceFailure({ error: new Error('denied') }));

    expect(state.deviceStatus).toBe('disconnected');
    expect(state.lastError).toBe('denied');
  });

  it('marks device as disconnecting on disconnectDevice', () => {
    const before: HardwareState = { deviceStatus: 'connected', sendStatus: 'idle', lastError: null };
    const state = hardwareReducer(before, disconnectDevice());

    expect(state.deviceStatus).toBe('disconnecting');
  });

  it('marks device disconnected on disconnectDeviceSuccess', () => {
    const before: HardwareState = { deviceStatus: 'disconnecting', sendStatus: 'idle', lastError: null };
    const state = hardwareReducer(before, disconnectDeviceSuccess());

    expect(state.deviceStatus).toBe('disconnected');
  });

  it('marks device disconnected on deviceDisconnected', () => {
    const before: HardwareState = { deviceStatus: 'connected', sendStatus: 'sending', lastError: null };
    const state = hardwareReducer(before, deviceDisconnected());

    expect(state.deviceStatus).toBe('disconnected');
  });

  it('marks sending on sendToHardware', () => {
    const before: HardwareState = { deviceStatus: 'connected', sendStatus: 'idle', lastError: null };
    const state = hardwareReducer(before, sendToHardware());

    expect(state.sendStatus).toBe('sending');
  });

  it('marks success and clears error on send success', () => {
    const before: HardwareState = { deviceStatus: 'connected', sendStatus: 'sending', lastError: 'old' };
    const state = hardwareReducer(before, sendToHardwareSuccess());

    expect(state.sendStatus).toBe('success');
    expect(state.lastError).toBeNull();
  });

  it('marks error and records message on send failure', () => {
    const before: HardwareState = { deviceStatus: 'connected', sendStatus: 'sending', lastError: null };
    const state = hardwareReducer(before, sendToHardwareFailure({ error: new Error('timeout') }));

    expect(state.sendStatus).toBe('error');
    expect(state.lastError).toBe('timeout');
  });
});
