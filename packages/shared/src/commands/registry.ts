/**
 * 命令注册表：全库唯一的事实源（03 §1）。
 *
 * UI 组件不持有行为，只渲染命令。因此这里必须同时做到三件事：
 *  1. 不依赖任何框架 —— Vue 组件、jQuery 页面、Node 服务端读同一张表；
 *  2. 求值昂贵时不可击穿 —— 合帧 + 记忆化 + 脏检查，否则拖选长文档会掉帧；
 *  3. 只反映真相 —— 注册表自己不持有 `active`，`run()` 抛错也不得留下半程状态。
 */

import type {
  OjCommand,
  OjCommandRegistry,
  OjCommandRegistryOptions,
  OjCommandState,
  OjHistoryAdapter,
  OjListQuery,
  OjMessage,
  OjReactiveSource,
  OjRunResult,
  OjStateListener,
} from './types.ts'

interface Slot<C> {
  command: OjCommand<C>
  /** 注册次序，`order` 相同时的稳定 tiebreak。 */
  seq: number
  state: OjCommandState
  /** 最近一次已广播给订阅者的值，diff 的基准；`undefined` 表示尚未建立基线。 */
  pushed: OjCommandState | undefined
  /** 该 state 属于哪个失效代次。 */
  epoch: number
}

const NO_STATE: OjCommandState = Object.freeze({ enabled: true })

function sameState(a: OjCommandState | undefined, b: OjCommandState | undefined): boolean {
  if (a === undefined || b === undefined) return a === b
  return (
    a.enabled === b.enabled &&
    a.active === b.active &&
    a.indeterminate === b.indeterminate &&
    a.value === b.value &&
    a.label === b.label
  )
}

function defaultSchedule(task: () => void): void {
  const raf = (globalThis as { requestAnimationFrame?: (cb: () => void) => number }).requestAnimationFrame
  if (typeof raf === 'function') raf(task)
  else setTimeout(task, 0)
}

