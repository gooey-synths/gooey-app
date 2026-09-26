import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { MainCanvasComponent } from './main-canvas.component';
import { selectAllConnections, selectAllNodes } from '../store/selectors';
import { SynthNode } from '../store/reducers';
import { take } from 'rxjs';
import { addNode, removeConnection, removeNode } from '../store/actions';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

describe('MainCanvasComponent', () => {
  let component: MainCanvasComponent;
  let fixture: ComponentFixture<MainCanvasComponent>;
  let store: MockStore;
  let dispatchSpy: jasmine.Spy;
  const mockNodes: SynthNode[] = [
    {
      id: 'fast-analog-out-1',
      type: 'fast_analog_out',
      position: { x: 0, y: 0 },
      config: {
        outputs: {
          out: 'vout-id',
        },
      },
    },
    {
      id: 'fast-analog-in-1',
      type: 'fast_analog_in',
      position: { x: 0, y: 0 },
      config: {
        inputs: {
          in: 'vin-id',
        },
      },
    }
  ];

  const mockConnection = [
    { id: '3', start: 'vout-id', end: 'vin-id' },
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

  it('Dropping a registered node type should add it with config built from the definition', () => {
    const dropEvent = {
      data: {
        type: 'fast_analog_out',
        config: 'anything'
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

    expect(dispatchSpy).toHaveBeenCalledTimes(1);
    const action = dispatchSpy.calls.mostRecent().args[0] as ReturnType<typeof addNode>;
    expect(action.node.type).toBe('fast_analog_out');
    expect(action.node.config.outputs!['out']).toMatch(UUID_REGEX);
    expect(action.node.position).toEqual({ x: 100, y: 100 });
  });

  it('Dropping an input node should build config with a uuid for its input port', () => {
    const dropEvent = {
      data: {
        type: 'fast_analog_in',
        config: 'anything'
      },
      rect: {
        x: 40,
        y: 60,
        width: 100,
        height: 100,
        gravityCenter: {
          x: 40,
          y: 60
        }
      }
    };

    component.onDrop(dropEvent);

    const action = dispatchSpy.calls.mostRecent().args[0] as ReturnType<typeof addNode>;
    expect(action.node.type).toBe('fast_analog_in');
    expect(Object.keys(action.node.config.inputs!)).toEqual(['in']);
    expect(action.node.config.inputs!['in']).toMatch(UUID_REGEX);
    expect(action.node.config.outputs).toBeUndefined();
    expect(action.node.position).toEqual({ x: 40, y: 60 });
  });

  it('Dropping an unregistered node type should not dispatch', () => {
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

    expect(dispatchSpy).not.toHaveBeenCalled();
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
    component.selectedElement = 'fast-analog-out-1';

    component.removeElement();

    expect(dispatchSpy).toHaveBeenCalledOnceWith(
      removeNode({id: 'fast-analog-out-1'})
    );
  });

  it('Should not remove anything if there is no selection', () => {
    component.selectedElement = '';

    component.removeElement();

    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  it('Should select the element with the id', () => {
    component.selectElement('fast-analog-out-1');

    expect(component.selectedElement).toEqual('fast-analog-out-1');
  });
});
