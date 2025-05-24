import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { MainCanvasComponent } from './main-canvas.component';
import { selectAllNodes } from '../store/selectors';
import { take } from 'rxjs';

describe('MainCanvasComponent', () => {
  let component: MainCanvasComponent;
  let fixture: ComponentFixture<MainCanvasComponent>;
  let store: MockStore;
  let dispatchSpy: jasmine.Spy;
  const mockNodes = [
    { id: '1', type: 'Start/End', x: 100, y: 100 },
    { id: '2', type: 'Process', x: 200, y: 200 },
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
    let storeNodes: any[] = [];

    component.nodeList$.pipe(take(1)).subscribe(data => storeNodes = data);

    expect(storeNodes.length).toEqual(mockNodes.length);
  });

  it('Dropping a node on the canvas should add one to the list', () => {
    let storeNodes: any[] = [];
    let dropEvent = {
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
});
