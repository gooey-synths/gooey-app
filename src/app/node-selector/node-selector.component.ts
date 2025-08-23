import { Component } from '@angular/core';
import { FFlowModule } from '@foblex/flow';

@Component({
  selector: 'app-node-selector',
  imports: [FFlowModule],
  templateUrl: './node-selector.component.html',
  styleUrl: './node-selector.component.scss'
})
export class SidebarComponent {
  nodeTypes = [
    {
      name: 'Node 1'
    },
    {
      name: 'Node 2'
    },
    {
      name: 'Node 3'
    },
    {
      name: 'Node 4'
    },
  ]
}
