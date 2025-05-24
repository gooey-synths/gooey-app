import { createReducer, on } from '@ngrx/store';
import { addNode } from './actions';

export interface Node {
  x: number,
  y: number,
  name: string
  id: string
}

export interface FlowchartState {
  nodes: Node[];
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
