import { TestBed } from '@angular/core/testing';
import { ShellComponent } from './shell.component';

describe('ShellComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShellComponent],
    }).compileComponents();
  });

  it('should create the shell component', () => {
    const fixture = TestBed.createComponent(ShellComponent);
    const shell = fixture.componentInstance;
    expect(shell).toBeTruthy();
  });

  it('should render a shell-root container', () => {
    const fixture = TestBed.createComponent(ShellComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.shell-root')).not.toBeNull();
  });

  it('should not render Angular starter placeholder content', () => {
    const fixture = TestBed.createComponent(ShellComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.angular-logo')).toBeNull();
    expect(compiled.querySelector('.pill-group')).toBeNull();
    expect(compiled.textContent).not.toContain('Hello,');
    expect(compiled.textContent).not.toContain('Congratulations!');
  });
});
