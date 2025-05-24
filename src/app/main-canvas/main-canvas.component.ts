import { Component, inject } from '@angular/core';
import {
  FCreateNodeEvent,
  FFlowModule,
} from '@foblex/flow';
import { addNode } from '../store/actions';
import { select, Store } from '@ngrx/store';
import { AsyncPipe } from '@angular/common';
import { FlowchartState } from '../store/reducers';
import { selectAllNodes } from '../store/selectors';

@Component({
  selector: 'app-main-canvas',
  imports: [FFlowModule, AsyncPipe],
  templateUrl: './main-canvas.component.html',
  styleUrl: './main-canvas.component.scss'
})
export class MainCanvasComponent {

  readonly store = inject(Store<FlowchartState>)

  nodeList$ = this.store.pipe(select(selectAllNodes));

  onDrop(ev: FCreateNodeEvent) {
    let node = {
      id: crypto.randomUUID(), 
      name: ev.data,
      x: ev.rect.x,
      y: ev.rect.y
    }
    this.store.dispatch(addNode({ node }));
  }

}