export function createCommandRegistry<C = unknown>(options: OjCommandRegistryOptions<C> = {}): OjCommandRegistry<C> {
  const dev = options.dev ?? false
  const contextProvider = options.context ?? ((): C => undefined as C)
  const resolveMessage = options.resolve ?? ((message: OjMessage): string => (typeof message === 'string' ? message : message.key))
  const schedule = options.schedule ?? defaultSchedule

  const slots = new Map<string, Slot<C>>()
  const listeners = new Map<string, Set<OjStateListener>>()
  const unbinders: (() => void)[] = []

  let seq = 0
  let epoch = 0
  let frameQueued = false
  let disposed = false

  function labelOf(command: OjCommand<C>): string {
    return resolveMessage(command.label)
  }

  function publish(e: Slot<C>): void {
    const previous = e.pushed
    e.pushed = e.state
    // 首次求值只建立基线，不广播：订阅方（Vue 的 ref、jQuery 的回调）自己会先读一次
    // state()，此时再推一次"从 undefined 到当前值"是伪变化，会让每个按钮多渲染一遍。
    if (previous === undefined || sameState(previous, e.state)) return
    const set = listeners.get(e.command.id)
    if (!set) return
    for (const fn of [...set]) fn(e.state, previous)
  }

  /** 求值并广播。`state()` 的惰性路径与合帧路径共用这一条，保证任何一次真实变化都不会漏通知。 */
  function refresh(e: Slot<C>): void {
    if (e.command.state && e.epoch !== epoch) {
      e.state = e.command.state(contextProvider())
      e.epoch = epoch
    }
    publish(e)
  }

  function flush(): void {
    frameQueued = false
    if (disposed) return
    for (const e of slots.values()) refresh(e)
  }

  /** 宣告"外部状态可能变了"。合帧：一帧内一千次选区变化只重算一轮。 */
  function invalidate(): void {
    epoch += 1
    if (disposed || frameQueued) return
    frameQueued = true
    schedule(flush)
  }

  function slotOf(id: string): Slot<C> | undefined {
    return disposed ? undefined : slots.get(id)
  }

  function register(command: OjCommand<C>): () => void {
    if (typeof command.id !== 'string' || command.id.length === 0) {
      throw new TypeError('命令必须有非空 id')
    }
    if (typeof command.run !== 'function') {
      throw new TypeError(`命令 ${command.id} 必须有 run`)
    }
    const previous = slots.get(command.id)
    if (previous && dev) {
      console.warn(`[oj/commands] 重复注册 "${command.id}"，后注册的覆盖前者（生产模式下静默）`)
    }
    const e: Slot<C> = { command, seq: seq++, state: NO_STATE, pushed: undefined, epoch: -1 }
    slots.set(command.id, e)
    invalidate()
    return () => {
      // 只摘自己：后注册的同 id 命令不该被前一个的 dispose 误删
      if (slots.get(command.id) === e) {
        slots.delete(command.id)
        listeners.delete(command.id)
        invalidate()
      }
    }
  }

  function unregister(id: string): boolean {
    const had = slots.delete(id)
    listeners.delete(id)
    if (had) invalidate()
    return had
  }

  function list(query: OjListQuery<C> = {}): OjCommand<C>[] {
    const ctx = query.context === undefined ? contextProvider() : query.context
    const picked: Slot<C>[] = []
    for (const e of slots.values()) {
      const c = e.command
      if (query.group !== undefined && c.group !== query.group) continue
      if (!query.includeUnavailable && c.when && !c.when(ctx)) continue
      picked.push(e)
    }
    picked.sort((a, b) => (a.command.order ?? 0) - (b.command.order ?? 0) || a.seq - b.seq)
    return picked.map((e) => e.command)
  }

  function state(id: string): OjCommandState | undefined {
    const e = slotOf(id)
    if (!e) return undefined
    refresh(e)
    return e.state
  }

  async function run(id: string, arg?: unknown): Promise<OjRunResult> {
    const e = slotOf(id)
    if (!e) return { id, ok: false, skipped: 'not-found' }
    const command = e.command
    const ctx = contextProvider()
    if (command.when && !command.when(ctx)) return { id, ok: false, skipped: 'when' }

    // enabled 必须现算：渲染侧缓存的 state 可能已经过期，
    // 拿缓存值放行就等于执行了一个本不该被执行的命令。
    const live = command.state ? command.state(ctx) : undefined
    if (live && live.enabled === false) return { id, ok: false, skipped: 'disabled' }

    const mode = command.history ?? 'undoable'
    const label = labelOf(command)
    const adapter: OjHistoryAdapter | undefined = options.history
    try {
      const invoke = () => command.run(ctx, arg)
      const outcome = mode === 'undoable' && adapter ? adapter.transact(label, invoke) : invoke()
      await outcome
      if (mode !== 'none') adapter?.recordRecent?.(label)
      invalidate()
      return { id, ok: true }
    } catch (error) {
      // 出错也要让状态与真相同步：引擎可能已经改了一半，UI 不能继续显示改之前那帧
      invalidate()
      if (options.onError) options.onError(error, id)
      else console.error(`[oj/commands] "${id}" 执行失败`, error)
      return { id, ok: false, error }
    }
  }

  function subscribe(id: string, listener: OjStateListener): () => void {
    let set = listeners.get(id)
    if (!set) {
      set = new Set()
      listeners.set(id, set)
    }
    set.add(listener)
    return () => {
      const current = listeners.get(id)
      if (!current) return
      current.delete(listener)
      if (current.size === 0) listeners.delete(id)
    }
  }

  function bind(source: OjReactiveSource): () => void {
    const detach = source.subscribe(() => invalidate())
    const record = (): void => {
      detach()
      const i = unbinders.indexOf(record)
      if (i >= 0) unbinders.splice(i, 1)
    }
    unbinders.push(record)
    // 刚挂上就取一次：宿主可能在 bind 之前已经变过，注册表无从得知。
    invalidate()
    return record
  }

  function dispose(): void {
    disposed = true
    for (const off of [...unbinders]) off()
    listeners.clear()
    slots.clear()
  }

  return {
    register,
    unregister,
    get: (id) => slotOf(id)?.command,
    list,
    state,
    run,
    bind,
    refresh: invalidate,
    subscribe,
    resolve: resolveMessage,
    dispose,
  }
}
