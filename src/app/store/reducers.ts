import { createReducer, on } from '@ngrx/store';
import { addNode,updateNode, removeNode, addConnection, removeConnection } from './actions';


export interface NodeConfig {
  [key: string]: unknown;
  inputs?: Record<string, string>;
  outputs?: Record<string, string>;
}

export interface SynthNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  config: NodeConfig;
}

export type NodeType = string;

export interface Connection {
  id: string;
  start: string;
  end: string;
}
export interface FlowchartState {
  nodes: SynthNode[];
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
  on(updateNode, (state, action) => ({
    ...state,
    nodes: state.nodes.map(node => {
      if (node.id === action.node.id) {
        return action.node
      }
      return node
    }),
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
