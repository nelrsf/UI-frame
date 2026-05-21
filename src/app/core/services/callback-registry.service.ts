import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { setCallbackError } from '../state/status-bar';

type CallbackFn = () => void | Promise<void>;

@Injectable({ providedIn: 'root' })
export class CallbackRegistryService {
  private readonly store = inject(Store);
  private readonly registry = new Map<string, CallbackFn>();

  register(id: string, callback: CallbackFn): void {
    if (this.registry.has(id)) {
      throw new Error(`Callback already registered: ${id}`);
    }
    this.registry.set(id, callback);
  }

  execute(id: string): void {
    const callback = this.registry.get(id);
    if (!callback) {
      throw new Error(`Callback not found: ${id}`);
    }

    try {
      const result = callback();
      if (result instanceof Promise) {
        result.catch((err) => {
          console.error(`[CallbackRegistry] Callback failed: ${id}`, err);
          this.store.dispatch(setCallbackError({ itemId: id }));
        });
      }
    } catch (err) {
      console.error(`[CallbackRegistry] Callback failed: ${id}`, err);
      this.store.dispatch(setCallbackError({ itemId: id }));
      throw err;
    }
  }

  has(id: string): boolean {
    return this.registry.has(id);
  }

  unregister(id: string): void {
    this.registry.delete(id);
  }
}
