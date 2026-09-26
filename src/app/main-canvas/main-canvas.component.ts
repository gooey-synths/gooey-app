import { Component, HostListener, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FCreateNodeEvent,
  FCreateConnectionEvent,
  FFlowModule,
} from '@foblex/flow';
import { addNode, removeNode, addConnection, removeConnection } from '../store/actions';
import { select, Store } from '@ngrx/store';
import { AsyncPipe } from '@angular/common';
import { Connection, FlowchartState, SynthNode } from '../store/reducers';
import { selectAllNodes, selectAllConnections } from '../store/selectors';
import { v4 as uuidv4 } from 'uuid';
import { Observable } from 'rxjs';
import { NodeDefinitionService } from '../nodes/node-definition.service';
import { DynamicNodeComponent } from '../dynamic-node/dynamic-node.component';

@Component({
  selector: 'app-main-canvas',
  imports: [FFlowModule, AsyncPipe, DynamicNodeComponent],
  templateUrl: './main-canvas.component.html',
  styleUrl: './main-canvas.component.scss'
})
export class MainCanvasComponent {
  private store = inject<Store<FlowchartState>>(Store);
  private definitions = inject(NodeDefinitionService);

  nodeList$: Observable<SynthNode[]>;
  connectionList$: Observable<Connection[]>;

  nodeIds: string[] = [];
  connectionIds: string[] = [];
  selectedElement = '';

  constructor() {
    this.nodeList$ = this.store.pipe(select(selectAllNodes));
    this.connectionList$ = this.store.pipe(select(selectAllConnections));

    this.nodeList$.pipe(takeUntilDestroyed()).subscribe(nodes =>
      this.nodeIds = nodes.map(node => node.id)
    );
    this.connectionList$.pipe(takeUntilDestroyed()).subscribe(connections =>
      this.connectionIds = connections.map(connection => connection.id)
    );
  }

  onDrop(ev: FCreateNodeEvent) {
    const definition = this.definitions.getDefinition(ev.data.type);
    if (!definition) {
      console.error(`Unknown node type: ${ev.data.type}`);
      return;
    }
    const node: SynthNode = {
      id: uuidv4(),
      type: definition.type,
      position: {
        x: ev.rect.x,
        y: ev.rect.y,
      },
      config: this.definitions.buildConfig(definition),
    };
    this.store.dispatch(addNode({ node }));
  }

  onConnect(ev: FCreateConnectionEvent) {
    if (!ev.fInputId) {
      console.error('Need input to create connection')
      return
    }
    if (!ev.fOutputId) {
      console.error('Need output to create connection')
      return
    }
    const connection = {
      id: uuidv4(),
      start: ev.fOutputId,
      end: ev.fInputId
    }
    this.store.dispatch(addConnection({ connection }));
  }

  selectElement(id: string) {
    this.selectedElement = id;
  }

  //TODO: could refactor some of this logic into the store
  @HostListener('document:keydown.backspace', ['$event'])
  removeElement() {
    if(this.nodeIds.find(id => id === this.selectedElement)) {
      this.store.dispatch(removeNode({ id: this.selectedElement }));
    }
    else if(this.connectionIds.find(id => id === this.selectedElement)) {
      this.store.dispatch(removeConnection({ id: this.selectedElement }));
    }
    return
  }
}
