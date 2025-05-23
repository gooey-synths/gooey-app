import { Component, inject } from '@angular/core';
import {
  FCreateNodeEvent,
  FFlowModule,
} from '@foblex/flow';
import { addNode } from '../store/actions';
import { select, Store } from '@ngrx/store';
import { AsyncPipe } from '@angular/common';
import { FlowchartState } from '../store/reducers';
import { Observable, pipe, tap, TapObserver } from 'rxjs';
import { selectAllNodes } from '../store/selectors';

interface Node {
  x: number,
  y: number,
  type: string
}

@Component({
  selector: 'app-main-canvas',
  imports: [FFlowModule, AsyncPipe],
  templateUrl: './main-canvas.component.html',
  styleUrl: './main-canvas.component.scss'
})
export class MainCanvasComponent {

  // nodeList:Node[] = [];
  readonly store = inject(Store<FlowchartState>)

  nodeList$ = this.store.pipe(select(selectAllNodes));

  // constructor(private store: Store<FlowchartState>) {
  //   // this.store.pipe(select(selectAllNodes)).subscribe(data => {
  //   //   console.log('Selection', data);
  //   //   this.nodeList = data;
  //   // })
  //   // this.store.select('nodes').subscribe(data => {
  //   //   console.log('Selection', data);
  //   //   this.nodeList = data;
  //   // })
  // }


  onDrop(ev: FCreateNodeEvent) {
    let node = {
      type: 'test',
      x: ev.rect.x,
      y: ev.rect.y
    }
    console.log('addding: ', node);
    this.store.dispatch(addNode({ node }));
  }

}
