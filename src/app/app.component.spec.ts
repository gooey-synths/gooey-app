import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { saveFlowchart } from './store/actions';
import { connectDevice, disconnectDevice, sendToHardware } from './store/hardware.actions';
import { FlowchartState } from './store/reducers';
import { DeviceStatus, SendStatus } from './store/hardware.reducer';
import { selectDeviceStatus, selectSendStatus } from './store/selectors';
import { RouterTestingModule } from '@angular/router/testing';
import { Component } from '@angular/core';
import { AsyncPipe } from '@angular/common';

@Component({ selector: 'app-main-canvas', template: '' })
class MainCanvasStub {}

@Component({ selector: 'app-node-selector', template: '' })
class NodeSelectorStub {}

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let store: MockStore;
  let dispatchSpy: jasmine.Spy;
  let deviceStatus: DeviceStatus;
  let sendStatus: SendStatus;
  const initialState: FlowchartState = {
    nodes: [],
    connections: [],
  };

  beforeEach(async () => {
    deviceStatus = 'disconnected';
    sendStatus = 'idle';

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, AppComponent, MainCanvasStub, NodeSelectorStub],
      providers: [
        provideMockStore({
          initialState: { flowchart: initialState },
        }),
      ],
    })
      .overrideComponent(AppComponent, {
        set: {
          imports: [RouterTestingModule, MainCanvasStub, NodeSelectorStub, AsyncPipe],
        },
      })
      .compileComponents();

    store = TestBed.inject(MockStore);
    store.overrideSelector(selectDeviceStatus, deviceStatus);
    store.overrideSelector(selectSendStatus, sendStatus);
    dispatchSpy = spyOn(store, 'dispatch');

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('onSave() should dispatch saveFlowchart', () => {
    component.onSave();

    expect(dispatchSpy).toHaveBeenCalledWith(saveFlowchart({ filename: 'flowchart.json' }));
  });

  it('onConnect() dispatches connectDevice', () => {
    component.onConnect();

    expect(dispatchSpy).toHaveBeenCalledWith(connectDevice());
  });

  it('onDisconnect() dispatches disconnectDevice', () => {
    component.onDisconnect();

    expect(dispatchSpy).toHaveBeenCalledWith(disconnectDevice());
  });

  it('onSendToHardware() dispatches sendToHardware', () => {
    component.onSendToHardware();

    expect(dispatchSpy).toHaveBeenCalledWith(sendToHardware());
  });

  it('renders a connected status dot when the device is connected', () => {
    store.overrideSelector(selectDeviceStatus, 'connected');
    store.refreshState();
    fixture.detectChanges();

    const dot = fixture.nativeElement.querySelector('[data-testid="connection-dot"]');
    expect(dot).toBeTruthy();
    expect(dot.classList.contains('bg-green-500')).toBeTrue();
  });

  it('shows an idle status dot when the device is disconnected', () => {
    fixture.detectChanges();

    const dot = fixture.nativeElement.querySelector('[data-testid="connection-dot"]');
    expect(dot.classList.contains('bg-gray-500')).toBeTrue();
  });
});
