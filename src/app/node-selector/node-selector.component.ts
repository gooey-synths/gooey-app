import { Component } from '@angular/core';
import { FExternalItemDirective, FFlowModule } from '@foblex/flow';
import { VcoComponent } from '../vco/vco.component';
import { NodeOf } from '../store/reducers';

@Component({
  selector: 'app-node-selector',
  imports: [FFlowModule, FExternalItemDirective],
  templateUrl: './node-selector.component.html',
  styleUrl: './node-selector.component.scss'
})
export class SidebarComponent {
  vco: NodeOf<'vco'> = {
    id: 'vco-1',
    type: 'vco',
    position: { x: 0, y: 0 },
    config: {
      waveform: 'sine',
      frequency: 440,
      pw: 0.5,
      inputs: {
        cv: 'cv-1',
        pwm: 'pwm-1',
      },
      outputs: {
        out: 'out-1'
      }
    }
  };
  envelope: NodeOf<'envelope'> = {
    id: 'env1',
    type: 'envelope',
    position: { x: 100, y: 300 },
    config: {
      attack: 0.01,
      decay: 0.1,
      sustain: 0.7,
      release: 0.2,
      outputs: {
        out: 'out-1'
      }
    }
  };
  vca: NodeOf<'vca'> = {
    id: 'vca1',
    type: 'vca',
    position: { x: 100, y: 300 },
    config: {
      inputs: {
        audio: 'audio-1',
        cv: 'cv-1'
      }
    }
  };
  nodeTypes = [
    this.vco,
    this.envelope,
    this.vca
  ]
}
