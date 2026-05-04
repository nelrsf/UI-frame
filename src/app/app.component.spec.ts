import { TestBed } from '@angular/core/testing';
import { provideStore } from '@ngrx/store';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideStore({})],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should mount app-shell as the root element', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-shell')).not.toBeNull();
  });

  it('should not render Angular starter placeholder markup', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.angular-logo')).toBeNull();
    expect(compiled.querySelector('.pill-group')).toBeNull();
    expect(compiled.querySelector('h1')).toBeNull();
  });
});

