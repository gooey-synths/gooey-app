import { selectAllConnections, selectAllNodes } from './selectors';
import { FlowchartState } from './reducers';

const mockState: FlowchartState = {
  nodes: [
    { id: '1', name: 'Node 1', x: 50, y: 50 },
    { id: '2', name: 'Node 2', x: 100, y: 100 },
  ],
  connections: [
    { id: '3', start: '1', end: '2' }
  ]
};
describe('Flowchart Selectors', () => {
  it('should select all nodes from the state', () => {
    const result = selectAllNodes.projector(mockState);
    expect(result.length).toBe(2);
    expect(result[0].id).toBe('1');
    expect(result[1].name).toBe('Node 2');
  });

  it('should select all connections from the state', () => {
    const result = selectAllConnections.projector(mockState);
    expect(result.length).toBe(1);
    expect(result[0].id).toBe('3');
    expect(result[0].start).toBe('1');
    expect(result[0].end).toBe('2');
  });
});
