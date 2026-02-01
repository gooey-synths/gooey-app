import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of } from 'rxjs';
import { Action } from '@ngrx/store';
import { FlowchartEffects } from './effects';
import { saveFlowchart, saveFlowchartSuccess, saveFlowchartFailure } from './actions';
import { SynthNode, Connection, FlowchartState } from './reducers';
import { FileService } from '../services/file.service';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { selectAllConnections, selectAllNodes } from './selectors';

describe('FlowchartEffects', () => {
  let actions$ = new Observable<Action>();
  let effects: FlowchartEffects;
  let fileService: jasmine.SpyObj<FileService>;
  let store: MockStore;

  const mockNodes: SynthNode[] = [
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
  ];

  const mockConnections: Connection[] = [
    { id: 'conn1', start: '1', end: '2' }
  ];

  const mockState: FlowchartState = {
    nodes: mockNodes,
    connections: mockConnections
  };

  beforeEach(() => {
    const fileServiceSpy = jasmine.createSpyObj('FileService', ['saveFile']);
    // Mock the FileSystemFileHandle
    const mockFileHandle = {
      createWritable: () => Promise.resolve({
        write: () => Promise.resolve(),
        close: () => Promise.resolve()
      })
    };
    fileServiceSpy.saveFile.and.returnValue(Promise.resolve(mockFileHandle));

    TestBed.configureTestingModule({
      providers: [
        FlowchartEffects,
        provideMockStore({
          selectors: [
            {
              selector: selectAllNodes,
              value: mockState.nodes,
            },
            {
              selector: selectAllConnections,
              value: mockState.connections,
            },
          ],
        }),
        provideMockActions(() => actions$),
        { provide: FileService, useValue: fileServiceSpy }
      ]
    });

    store = TestBed.inject(MockStore);
    effects = TestBed.inject(FlowchartEffects);
    fileService = TestBed.inject(FileService) as jasmine.SpyObj<FileService>;
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('saveFlowchart$', () => {
    it('should dispatch saveFlowchartSuccess on successful save', (done) => {
      const action = saveFlowchart({ filename: 'test.json' });
      const completion = saveFlowchartSuccess();

      actions$ = of(action);

      effects.saveFlowchart$.subscribe({
        next: (result) => {
          expect(result).toEqual(completion);
          done();
        },
        error: done.fail
      });

      // Verify the file service was called with the correct data
      expect(fileService.saveFile).toHaveBeenCalledWith(
        jasmine.any(Blob),
        { suggestedName: 'test.json' }
      );
    });

    it('should dispatch saveFlowchartSuccess with default name on successful save', (done) => {
      const action = saveFlowchart({ filename: '' });
      const completion = saveFlowchartSuccess();

      actions$ = of(action);

      effects.saveFlowchart$.subscribe({
        next: (result) => {
          expect(result).toEqual(completion);
          done();
        },
        error: done.fail
      });

      // Verify the file service was called with the correct data
      expect(fileService.saveFile).toHaveBeenCalledWith(
        jasmine.any(Blob),
        { suggestedName: 'flowchart.json' }
      );
    });

    it('should dispatch saveFlowchartFailure on error', (done) => {
      const error = new Error('Save failed');
      fileService.saveFile.and.returnValue(Promise.reject(error));

      const action = saveFlowchart({ filename: 'test.json' });
      const completion = saveFlowchartFailure({ error });

      actions$ = of(action);

      effects.saveFlowchart$.subscribe({
        next: (result) => {
          expect(result).toEqual(completion);
          done();
        },
        error: done.fail
      });
    });
  });
});
