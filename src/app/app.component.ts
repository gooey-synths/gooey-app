import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './node-selector/node-selector.component';
import { MainCanvasComponent } from "./main-canvas/main-canvas.component";
import { Store } from '@ngrx/store';
import { saveFlowchart } from './store/actions';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, MainCanvasComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'gooey-app';
  private store = inject(Store);

  onSave() {
    this.store.dispatch(saveFlowchart({ filename: 'flowchart.json' }));
  }
}
