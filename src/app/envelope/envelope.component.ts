import { Component, Input, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FFlowModule } from '@foblex/flow';
import { SynthNode, FlowchartState } from '../store/reducers';
import { updateNode } from '../store/actions';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-envelope',
  imports: [FormsModule, FFlowModule],
  templateUrl: './envelope.component.html',
  styleUrls: ['./envelope.component.scss']
})
export class EnvelopeComponent {
  @Input({ required: true }) node!: SynthNode;

  private store = inject<Store<FlowchartState>>(Store);

  update(key: string, value: unknown) {
    const copy = structuredClone(this.node);
    copy.config[key] = value
    this.store.dispatch(updateNode({ node: copy }));
  }
}
