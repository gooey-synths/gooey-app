import { Component, Input, inject } from '@angular/core';
import { NodeOf, FlowchartState } from '../store/reducers';
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
  @Input({ required: true }) node!: NodeOf<'vco'>;
  waveform: 'sine' | 'square' | 'saw' = 'sine';

  private store = inject<Store<FlowchartState>>(Store);

  update<K extends keyof NodeOf<'vco'>['config']>(key: K, value: NodeOf<'vco'>['config'][K]) {
    const copy = structuredClone(this.node);
    copy.config[key] = value
    this.store.dispatch(updateNode({ node: copy }));
  }
}
