import { createAction, props } from '@ngrx/store';

export const addNode = createAction(
  '[Flowchart] Add Node',
  props<{ node: { type: string; x: number; y: number } }>()
);
