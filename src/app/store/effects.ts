import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store, select } from '@ngrx/store';
import { from, of } from 'rxjs';
import { catchError, map, switchMap, withLatestFrom } from 'rxjs/operators';
import { FileService } from '../services/file.service';
import { saveFlowchart, saveFlowchartSuccess, saveFlowchartFailure } from './actions';
import { FlowchartState } from './reducers';
import { selectAllNodes, selectAllConnections } from './selectors';

@Injectable()
export class FlowchartEffects {
  private actions$ = inject(Actions);
  private store = inject<Store<FlowchartState>>(Store);
  private fileService = inject(FileService);

  saveFlowchart$ = createEffect(() =>
    this.actions$.pipe(
      ofType(saveFlowchart),
      withLatestFrom(
        this.store.pipe(select(selectAllNodes)),
        this.store.pipe(select(selectAllConnections))
      ),
      switchMap(([action, nodes, connections]) => {
        const data = { nodes, connections };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });

        return from(this.fileService.saveFile(blob, {
          suggestedName: action.filename || 'flowchart.json',
        })).pipe(
          map(() => saveFlowchartSuccess()),
          catchError(error => of(saveFlowchartFailure({ error })))
        );
      })
    )
  );
}
