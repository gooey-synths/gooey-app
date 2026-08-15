/* eslint-disable @angular-eslint/directive-selector */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Directive, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { DynamicNodeComponent } from './dynamic-node.component';
import { updateNode } from '../store/actions';
import { SynthNode, FlowchartState } from '../store/reducers';

@Directive({ selector: '[fDragHandle]', standalone: true })
class StubDragHandleDirective {}

@Directive({ selector: '[fNodeInput]', standalone: true })
class StubNodeInputDirective {
  @Input() fInputId?: string;
  @Input() fInputMultiple?: boolean;
  @Input() fInputConnectableSide?: string;
}

@Directive({ selector: '[fNodeOutput]', standalone: true })
class StubNodeOutputDirective {
  @Input() fOutputId?: string;
  @Input() fOutputMultiple?: boolean;
  @Input() fOutputConnectableSide?: string;
}

@Directive({ selector: '[fNodeOutlet]', standalone: true })
class StubNodeOutletDirective {}

const stubImports = [
  FormsModule,
  StubDragHandleDirective,
  StubNodeInputDirective,
  StubNodeOutputDirective,
  StubNodeOutletDirective,
];

const vcoNode: SynthNode = {
  id: 'vco-1',
  type: 'vco',
  position: { x: 0, y: 0 },
  config: {
    waveform: 'sine',
    frequency: 440,
    pw: 0.5,
    inputs: { cv: 'cv-id', pwm: 'pwm-id' },
    outputs: { out: 'out-id' },
  },
};

const vcaNode: SynthNode = {
  id: 'vca-1',
  type: 'vca',
  position: { x: 0, y: 0 },
  config: {
    inputs: { audio: 'audio-id', cv: 'cv-id' },
  },
};

const unknownNode: SynthNode = {
  id: 'filter-1',
  type: 'filter',
  position: { x: 0, y: 0 },
  config: { cutoff: 1000 },
};

describe('DynamicNodeComponent', () => {
  let component: DynamicNodeComponent;
  let fixture: ComponentFixture<DynamicNodeComponent>;
  let store: MockStore<FlowchartState>;
  let dispatchSpy: jasmine.Spy;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DynamicNodeComponent],
      providers: [provideMockStore<FlowchartState>({})],
    })
      .overrideComponent(DynamicNodeComponent, {
        set: { imports: stubImports },
      })
      .compileComponents();

    fixture = TestBed.createComponent(DynamicNodeComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    dispatchSpy = spyOn(store, 'dispatch');

    component.node = structuredClone(vcoNode);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should resolve the definition for the node type', () => {
    expect(component.definition?.label).toBe('VCO');
  });

  it('should render the definition label in the drag handle header', () => {
    const header = fixture.nativeElement.querySelector('[fDragHandle]') as HTMLElement;
    expect(header.textContent).toContain('VCO');
  });

  it('should render a range control with the correct min/max/step/value', () => {
    const input = fixture.nativeElement.querySelector('input[type="range"][min="20"]') as HTMLInputElement;

    expect(input).toBeTruthy();
    expect(input.max).toBe('2000');
    expect(input.step).toBe('1');
    expect(input.value).toBe('440');
  });

  it('should render a select control with its options and selected value', () => {
    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;

    expect(select).toBeTruthy();
    expect(select.options.length).toBe(3);
    expect(select.value).toBe('sine');
  });

  it('update() should dispatch updateNode with a cloned node and not mutate the input', () => {
    component.update('pw', 0.9);

    expect(dispatchSpy).toHaveBeenCalledTimes(1);
    const action = dispatchSpy.calls.mostRecent().args[0] as ReturnType<typeof updateNode>;
    expect(action.type).toBe(updateNode.type);
    expect(action.node.config['pw']).toBe(0.9);
    expect(component.node.config['pw']).toBe(0.5);
  });

  it('should render one connectable input port per input definition', () => {
    component.node = structuredClone(vcaNode);
    fixture.detectChanges();

    const inputs = fixture.debugElement.queryAll(By.directive(StubNodeInputDirective));

    expect(inputs.length).toBe(2);
    expect(inputs[0].injector.get(StubNodeInputDirective).fInputId).toBe('audio-id');
    expect(inputs[1].injector.get(StubNodeInputDirective).fInputId).toBe('cv-id');
    expect(fixture.nativeElement.textContent).toContain('Audio Input');
    expect(fixture.nativeElement.textContent).toContain('CV Input');
  });

  it('should render non-connectable inputs as labels without a port', () => {
    const inputs = fixture.nativeElement.querySelectorAll('[fNodeInput]');

    expect(inputs.length).toBe(0);
    expect(fixture.nativeElement.textContent).toContain('V/Oct');
    expect(fixture.nativeElement.textContent).toContain('PWM');
  });

  it('should render one output port per output definition', () => {
    const outputs = fixture.nativeElement.querySelectorAll('[fNodeOutput]');
    const outlets = fixture.nativeElement.querySelectorAll('[fNodeOutlet]');

    expect(outputs.length).toBe(1);
    expect(outlets.length).toBe(1);
  });

  it('should render a fallback header for an unknown node type', () => {
    component.node = structuredClone(unknownNode);
    fixture.detectChanges();

    expect(component.definition).toBeUndefined();
    expect(fixture.nativeElement.textContent).toContain('filter');
  });
});
