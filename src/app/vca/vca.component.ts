import { Component, Input } from '@angular/core';
import { SynthNode } from '../store/reducers';
import { FormsModule } from '@angular/forms';
import { FFlowModule } from '@foblex/flow';

@Component({
  selector: 'app-vca',
  imports: [FormsModule, FFlowModule],
  templateUrl: './vca.component.html',
  styleUrls: ['./vca.component.scss']
})
export class VcaComponent {
  @Input({ required: true }) node!: SynthNode;
}
