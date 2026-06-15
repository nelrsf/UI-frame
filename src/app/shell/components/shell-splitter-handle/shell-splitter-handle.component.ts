import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-shell-splitter-handle',
  standalone: true,
  templateUrl: './shell-splitter-handle.component.html',
  styleUrls: ['./shell-splitter-handle.component.css'],
})
export class ShellSplitterHandleComponent {
  @Input() variant: 'horizontal' | 'vertical' = 'horizontal';
  @Input() testId = '';
  @Input() ariaLabel = 'Resize panel';
  @Input() ariaOrientation: 'horizontal' | 'vertical' = 'horizontal';

  @Output() pointerDown = new EventEmitter<PointerEvent>();
  @Output() pointerMove = new EventEmitter<PointerEvent>();
  @Output() pointerUp = new EventEmitter<PointerEvent>();
  @Output() pointerCancel = new EventEmitter<PointerEvent>();
}
