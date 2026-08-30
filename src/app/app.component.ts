import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './node-selector/node-selector.component';
import { MainCanvasComponent } from "./main-canvas/main-canvas.component";
import { Store } from '@ngrx/store';
import { saveFlowchart } from './store/actions';
import {
  connectDevice,
  disconnectDevice,
  sendToHardware,
} from './store/hardware.actions';
import { selectDeviceStatus, selectSendStatus } from './store/selectors';
import { SerialService } from './services/usb/serial.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, MainCanvasComponent, AsyncPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'gooey-app';
  private store = inject(Store);
  private serial = inject(SerialService);
  deviceStatus$ = this.store.select(selectDeviceStatus);
  sendStatus$ = this.store.select(selectSendStatus);

  constructor() {
    this.serial.received$.subscribe((text) => {
      if (text) {
        console.log('[serial]', text);
      }
    });
  }

  onSave() {
    this.store.dispatch(saveFlowchart({ filename: 'flowchart.json' }));
  }

  onConnect() {
    this.store.dispatch(connectDevice());
  }

  onDisconnect() {
    this.store.dispatch(disconnectDevice());
  }

  onSendToHardware() {
    this.store.dispatch(sendToHardware());
  }
}
