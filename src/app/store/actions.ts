import { createAction, props } from '@ngrx/store';

export const addNode = createAction(
  '[Flowchart] Add Node',
  props<{ node: { id: string, name: string; x: number; y: number } }>()
);
