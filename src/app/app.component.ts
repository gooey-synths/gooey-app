import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './node-selector/node-selector.component';
import { MainCanvasComponent } from "./main-canvas/main-canvas.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SidebarComponent, MainCanvasComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'gooey-app';
}
