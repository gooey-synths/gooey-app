import { Component, Input } from '@angular/core';
import { NodeOf } from '../store/reducers';
import { FormsModule } from '@angular/forms';
import { FFlowModule } from '@foblex/flow';

@Component({
  selector: 'app-vco',
  imports: [FormsModule, FFlowModule],
  templateUrl: './vco.component.html',
  styleUrl: './vco.component.scss',
})
export class VcoComponent {
  @Input({ required: true }) node!: NodeOf<'vco'>;
  waveform: 'sine' | 'square' | 'saw' = 'sine';

  frequency = 440;
  pw = 0.5;

  // These would normally be driven by CV
  vOctConnected = false;
  pwmConnected = false;
}
