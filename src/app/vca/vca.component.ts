import { Component, Input } from '@angular/core';
import { NodeOf } from '../store/reducers';
import { FormsModule } from '@angular/forms';
import { FFlowModule } from '@foblex/flow';

@Component({
  selector: 'app-vca',
  imports: [FormsModule, FFlowModule],
  templateUrl: './vca.component.html',
  styleUrls: ['./vca.component.scss']
})
export class VcaComponent {
  @Input({ required: true }) node!: NodeOf<'vca'>;
  // node: NodeOf<'vca'> = {
  //   id: 'vca1',
  //   type: 'vca',
  //   position: { x: 100, y: 300 },
  //   config: {
  //     inputs: {}
  //   }
  // };
  updateInput(key: string, value: string) {}

  // updateInput(key: keyof VcaNode['config']['inputs'], value: string) {
  //   this.node.config.inputs[key] = value;
  //   // optionally emit change to store here
  // }
}
