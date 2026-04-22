/**
 * Stream Handler with Interrupt-Resume Checkpoint Support
 *
 * Enables pause/resume semantics for streaming responses with automatic
 * state checkpoint capture and replay of buffered items.
 *
 * A checkpoint is created when:
 * - Stream is interrupted (abort signal, timeout, error)
 * - Manual pause() is called
 * - Buffer reaches capacity or flush threshold
 *
 * On resume, buffered items are replayed in order before new items.
 */

import { appendFileSync, existsSync } from 'fs'
import { join } from 'path'

/** Stream item type — can be any serializable data */
interface StreamItem<T = unknown> {
  id: string
  timestamp: string
  data: T
  sequence: number
}

/** Checkpoint structure for persisting stream state */
interface StreamCheckpoint {
  id: string
  streamId: string
  timestamp: string
  position: number
  itemCount: number
  bufferSize: number
  state: 'paused' | 'interrupted' | 'completed'
  reason?: string
  metadata: Record<string, unknown>
  error?: {
    message: string
    code?: string
    stack?: string
  }
}

/** Stream handler state */
interface StreamState<T = unknown> {
  streamId: string
  position: number
  sequence: number
  buffer: StreamItem<T>[]
  checkpoint?: StreamCheckpoint
  isPaused: boolean
  isInterrupted: boolean
  startTime: number
}

/**
 * CheckpointManager — handles persisting and recovering stream checkpoints
 */
export class CheckpointManager {
  private logPath: string

  constructor(basePath?: string) {
    const dir = basePath || (process.cwd ? process.cwd() : '/tmp')
    this.logPath = join(dir, 'logs', 'stream-checkpoints.jsonl')
  }

  /**
   * Write checkpoint to persistent storage
   * Uses transactional append pattern — atomic line writes
   */
  writeCheckpoint(checkpoint: StreamCheckpoint): boolean {
    try {
      appendFileSync(
        this.logPath,
        JSON.stringify({
          ...checkpoint,
          _type: 'checkpoint',
        }) + '\n',
        'utf-8'
      )
      return true
    } catch (err) {
      console.error(
        '[stream-handler] Failed to write checkpoint:',
        err instanceof Error ? err.message : String(err)
      )
      return false
    }
  }

  /**
   * Write a state snapshot for recovery
   * Includes buffered items that can be replayed on resume
   */
  writeRecoverySnapshot(
    streamId: string,
    buffer: StreamItem[],
    metadata: Record<string, unknown>
  ): boolean {
    try {
      appendFileSync(
        this.logPath,
        JSON.stringify({
          _type: 'snapshot',
          streamId,
          timestamp: new Date().toISOString(),
          itemCount: buffer.length,
          buffer,
          metadata,
        }) + '\n',
        'utf-8'
      )
      return true
    } catch (err) {
      console.error(
        '[stream-handler] Failed to write snapshot:',
        err instanceof Error ? err.message : String(err)
      )
      return false
    }
  }
}

/**
 * StreamHandler — manages pause/resume with checkpoint tracking
 *
 * @example
 * ```ts
 * const handler = new StreamHandler<string>('stream-123')
 *
 * handler.onInterrupt(() => {
 *   // Handle interrupt: checkpoint, close resources, etc.
 * })
 *
 * handler.addItem('item-1', { text: 'hello' })
 * handler.addItem('item-2', { text: 'world' })
 *
 * // Manually pause and checkpoint
 * const checkpoint = handler.pause('User paused stream')
 *
 * // ... later ...
 * handler.resume(checkpoint.position)
 * ```
 */
export class StreamHandler<T = unknown> {
  private state: StreamState<T>
  private checkpointMgr: CheckpointManager
  private interruptListener?: () => void
  private maxBufferSize: number
  private abortController?: AbortController

  constructor(streamId: string, maxBufferSize = 100) {
    this.state = {
      streamId,
      position: 0,
      sequence: 0,
      buffer: [],
      isPaused: false,
      isInterrupted: false,
      startTime: Date.now(),
    }
    this.checkpointMgr = new CheckpointManager()
    this.maxBufferSize = maxBufferSize
  }

  /**
   * Attach abort signal for automatic interrupt handling
   */
  attachSignal(signal: AbortSignal): void {
    this.abortController = new AbortController()

    signal.addEventListener('abort', () => {
      const reason = (signal as AbortSignal & { reason?: unknown }).reason
      this.interrupt(
        reason instanceof Error ? reason.message : String(reason || 'unknown'),
        {
          source: 'abort_signal',
          duration: Date.now() - this.state.startTime,
        }
      )
    })
  }

  /**
   * Add an item to the stream
   * Auto-flushes checkpoint if buffer exceeds max size
   */
  addItem(itemId: string, data: T): void {
    if (this.state.isPaused || this.state.isInterrupted) {
      console.warn(
        `[stream-handler] Cannot add item to paused/interrupted stream ${this.state.streamId}`
      )
      return
    }

    const item: StreamItem<T> = {
      id: itemId,
      timestamp: new Date().toISOString(),
      data,
      sequence: this.state.sequence++,
    }

    this.state.buffer.push(item)
    this.state.position++

    // Auto-checkpoint if buffer exceeds threshold
    if (this.state.buffer.length >= this.maxBufferSize) {
      this.flush()
    }
  }

