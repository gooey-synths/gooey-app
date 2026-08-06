import { selectAllConnections, selectAllNodes } from './selectors';
import { FlowchartState } from './reducers';

const mockState: FlowchartState = {
  nodes: [
    {
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
    },
    {
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
    }
  ],
  connections: [
    { id: '3', start: '1', end: '2' }
  ]
};
describe('Flowchart Selectors', () => {
  it('should select all nodes from the state', () => {
    const result = selectAllNodes.projector(mockState);
    expect(result.length).toBe(2);
    expect(result[0].id).toBe('vco-1');
  });

  it('should select all connections from the state', () => {
    const result = selectAllConnections.projector(mockState);
    expect(result.length).toBe(1);
    expect(result[0].id).toBe('3');
    expect(result[0].start).toBe('1');
    expect(result[0].end).toBe('2');
  });
});
