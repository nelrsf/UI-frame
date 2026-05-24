import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, Type, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { Store } from '@ngrx/store';
import { DragDropService } from '../../services/drag-drop.service';
import { AppState } from '../../../core/state/app.state';
import * as WorkspaceActions from '../../../core/state/workspace';
import { isTabDraggable } from '../../common/ShellTabGuardTypes';
import { SecondaryPanelEntry } from '../../contracts';

/**
 * SecondaryPanelComponent — right-side collapsible dock zone (SecondaryPanel).
 *
 * Renders the secondary-right dock zone defined by the Shell v1 MVP docking scope.
 * Visibility and width are controlled externally via @Input() bindings; resize
 * handle drag is reserved for a future task (widthChange is emitted but the drag
 * interaction is not implemented in this MVP iteration).
 */
@Component({
  selector: 'app-secondary-panel',
  standalone: true,
  imports: [NgComponentOutlet],
  templateUrl: './secondary-panel.component.html',
  styleUrl: './secondary-panel.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SecondaryPanelComponent implements AfterViewInit {
  /** Workspace ID for reorder actions (uses fallback for single-workspace mode). */
  @Input() workspaceId: string = 'ws-default';
  /** Whether the secondary panel is currently shown. */
  @Input() visible: boolean = false;
  /** Current panel width in pixels. */
  @Input() width: number = 300;
  /** Entries hosted in this panel zone. */
  @Input() entries: readonly SecondaryPanelEntry[] = [];
  /** Id of the currently active entry. */
  @Input() activeEntryId: string = '';
  /** Active entry component type rendered in the panel content. */
  @Input() activeComponentType: Type<unknown> | null = null;

  /** Emits the new visibility state when the user toggles or closes the panel. */
  @Output() visibilityChange = new EventEmitter<boolean>();
  /** Reserved for resize-handle drag implementation in a future task. */
  @Output() widthChange = new EventEmitter<number>();
  /** Emits the selected secondary entry id. */
  @Output() activeEntryChange = new EventEmitter<string>();

  @ViewChild('tabList', { static: false }) tabListRef!: ElementRef<HTMLElement>;

  constructor(
    public readonly dragDropService: DragDropService,
    private readonly store: Store<AppState>
  ) {}

  ngAfterViewInit(): void {
    this.dragDropService.registerReorderSource(
      this.tabListRef.nativeElement,
      (fromIndex: number, toIndex: number) => {
        this.store.dispatch(WorkspaceActions.reorderSecondaryPanelEntries({
          workspaceId: this.workspaceId,
          fromIndex,
          toIndex
        }));
      }
    );
  }

  onEntrySelect(entryId: string): void {
    this.activeEntryChange.emit(entryId);
  }

  onToggle(): void {
    this.visibilityChange.emit(!this.visible);
  }

  onClose(): void {
    this.visibilityChange.emit(false);
  }

  onEntryPointerDown(event: PointerEvent, entry: SecondaryPanelEntry): void {
    if (event.button !== 0) return;

    if(!isTabDraggable(entry)) return; 

    this.dragDropService.startDrag(entry, event);
  }
}
