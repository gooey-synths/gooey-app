import { createAction, props } from '@ngrx/store';
import { SynthNode, Connection, FlowchartState } from './reducers';

export const addNode = createAction(
  '[Flowchart] Add Node',
  props<{ node: SynthNode }>()
);

export const updateNode = createAction(
  '[Flowchart] Update Node',
  props<{ node: SynthNode }>()
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

export const saveFlowchart = createAction(
  '[Flowchart] Save Flowchart',
  props<{ filename?: string }>()
);

export const saveFlowchartSuccess = createAction(
  '[Flowchart] Save Flowchart Success'
);

export const saveFlowchartFailure = createAction(
  '[Flowchart] Save Flowchart Failure',
  props<{ error: any }>()
);
