import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VcoComponent } from './vco.component';

describe('VcoComponent', () => {
  let component: VcoComponent;
  let fixture: ComponentFixture<VcoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VcoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VcoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
