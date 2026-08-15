import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FExternalItemDirective } from '@foblex/flow';

import { SidebarComponent } from './node-selector.component';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render one draggable item per node definition', () => {
    const items = fixture.debugElement.queryAll(By.directive(FExternalItemDirective));

    expect(items.length).toBe(3);
  });

  it('should render the definition label on each item', () => {
    const texts = fixture.debugElement
      .queryAll(By.directive(FExternalItemDirective))
      .map(item => (item.nativeElement as HTMLElement).textContent?.trim());

    expect(texts).toEqual(['VCO', 'Envelope (ADSR)', 'VCA']);
  });
});
