import { createReducer, on } from '@ngrx/store';
import { addNode } from './actions';

export interface FlowchartState {
  nodes: { type: string; x: number; y: number }[];
}

export const initialState: FlowchartState = {
  nodes: [],
};

export const flowchartReducer = createReducer(
  initialState,
  on(addNode, (state, action) => ({
    ...state,
    nodes: [...state.nodes, action.node],
  }))
);
