import { createReducer, on } from '@ngrx/store';
import { addNode,removeNode, addConnection, removeConnection } from './actions';

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
  on(removeNode, (state, action) => ({
    ...state,
    nodes: state.nodes.filter(node => node.id != action.id),
  })),
  on(addConnection, (state, action) => ({
    ...state,
    connections: [...state.connections, action.connection],
  })),
  on(removeConnection, (state, action) => ({
    ...state,
    connections: state.connections.filter(connection => connection.id != action.id),
  }))
);
