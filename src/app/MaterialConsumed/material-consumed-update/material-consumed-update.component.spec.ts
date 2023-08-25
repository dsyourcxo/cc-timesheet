import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialConsumedUpdateComponent } from './material-consumed-update.component';

describe('MaterialConsumedUpdateComponent', () => {
  let component: MaterialConsumedUpdateComponent;
  let fixture: ComponentFixture<MaterialConsumedUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MaterialConsumedUpdateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MaterialConsumedUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
