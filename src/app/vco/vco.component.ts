import { Component, Input, inject } from '@angular/core';
import { SynthNode, FlowchartState } from '../store/reducers';
import { FormsModule } from '@angular/forms';
import { FFlowModule } from '@foblex/flow';

import { updateNode } from '../store/actions';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-vco',
  imports: [FormsModule, FFlowModule],
  templateUrl: './vco.component.html',
  styleUrl: './vco.component.scss',
})
export class VcoComponent {
  @Input({ required: true }) node!: SynthNode;

  private store = inject<Store<FlowchartState>>(Store);

  update(key: string, value: unknown) {
    const copy = structuredClone(this.node);
    copy.config[key] = value
    this.store.dispatch(updateNode({ node: copy }));
  }
}
