/**
 * Core EventBus Implementation
 * 
 * A lightweight, type-safe publish-subscribe system for async event-driven
 * communication between the God agent and specialist agents.
 */

import {
  TypedEvent,
  EventType,
  EventListener,
  NamedEventListener,
  EventBusOptions,
  EmitOptions,
} from './types'

/**
 * Event emission record for debugging and tracing
 */
interface EventRecord {
  event: TypedEvent
  emittedAt: Date
  listenerCount: number
  processingTimeMs: number
}

/**
 * Typed EventBus class
 */
export class EventBus {
  private listeners: Map<EventType, NamedEventListener[]> = new Map()
  private history: EventRecord[] = []
  private options: Required<EventBusOptions>

  constructor(options: EventBusOptions = {}) {
    this.options = {
      maxHistorySize: options.maxHistorySize ?? 1000,
      debug: options.debug ?? false,
      listenerTimeout: options.listenerTimeout ?? 5000,
    }

    if (this.options.debug) {
      console.log('[EventBus] Initialized')
    }
  }

  /**
   * Subscribe to events of a specific type
   */
  on<T extends EventType>(
    type: T,
    listener: EventListener<T>,
    options?: { priority?: number; name?: string }
  ): () => void {
    const priority = options?.priority ?? 0
    const name = options?.name ?? `listener_${Date.now()}_${Math.random()}`

    const listeners = this.listeners.get(type) || []
    const namedListener: NamedEventListener<T> = {
      name,
      priority,
      listener,
    }

    listeners.push(namedListener as unknown as NamedEventListener)
    listeners.sort((a, b) => b.priority - a.priority) // Sort by priority descending

    this.listeners.set(type, listeners)

    if (this.options.debug) {
      console.log(`[EventBus] Listener registered: ${type} (${name}) with priority ${priority}`)
    }

    // Return unsubscribe function
    return () => {
      const idx = listeners.indexOf(namedListener as unknown as NamedEventListener)
      if (idx !== -1) {
        listeners.splice(idx, 1)
        if (this.options.debug) {
          console.log(`[EventBus] Listener unregistered: ${type} (${name})`)
        }
      }
    }
  }

  /**
   * Subscribe to events once only
   */
  once<T extends EventType>(
    type: T,
    listener: EventListener<T>,
    options?: { priority?: number; name?: string }
  ): () => void {
    const wrappedListener = async (event: Extract<TypedEvent, { type: T }>) => {
      const result = await (listener as (e: Extract<TypedEvent, { type: T }>) => unknown)(event)
      unsubscribe()
      return result
    }

    const unsubscribe = this.on(type, wrappedListener as EventListener<T>, {
      ...options,
      name: options?.name ?? `once_${Date.now()}`,
    })

    return unsubscribe
  }

  /**
   * Emit a typed event to all listeners
   */
  async emit<T extends EventType>(
    event: Extract<TypedEvent, { type: T }>,
    emitOptions: EmitOptions = {}
  ): Promise<void> {
    const waitForListeners = emitOptions.waitForListeners ?? true
    const timeout = emitOptions.timeout ?? this.options.listenerTimeout

    const startTime = Date.now()
    const listeners = this.listeners.get(event.type) || []

    if (this.options.debug) {
      console.log(
        `[EventBus] Emitting event: ${event.type} to ${listeners.length} listeners`
      )
    }

    try {
      if (waitForListeners) {
        // Execute all listeners in parallel with timeout
        await this.executeListenersWithTimeout(listeners as unknown as NamedEventListener<T>[], event, timeout)
      } else {
        // Fire and forget
        this.executeListenersWithTimeout(listeners as unknown as NamedEventListener<T>[], event, timeout).catch(err => {
          console.error(`[EventBus] Error in fire-and-forget listeners: ${event.type}`, err)
        })
      }
    } catch (error) {
      console.error(`[EventBus] Error emitting event: ${event.type}`, error)
      throw error
    } finally {
      const processingTimeMs = Date.now() - startTime
      this.recordEvent(event, listeners.length, processingTimeMs)
    }
  }

  /**
   * Execute listeners with timeout protection
   */
  private async executeListenersWithTimeout<T extends EventType>(
    listeners: NamedEventListener<T>[],
    event: Extract<TypedEvent, { type: T }>,
    timeout: number
  ): Promise<void> {
    const promises = listeners.map(async (namedListener) => {
      try {
        const listenerPromise = Promise.resolve(namedListener.listener(event))
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new Error(`Listener timeout after ${timeout}ms: ${namedListener.name}`)),
            timeout
          )
        )
        await Promise.race([listenerPromise, timeoutPromise])
      } catch (error) {
        console.error(
          `[EventBus] Error in listener ${namedListener.name} for event ${event.type}:`,
          error
        )
        // Don't rethrow — allow other listeners to continue
      }
    })

    await Promise.all(promises)
  }

  /**
   * Record event in history for debugging
   */
  private recordEvent(event: TypedEvent, listenerCount: number, processingTimeMs: number): void {
    this.history.push({
      event,
      emittedAt: new Date(),
      listenerCount,
      processingTimeMs,
    })

    // Keep history bounded
    if (this.history.length > this.options.maxHistorySize) {
      this.history.shift()
    }
  }

  /**
   * Get listener count for a specific event type
   */
  getListenerCount<T extends EventType>(type: T): number {
    return this.listeners.get(type)?.length ?? 0
  }

  /**
   * Get all registered event types
   */
  getRegisteredTypes(): EventType[] {
    return Array.from(this.listeners.keys())
  }

  /**
   * Get event history (for debugging)
   */
  getHistory(limit?: number): EventRecord[] {
    if (!limit) return [...this.history]
    return this.history.slice(-limit)
  }

  /**
   * Clear all listeners for a type (or all types if not specified)
   */
  clear<T extends EventType>(type?: T): void {
    if (type) {
      this.listeners.delete(type)
      if (this.options.debug) {
        console.log(`[EventBus] Cleared all listeners for type: ${type}`)
      }
    } else {
      this.listeners.clear()
      if (this.options.debug) {
        console.log('[EventBus] Cleared all listeners')
      }
    }
  }

  /**
   * Debug: print current state
   */
  debugState(): void {
    console.log('[EventBus] Current State:')
    console.log('Registered Types:', Array.from(this.listeners.keys()))
    for (const [type, listeners] of this.listeners.entries()) {
      console.log(`  ${type}: ${listeners.length} listeners`)
      listeners.forEach(l => console.log(`    - ${l.name} (priority: ${l.priority})`))
    }
    console.log(`History: ${this.history.length}/${this.options.maxHistorySize}`)
  }
}

/**
 * Singleton instance of the global event bus
 */
let globalEventBus: EventBus | null = null

/**
 * Get or create the global event bus instance
 */
export function getEventBus(options?: EventBusOptions): EventBus {
  if (!globalEventBus) {
    globalEventBus = new EventBus(options)
  }
  return globalEventBus
}

/**
 * Reset the global event bus (mainly for testing)
 */
export function resetEventBus(): void {
  if (globalEventBus) {
    globalEventBus.clear()
  }
  globalEventBus = null
}
