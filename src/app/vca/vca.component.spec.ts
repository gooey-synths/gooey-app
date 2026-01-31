import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { FormsModule } from '@angular/forms';
import { VcaComponent } from './vca.component';
import { NodeOf, FlowchartState } from '../store/reducers';
import { FFlowModule } from '@foblex/flow';

describe('VcaComponent', () => {
  let component: VcaComponent;
  let fixture: ComponentFixture<VcaComponent>;

  let store: MockStore<FlowchartState>;

  const initialNode: NodeOf<'vca'> = {
    id: 'vca-1',
    type: 'vca',
    position: { x: 0, y: 0 },
    config: {
      inputs: {
        audio: 'aud-id',
        cv: 'cv-id',
      },
    },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VcaComponent],
      providers: [
        provideMockStore<FlowchartState>({}),
      ],
    }).overrideComponent(VcaComponent, {
      set: {
        template: ''
      }
    }).compileComponents();

    fixture = TestBed.createComponent(VcaComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);

    component.node = structuredClone(initialNode);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});
