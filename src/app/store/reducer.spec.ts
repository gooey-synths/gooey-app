import { flowchartReducer, initialState } from './reducers';
import { addConnection, removeConnection, addNode, removeNode } from './actions';

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
    const node = { id: '1234', name: 'Node 1', x: 100, y: 200 };
    const action = addNode({ node });
    const state = flowchartReducer(initialState, action);

    expect(state.nodes.length).toBe(1);
    expect(state.nodes[0]).toEqual(node);
  });

  it('should remove a node on removeNode action', () => {
    const node = { id: '1234', name: 'test node', x: 1, y: 2 };
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
    const node1 = { id: '1234', name: 'Node 1', x: 100, y: 200 };
    const node2 = { id: '1234', name: 'Node 1', x: 100, y: 200 };

    const state1 = flowchartReducer(initialState, addNode({ node: node1 }));
    const state2 = flowchartReducer(state1, addNode({ node: node2 }));

    expect(state2.nodes.length).toBe(2);
    expect(state2.nodes).toEqual([node1, node2]);
  });
});
