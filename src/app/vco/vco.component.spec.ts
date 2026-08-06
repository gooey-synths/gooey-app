import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VcoComponent } from './vco.component';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { updateNode } from '../store/actions';
import { NodeOf, FlowchartState } from '../store/reducers';

describe('VcoComponent', () => {
  let component: VcoComponent;
  let fixture: ComponentFixture<VcoComponent>;
  let store: MockStore<FlowchartState>;
  let dispatchSpy: jasmine.Spy;

  const initialNode: NodeOf<'vco'> = {
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
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VcoComponent],
      providers: [
        provideMockStore<FlowchartState>({}),
      ],
    }).overrideComponent(VcoComponent, {
      set: {
        template: ''
      }
    })
    .compileComponents();

    fixture = TestBed.createComponent(VcoComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    dispatchSpy = spyOn(store, 'dispatch');

    component.node = structuredClone(initialNode);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should receive node input', () => {
    expect(component.node.id).toBe('vco-1');
    expect(component.node.config.frequency).toBe(440);
  });

  it('update() should dispatch updateNode with updated config', () => {
    component.update('frequency', 880);

    expect(dispatchSpy).toHaveBeenCalledTimes(1);

    const action = dispatchSpy.calls.mostRecent().args[0] as ReturnType<typeof updateNode>;

    const res = action.node as NodeOf<'vco'>;

    expect(action.type).toBe(updateNode.type);
    expect(res.config.frequency).toBe(880);
  });

  it('update() should not mutate the original node input', () => {
    component.update('pw', 0.75);

    expect(component.node.config.pw).toBe(0.5); // original unchanged
  });

  it('update() should preserve other config values', () => {
    component.update('waveform', 'square');

    const action = dispatchSpy.calls.mostRecent().args[0] as ReturnType<typeof updateNode>;
    const res = action.node as NodeOf<'vco'>;

    expect(res.config.waveform).toBe('square');
    expect(res.config.frequency).toBe(440);
    expect(res.config.pw).toBe(0.5);
  });
});
