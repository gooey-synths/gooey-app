import { Component, Input, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FFlowModule } from '@foblex/flow';
import { Store } from '@ngrx/store';
import { FlowchartState, SynthNode } from '../store/reducers';
import { updateNode } from '../store/actions';
import { NodeDefinitionService } from '../nodes/node-definition.service';
import { ControlDefinition, NodeDefinition, RangeControl, SelectControl } from '../nodes/node-definition';

@Component({
  selector: 'app-dynamic-node',
  imports: [FormsModule, FFlowModule],
  templateUrl: './dynamic-node.component.html',
  styleUrl: './dynamic-node.component.scss',
})
export class DynamicNodeComponent {
  @Input({ required: true }) node!: SynthNode;

  private store = inject<Store<FlowchartState>>(Store);
  private definitions = inject(NodeDefinitionService);

  get definition(): NodeDefinition | undefined {
    return this.definitions.getDefinition(this.node.type);
  }

  asRange(control: ControlDefinition): RangeControl | null {
    return control.type === 'range' ? control : null;
  }

  asSelect(control: ControlDefinition): SelectControl | null {
    return control.type === 'select' ? control : null;
  }

  update(key: string, value: unknown) {
    const copy = structuredClone(this.node);
    copy.config[key] = value;
    this.store.dispatch(updateNode({ node: copy }));
  }
}
