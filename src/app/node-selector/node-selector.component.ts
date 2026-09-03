import { Component, inject } from '@angular/core';
import { FExternalItemDirective, FFlowModule } from '@foblex/flow';
import { NodeDefinitionService } from '../nodes/node-definition.service';

@Component({
  selector: 'app-node-selector',
  imports: [FFlowModule, FExternalItemDirective],
  templateUrl: './node-selector.component.html',
  styleUrl: './node-selector.component.scss'
})
export class SidebarComponent {
  private definitionsService = inject(NodeDefinitionService);

  definitions = this.definitionsService.getDefinitions();
}
