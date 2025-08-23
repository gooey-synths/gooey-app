import { createReducer, on } from '@ngrx/store';
import { addNode, addConnection } from './actions';

export interface Node {
  x: number,
  y: number,
  name: string,
  id: string
}

export interface Connection {
  id: string
  start: string
  end: string
}
export interface FlowchartState {
  nodes: Node[];
  connections: Connection[];
}

export const initialState: FlowchartState = {
  nodes: [],
  connections: [],
};

export const flowchartReducer = createReducer(
  initialState,
  on(addNode, (state, action) => ({
    ...state,
    nodes: [...state.nodes, action.node],
  })),
  on(addConnection, (state, action) => ({
    ...state,
    connections: [...state.connections, action.connection],
  }))
);
