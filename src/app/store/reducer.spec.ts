import { flowchartReducer, initialState } from './reducers';
import { addNode } from './actions';

describe('Flowchart Reducer', () => {
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

  it('should add multiple elements cumulatively', () => {
    const node1 = { id: '1234', name: 'Node 1', x: 100, y: 200 };
    const node2 = { id: '1234', name: 'Node 1', x: 100, y: 200 };

    const state1 = flowchartReducer(initialState, addNode({ node: node1 }));
    const state2 = flowchartReducer(state1, addNode({ node: node2 }));

    expect(state2.nodes.length).toBe(2);
    expect(state2.nodes).toEqual([node1, node2]);
  });
});
