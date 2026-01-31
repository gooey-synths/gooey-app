import { Component, Input, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FFlowModule } from '@foblex/flow';
import { NodeOf, FlowchartState } from '../store/reducers';
import { updateNode } from '../store/actions';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-envelope',
  imports: [FormsModule, FFlowModule],
  templateUrl: './envelope.component.html',
  styleUrls: ['./envelope.component.scss']
})
export class EnvelopeComponent {
  @Input({ required: true }) node!: NodeOf<'envelope'>;

  private store = inject<Store<FlowchartState>>(Store);

  update<K extends keyof NodeOf<'envelope'>['config']>(key: K, value: NodeOf<'envelope'>['config'][K]) {
    let copy = structuredClone(this.node);
    copy.config[key] = value
    this.store.dispatch(updateNode({ node: copy }));
  }
}
