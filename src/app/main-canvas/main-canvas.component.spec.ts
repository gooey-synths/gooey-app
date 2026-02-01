import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { MainCanvasComponent } from './main-canvas.component';
import { selectAllConnections, selectAllNodes } from '../store/selectors';
import { SynthNode } from '../store/reducers';
import { take } from 'rxjs';
import { removeConnection, removeNode } from '../store/actions';

describe('MainCanvasComponent', () => {
  let component: MainCanvasComponent;
  let fixture: ComponentFixture<MainCanvasComponent>;
  let store: MockStore;
  let dispatchSpy: jasmine.Spy;
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
          out: 'vout-id',
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

  const mockConnection = [
    { id: '3', start: 'out-id', end: 'cv-id' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainCanvasComponent],
      providers: [
        provideMockStore({
          selectors: [
            {
              selector: selectAllNodes,
              value: mockNodes,
            },
            {
              selector: selectAllConnections,
              value: mockConnection,
            },
          ],
        }),
      ]
    }).
    overrideComponent(MainCanvasComponent, { set: {template: ''}})
    .compileComponents();

    store = TestBed.inject(MockStore);
    dispatchSpy = spyOn(store, 'dispatch');
    fixture = TestBed.createComponent(MainCanvasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.nodeIds.length).toEqual(mockNodes.length);
    expect(component.connectionIds.length).toEqual(mockConnection.length);
  });

  it('should have 2 nodes in the nodeList from the store', () => {
    let storeNodes = [];

    component.nodeList$.pipe(take(1)).subscribe(data => storeNodes = data);

    expect(storeNodes.length).toEqual(mockNodes.length);
  });

  it('should have 1 connection in the connectionList from the store', () => {
    let storeConnections = [];

    component.connectionList$.pipe(take(1)).subscribe(data => storeConnections = data);

    expect(storeConnections.length).toEqual(mockConnection.length);
  });

  it('Dropping a node on the canvas should add one to the list', () => {
    const dropEvent = {
      data: {
        type: 'test',
        config: 'test'
      },
      rect: {
        x: 100,
        y: 100,
        width: 100,
        height: 100,
        gravityCenter: {
          x: 100,
          y: 100
        }
      }
    };

    component.onDrop(dropEvent);

    expect(dispatchSpy).toHaveBeenCalled();
  });

  it('Connecting two nodes should add a connection to the connection list', () => {
    const connectionEvent = {
      data: 'Test',
      fOutputId: '1',
      fInputId: '2',
      fDropPosition: {
        x: 100,
        y: 100
      }
    };

    component.onConnect(connectionEvent);

    expect(dispatchSpy).toHaveBeenCalled();
  });

  it('Connecting two nodes should fail if missing an input', () => {
    const connectionEvent = {
      data: 'Test',
      fOutputId: '',
      fInputId: '2',
      fDropPosition: {
        x: 100,
        y: 100
      }
    };

    component.onConnect(connectionEvent);

    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  it('Connecting two nodes should fail if missing an output', () => {
    const connectionEvent = {
      data: 'Test',
      fOutputId: '1',
      fInputId: '',
      fDropPosition: {
        x: 100,
        y: 100
      }
    };

    component.onConnect(connectionEvent);

    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  it('Should remove a connection if it is selected', () => {
    component.selectedElement = '3';

    component.removeElement();

    expect(dispatchSpy).toHaveBeenCalledOnceWith(
      removeConnection({id: '3'})
    );
  });

  it('Should remove a node if it is selected', () => {
    component.selectedElement = 'vco-1';

    component.removeElement();

    expect(dispatchSpy).toHaveBeenCalledOnceWith(
      removeNode({id: 'vco-1'})
    );
  });

  it('Should not remove anything if there is no selection', () => {
    component.selectedElement = '';

    component.removeElement();

    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  it('Should select the element with the id', () => {
    component.selectElement('vco-1');

    expect(component.selectedElement).toEqual('vco-1');
  });
});
