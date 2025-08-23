import { createFeatureSelector, createSelector } from '@ngrx/store';
import { FlowchartState } from './reducers';

export const selectFlowchartState = createFeatureSelector<FlowchartState>('flowchart');

export const selectAllNodes = createSelector(
  selectFlowchartState,
  (state) => state.nodes
);

export const selectAllConnections = createSelector(
  selectFlowchartState,
  (state) => state.connections
);
