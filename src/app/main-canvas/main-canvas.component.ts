import { Component, inject } from '@angular/core';
import {
  FCreateNodeEvent,
  FCreateConnectionEvent,
  FFlowModule,
} from '@foblex/flow';
import { addNode, addConnection } from '../store/actions';
import { select, Store } from '@ngrx/store';
import { AsyncPipe } from '@angular/common';
import { FlowchartState } from '../store/reducers';
import { selectAllNodes, selectAllConnections } from '../store/selectors';

@Component({
  selector: 'app-main-canvas',
  imports: [FFlowModule, AsyncPipe],
  templateUrl: './main-canvas.component.html',
  styleUrl: './main-canvas.component.scss'
})
export class MainCanvasComponent {

  readonly store = inject(Store<FlowchartState>)

  nodeList$ = this.store.pipe(select(selectAllNodes));
  connectionList$ = this.store.pipe(select(selectAllConnections));

  onDrop(ev: FCreateNodeEvent) {
    const node = {
      id: crypto.randomUUID(),
      name: ev.data,
      x: ev.rect.x,
      y: ev.rect.y
    }
    this.store.dispatch(addNode({ node }));
  }

  onConnect(ev: FCreateConnectionEvent) {
    console.log(ev)
    const connection = {
      id: crypto.randomUUID(),
      start: ev.fOutputId!,
      end: ev.fInputId!
    }
    this.store.dispatch(addConnection({ connection }));
  }
}
