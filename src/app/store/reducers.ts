import { createReducer, on } from '@ngrx/store';
import { addNode,updateNode, removeNode, addConnection, removeConnection } from './actions';


export interface NodeConfigMap {
  vco: {
    waveform: 'sine' | 'square' | 'saw' | 'triangle';
    frequency: number;
    pw: number;
    inputs: {
      cv: string;
      pwm: string;
    };
    outputs: {
      out: string;
    };
  };
  envelope: {
    attack: number;   // seconds
    decay: number;    // seconds
    sustain: number;  // 0..1
    release: number;  // seconds
    outputs: {
      out: string;
    }
  };
  vca: {
    inputs: {
      audio: string; // node id of audio source
      cv: string;    // node id of CV (envelope)
    };
  }
}

export interface NodeBase<T extends keyof NodeConfigMap> {
  id: string;
  type: T;
  position: { x: number; y: number };
  config: NodeConfigMap[T];
}

export type SynthNode = {
  [K in keyof NodeConfigMap]: NodeBase<K>
}[keyof NodeConfigMap];

export type NodeType = keyof NodeConfigMap;

export type NodeOf<T extends NodeType> = NodeBase<T>;

export interface Node {
  x: number;
  y: number;
  name: string;
  id: string;
}

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
