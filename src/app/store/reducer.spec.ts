import { flowchartReducer, initialState, FlowchartState } from './reducers';
import { addNode } from './actions';

describe('Flowchart Reducer', () => {
  it('should return the initial state by default', () => {
    const action = { type: 'Unknown' } as any;
    const state = flowchartReducer(undefined, action);
    expect(state).toEqual(initialState);
  });

  it('should add an element on addNode action', () => {
    const node = { type: 'Node1', x: 100, y: 200 };
    const action = addNode({ node });
    const state = flowchartReducer(initialState, action);

    expect(state.nodes.length).toBe(1);
    expect(state.nodes[0]).toEqual(node);
  });

  it('should add multiple elements cumulatively', () => {
    const element1 = { type: 'Node1', x: 10, y: 20 };
    const element2 = { type: 'Node2', x: 30, y: 40 };

    const state1 = flowchartReducer(initialState, addNode({ node: element1 }));
    const state2 = flowchartReducer(state1, addNode({ node: element2 }));

    expect(state2.nodes.length).toBe(2);
    expect(state2.nodes).toEqual([element1, element2]);
  });
});
