import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EnvelopeComponent } from './envelope.component';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { updateNode } from '../store/actions';
import { SynthNode, FlowchartState } from '../store/reducers';

describe('EnvelopeComponent', () => {
  let component: EnvelopeComponent;
  let fixture: ComponentFixture<EnvelopeComponent>;
  let store: MockStore<FlowchartState>;
  let dispatchSpy: jasmine.Spy;

  const initialNode: SynthNode = {
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
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnvelopeComponent],
      providers: [
        provideMockStore<FlowchartState>({}),
      ],
    }).overrideComponent(EnvelopeComponent, {
      set: {
        template: ''
      }
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnvelopeComponent);
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
    expect(component.node.config['attack']).toBe(0.01);
    expect(component.node.config['sustain']).toBe(0.7);
  });

  it('update() should dispatch updateNode with updated attack', () => {
    component.update('attack', 0.5);

    expect(dispatchSpy).toHaveBeenCalledTimes(1);

    const action = dispatchSpy.calls.mostRecent().args[0] as ReturnType<typeof updateNode>;
    const res = action.node as SynthNode;

    expect(action.type).toBe(updateNode.type);
    expect(res.config['attack']).toBe(0.5);
  });

  it('update() should not mutate the original node input', () => {
    component.update('release', 1.5);

    expect(component.node.config['release']).toBe(0.2);
  });

  it('update() should preserve other ADSR values', () => {
    component.update('sustain', 0.9);

    const action = dispatchSpy.calls.mostRecent().args[0] as ReturnType<typeof updateNode>;
    const updated = action.node as SynthNode;

    expect(updated.config['sustain']).toBe(0.9);
    expect(updated.config['attack']).toBe(0.01);
    expect(updated.config['decay']).toBe(0.1);
    expect(updated.config['release']).toBe(0.2);
  });
});
