import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { saveFlowchart } from './store/actions';
import { FlowchartState } from './store/reducers';
import { RouterTestingModule } from '@angular/router/testing';
import { Component } from '@angular/core';

@Component({ selector: 'app-main-canvas', template: '' })
class MainCanvasStub {}

@Component({ selector: 'app-node-selector', template: '' })
class NodeSelectorStub {}

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let store: MockStore;
  let dispatchSpy: jasmine.Spy;
  const initialState: FlowchartState = {
    nodes: [],
    connections: [],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, AppComponent, MainCanvasStub, NodeSelectorStub],
      providers: [
        provideMockStore({ initialState }),
      ],
    }).overrideComponent(AppComponent, {
      set: {
        imports: [RouterTestingModule, MainCanvasStub, NodeSelectorStub],
      },
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    dispatchSpy = spyOn(store, 'dispatch');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have correct title', () => {
    expect(component.title).toBe('gooey-app');
  });

  it('onSave() should dispatch saveFlowchart action', () => {
    component.onSave();

    expect(dispatchSpy).toHaveBeenCalledTimes(1);

    const action = dispatchSpy.calls.mostRecent().args[0];
    expect(action).toEqual(
      saveFlowchart({ filename: 'flowchart.json' })
    );
  });
});
