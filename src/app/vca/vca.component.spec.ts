import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VcaComponent } from './vca.component';

describe('VcaComponent', () => {
  let component: VcaComponent;
  let fixture: ComponentFixture<VcaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VcaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VcaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
