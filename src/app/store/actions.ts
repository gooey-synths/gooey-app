import { createAction, props } from '@ngrx/store';
import { Node, Connection } from './reducers';

export const addNode = createAction(
  '[Flowchart] Add Node',
  props<{ node: Node }>()
);

export const removeNode = createAction(
  '[Flowchart] Remove Node',
  props<{ id: string }>()
);

export const addConnection = createAction(
  '[Flowchart] Add Connection between two nodes',
  props<{ connection: Connection }>()
);

export const removeConnection = createAction(
  '[Flowchart] Remove Connection between two nodes',
  props<{ id: string }>()
);