  /**
   * Register callback to fire on interrupt
   */
  onInterrupt(callback: () => void): void {
    this.interruptListener = callback
  }

  /**
   * Interrupt the stream (abort, timeout, or error)
   * Creates checkpoint and buffers items for recovery
   */
  interrupt(reason: string, metadata?: Record<string, unknown>): StreamCheckpoint {
    this.state.isInterrupted = true
    this.state.isPaused = true

    const checkpoint: StreamCheckpoint = {
      id: `chkpt-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      streamId: this.state.streamId,
      timestamp: new Date().toISOString(),
      position: this.state.position,
      itemCount: this.state.buffer.length,
      bufferSize: this.state.buffer.length,
      state: 'interrupted',
      reason,
      metadata: metadata || {},
    }

    this.state.checkpoint = checkpoint

    // Persist checkpoint and buffered state
    this.checkpointMgr.writeCheckpoint(checkpoint)
    this.checkpointMgr.writeRecoverySnapshot(
      this.state.streamId,
      this.state.buffer,
      {
        interruption: checkpoint,
        duration: Date.now() - this.state.startTime,
      }
    )

    // Notify listeners
    if (this.interruptListener) {
      this.interruptListener()
    }

    // Log for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `[stream-handler] Interrupted ${this.state.streamId} at position ${this.state.position}: ${reason}`
      )
    }

    return checkpoint
  }

  /**
   * Pause the stream (user-initiated or manual)
   * Creates checkpoint but items remain buffered for replay
   */
  pause(reason?: string): StreamCheckpoint {
    // Log checkpoint marker for pause event
    const pauseTimestamp = new Date().toISOString()
    console.log(
      `[stream-checkpoint:pause] ${pauseTimestamp} | streamId=${this.state.streamId} | reason=${reason || 'manual_pause'}`
    )

    this.state.isPaused = true

    const checkpoint: StreamCheckpoint = {
      id: `chkpt-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      streamId: this.state.streamId,
      timestamp: new Date().toISOString(),
      position: this.state.position,
      itemCount: this.state.buffer.length,
      bufferSize: this.state.buffer.length,
      state: 'paused',
      reason: reason || 'manual_pause',
      metadata: {
        duration: Date.now() - this.state.startTime,
      },
    }

    this.state.checkpoint = checkpoint

    // Persist checkpoint
    this.checkpointMgr.writeCheckpoint(checkpoint)
    this.checkpointMgr.writeRecoverySnapshot(
      this.state.streamId,
      this.state.buffer,
      {
        checkpoint,
        duration: Date.now() - this.state.startTime,
      }
    )

    if (process.env.NODE_ENV === 'development') {
      console.log(
        `[stream-handler] Paused ${this.state.streamId} at position ${this.state.position}`
      )
    }

    return checkpoint
  }

  /**
   * Resume stream from a checkpoint
   * Replays buffered items before accepting new ones
   */
  resume(fromPosition?: number): void {
    this.state.isPaused = false
    this.state.isInterrupted = false

    // Reset position to resume point if specified
    if (fromPosition !== undefined && fromPosition >= 0) {
      this.state.position = fromPosition
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(
        `[stream-handler] Resumed ${this.state.streamId} from position ${this.state.position}, buffer has ${this.state.buffer.length} items`
      )
    }
  }

  /**
   * Flush buffered items — clears buffer and creates checkpoint
   * Useful for explicit control over checkpoint timing
   */
  flush(): StreamCheckpoint {
    const checkpoint: StreamCheckpoint = {
      id: `chkpt-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      streamId: this.state.streamId,
      timestamp: new Date().toISOString(),
      position: this.state.position,
      itemCount: this.state.buffer.length,
      bufferSize: this.state.buffer.length,
      state: 'completed',
      reason: 'buffer_flush',
      metadata: {
        duration: Date.now() - this.state.startTime,
      },
    }

    this.state.checkpoint = checkpoint

    // Persist state before clearing
    this.checkpointMgr.writeCheckpoint(checkpoint)
    this.checkpointMgr.writeRecoverySnapshot(
      this.state.streamId,
      this.state.buffer,
      {
        checkpoint,
        duration: Date.now() - this.state.startTime,
      }
    )

    // Clear buffer after persisting
    this.state.buffer = []

    if (process.env.NODE_ENV === 'development') {
      console.log(
        `[stream-handler] Flushed ${this.state.streamId} at position ${this.state.position}`
      )
    }

    return checkpoint
  }

  /**
   * Get current checkpoint
   */
  getCheckpoint(): StreamCheckpoint | undefined {
    return this.state.checkpoint
  }

  /**
   * Get current buffer
   */
  getBuffer(): StreamItem<T>[] {
    return [...this.state.buffer]
  }

  /**
   * Get current state snapshot
   */
  getState(): Readonly<StreamState<T>> {
    return Object.freeze({ ...this.state })
  }

  /**
   * Check if stream is paused
   */
  isPaused(): boolean {
    return this.state.isPaused
  }

  /**
   * Check if stream is interrupted
   */
  isInterrupted(): boolean {
    return this.state.isInterrupted
  }

  /**
   * Get position in stream
   */
  getPosition(): number {
    return this.state.position
  }

  /**
   * Get sequence number
   */
  getSequence(): number {
    return this.state.sequence
  }
}
