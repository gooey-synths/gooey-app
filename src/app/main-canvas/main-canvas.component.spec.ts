import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { MainCanvasComponent } from './main-canvas.component';
import { selectAllConnections, selectAllNodes } from '../store/selectors';
import { take } from 'rxjs';

describe('MainCanvasComponent', () => {
  let component: MainCanvasComponent;
  let fixture: ComponentFixture<MainCanvasComponent>;
  let store: MockStore;
  let dispatchSpy: jasmine.Spy;
  const mockNodes = [
    { id: '1', name: 'Node 1', x: 100, y: 100 },
    { id: '2', name: 'Node 2c', x: 200, y: 200 },
  ];

  const mockConnection = [
    { id: '3', start: '1', end: '2' },
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
    })
    .compileComponents();

    store = TestBed.inject(MockStore);
    dispatchSpy = spyOn(store, 'dispatch');
    fixture = TestBed.createComponent(MainCanvasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
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
      data: 'Test',
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
});
