import { selectAllNodes } from './selectors';
import { FlowchartState } from './reducers';

describe('Flowchart Selectors', () => {
  it('should select all nodes from the state', () => {
    const mockState: FlowchartState = {
      nodes: [
        { id: '1', name: 'Node 1', x: 50, y: 50 },
        { id: '2', name: 'Node 2', x: 100, y: 100 },
      ],
    };

    const result = selectAllNodes.projector(mockState);
    expect(result.length).toBe(2);
    expect(result[0].id).toBe('1');
    expect(result[1].name).toBe('Node 2');
  });
});
