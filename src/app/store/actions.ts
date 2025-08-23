import { createAction, props } from '@ngrx/store';
import { Node, Connection } from './reducers';

export const addNode = createAction(
  '[Flowchart] Add Node',
  props<{ node: Node }>()
);

export const addConnection = createAction(
  '[Flowchart] Add Connection between two nodes',
  props<{ connection: Connection }>()
);
