import { Injectable, isDevMode } from '@angular/core';
import { Observable, Subscriber, Subscription } from 'rxjs';
import { AppEvent, AppEventName, AppEventPayloads } from '../models/app-event.model';

export interface IEventBusService {
  emit<TName extends AppEventName>(
    eventName: TName,
    payload: AppEventPayloads[TName],
    origin?: string
  ): void;
  on<TName extends AppEventName>(eventName: TName): Observable<AppEvent<TName>>;
  off(eventName: AppEventName, subscription: Subscription): void;
}

type AnyAppEvent = AppEvent<AppEventName>;
type ChannelListener = (event: AnyAppEvent) => void;

/** Partial-observer shape kept by RxJS SafeSubscriber (internal, stable across RxJS 7.x). */
interface PartialObserver<T> {
  next?: (value: T) => void;
}

@Injectable({ providedIn: 'root' })
export class EventBusService implements IEventBusService {
  private readonly channels = new Map<string, Set<ChannelListener>>();

  emit<TName extends AppEventName>(
    eventName: TName,
    payload: AppEventPayloads[TName],
    origin = 'unknown'
  ): void {
    const event: AppEvent<TName> = {
      eventName,
      payload,
      timestamp: Date.now(),
      origin,
    };

    if (isDevMode()) {
      console.log('[EventBus]', {
        eventName: event.eventName,
        origin: event.origin,
        timestamp: event.timestamp,
        payload: event.payload,
      });
    }

    const listeners = this.channels.get(eventName);
    if (!listeners) return;

    // Snapshot to avoid mutation issues if a listener modifies the channel.
    for (const listener of [...listeners]) {
      try {
        listener(event as AnyAppEvent);
      } catch (err) {
        // Isolate errors: a failing listener must not break subsequent listeners.
        console.error('[EventBus] Isolated listener error for event', eventName, err);
      }
    }
  }

  on<TName extends AppEventName>(eventName: TName): Observable<AppEvent<TName>> {
    return new Observable((subscriber: Subscriber<AppEvent<TName>>) => {
      // Build a listener that calls the user's callback directly, bypassing RxJS's
      // async error-reporting chain (SafeSubscriber → ConsumerObserver).  This ensures
      // that errors thrown by a subscriber's next-handler are caught synchronously in
      // emit() above, so they neither silence each other nor reach RxJS's
      // reportUnhandledError path.
      //
      // Implementation note: RxJS 7.x (verified with 7.8.x) exposes the user's
      // callback via SafeSubscriber#destination (ConsumerObserver)#partialObserver#next.
      // This internal path is stable across RxJS 7 minor versions.  If a future
      // breaking change removes it, the runtime guard below falls back gracefully to
      // subscriber.next(), which preserves functionality at the cost of synchronous
      // error capture (errors are then deferred by RxJS's reportUnhandledError).
      //
      // When the user pipes operators before subscribing, `partialObserver` is absent
      // (the subscriber is an OperatorSubscriber).  In that case we fall back to the
      // standard subscriber.next() call; error isolation for that branch is handled by
      // the Angular/Zone.js error boundary.
      const consumerObserver = (subscriber as unknown as { destination?: { partialObserver?: PartialObserver<AppEvent<TName>> } })
        .destination;
      const rawNext = typeof consumerObserver?.partialObserver?.next === 'function'
        ? consumerObserver.partialObserver.next.bind(consumerObserver.partialObserver)
        : undefined;

      const listener: ChannelListener = rawNext
        ? (event) => rawNext(event as AppEvent<TName>)
        : (event) => subscriber.next(event as AppEvent<TName>);

      if (!this.channels.has(eventName)) {
        this.channels.set(eventName, new Set());
      }
      this.channels.get(eventName)!.add(listener);

      return () => {
        this.channels.get(eventName)?.delete(listener);
      };
    });
  }

  /**
   * Unsubscribes a subscription previously returned by {@link on}.
   * The `eventName` parameter is part of the service contract for clarity and
   * future validation; cleanup is performed via `subscription.unsubscribe()`.
   */
  off(_eventName: AppEventName, subscription: Subscription): void {
    subscription.unsubscribe();
  }
}
