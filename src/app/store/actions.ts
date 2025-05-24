import { createAction, props } from '@ngrx/store';
import { Node } from './reducers';

export const addNode = createAction(
  '[Flowchart] Add Node',
  props<{ node: Node }>()
);
