import { createFeatureSelector, createSelector } from '@ngrx/store';
import { FlowchartState } from './reducers';
import { HardwareState } from './hardware.reducer';

export const selectFlowchartState = createFeatureSelector<FlowchartState>('flowchart');

export const selectAllNodes = createSelector(
  selectFlowchartState,
  (state) => state.nodes
);

export const selectAllConnections = createSelector(
  selectFlowchartState,
  (state) => state.connections
);

export const selectHardwareState = createFeatureSelector<HardwareState>('hardware');

export const selectDeviceStatus = createSelector(
  selectHardwareState,
  (state) => state.deviceStatus
);

export const selectSendStatus = createSelector(
  selectHardwareState,
  (state) => state.sendStatus
);

export const selectLastError = createSelector(
  selectHardwareState,
  (state) => state.lastError
);
