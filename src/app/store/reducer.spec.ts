import { flowchartReducer, initialState } from './reducers';
import { addConnection, removeConnection, addNode, removeNode } from './actions';
import { SynthNode } from '../store/reducers';

describe('Flowchart Reducer', () => {
  beforeEach(() => {
    initialState.nodes = [];
    initialState.connections = [];
  });
  it('should return the initial state by default', () => {
    const action = { type: 'Unknown' };
    const state = flowchartReducer(undefined, action);
    expect(state).toEqual(initialState);
  });

  it('should add an element on addNode action', () => {
    const node: SynthNode = {
      id: 'vco-1',
      type: 'vco',
      position: { x: 0, y: 0 },
      config: {
        waveform: 'sine',
        frequency: 440,
        pw: 0.5,
        inputs: {
          cv: 'cv-id',
          pwm: 'pwm-id',
        },
        outputs: {
          out: 'out-id',
        },
      },
    };
    const action = addNode({ node });
    const state = flowchartReducer(initialState, action);

    expect(state.nodes.length).toBe(1);
    expect(state.nodes[0]).toEqual(node);
  });

  it('should remove a node on removeNode action', () => {
    const node: SynthNode = {
      id: 'vco-1',
      type: 'vco',
      position: { x: 0, y: 0 },
      config: {
        waveform: 'sine',
        frequency: 440,
        pw: 0.5,
        inputs: {
          cv: 'cv-id',
          pwm: 'pwm-id',
        },
        outputs: {
          out: 'out-id',
        },
      },
    };
    initialState.nodes.push(node);
    const action = removeNode({ id: node.id });

    const state = flowchartReducer(initialState, action);

    expect(state.nodes.length).toBe(0);
  });

  it('should add an element on addConnection action', () => {
    const connection = { id: '1234', start: '1', end: '2' };
    const action = addConnection({ connection });
    const state = flowchartReducer(initialState, action);

    expect(state.connections.length).toBe(1);
    expect(state.connections[0]).toEqual(connection);
  });

  it('should remove a connection on removeConnection action', () => {
    const connection = { id: '1234', start: '1', end: '2' };
    initialState.connections.push(connection);
    const action = removeConnection({ id: connection.id });

    const state = flowchartReducer(initialState, action);

    expect(state.connections.length).toBe(0);
  });

  it('should add multiple elements cumulatively', () => {
    const node1: SynthNode = {
      id: 'vco-1',
      type: 'vco',
      position: { x: 0, y: 0 },
      config: {
        waveform: 'sine',
        frequency: 440,
        pw: 0.5,
        inputs: {
          cv: 'cv-id',
          pwm: 'pwm-id',
        },
        outputs: {
          out: 'out-id',
        },
      },
    };
    const node2: SynthNode = {
      id: 'env-1',
      type: 'envelope',
      position: { x: 0, y: 0 },
      config: {
        attack: 0.01,
        decay: 0.1,
        sustain: 0.7,
        release: 0.2,
        outputs: {
          out: 'out-id',
        },
      },
    };

    const state1 = flowchartReducer(initialState, addNode({ node: node1 }));
    const state2 = flowchartReducer(state1, addNode({ node: node2 }));

    expect(state2.nodes.length).toBe(2);
    expect(state2.nodes).toEqual([node1, node2]);
  });

  it('should add a node of a custom JSON-driven type', () => {
    const node: SynthNode = {
      id: 'filter-1',
      type: 'filter',
      position: { x: 0, y: 0 },
      config: { cutoff: 1000, resonance: 0.7 },
    };
    const action = addNode({ node });
    const state = flowchartReducer(initialState, action);

    expect(state.nodes.length).toBe(1);
    expect(state.nodes[0].type).toBe('filter');
    expect(state.nodes[0].config['cutoff']).toBe(1000);
  });
});
