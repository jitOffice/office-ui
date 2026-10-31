/**
 * 编辑器宿主。组件库不持有文档模型，只通过这四个方法读写内核。
 *
 * `subscribe` 与 `@jitoffice/shared` 的 `OjReactiveSource` 同形，注册表可以直接 `bind(host)`。
 * `state` 单独存在，是因为加粗这类命令要同时表达 `enabled` 与 `active`，`can()` 只够回答能不能执行。
 */

export interface OjEditorState {
  enabled?: boolean
  active?: boolean
  indeterminate?: boolean
  value?: string | number
  label?: string
}

export interface OjEditorHost {
  can(id: string): boolean
  exec(id: string, arg?: unknown): boolean
  state(id: string): OjEditorState
  subscribe(listener: () => void): () => void
}

export interface EditorCall {
  id: string
  arg: unknown
}

export interface MemoryEditor {
  readonly host: OjEditorHost
  readonly calls: readonly EditorCall[]
  /** 覆写某条命令的当前态，并通知订阅者。 */
  set(id: string, patch: OjEditorState): void
}

const ENABLED: OjEditorState = Object.freeze({ enabled: true })

/**
 * 测试与 demo 用的内存宿主。
 *
 * 两条 `format.*` 规则按实参分流，因为这两类命令在 UI 上是两种控件：
 *   - 实参是字符串/数字 → **值型命令**（字号、颜色、边框…），记进 `value`，不动 `active`；
 *   - 其它（含无实参）→ **布尔命令**，翻转 `active`。
 *
 * 早先一版对所有 `format.*` 一律翻转 `active`，于是"把字号设成 16"会让字号控件显示成"已选中"，
 * 而真正该变的是 `value`。这类错误只在有了值型命令之后才现形。
 */
export function createMemoryEditor(initial: Record<string, OjEditorState> = {}): MemoryEditor {
  const states = new Map<string, OjEditorState>(Object.entries(initial))
  const calls: EditorCall[] = []
  const listeners = new Set<() => void>()

  function read(id: string): OjEditorState {
    return states.get(id) ?? ENABLED
  }

  function notify(): void {
    for (const listener of [...listeners]) listener()
  }

  const host: OjEditorHost = {
    can: (id) => read(id).enabled !== false,
    state: (id) => read(id),
    exec: (id, arg) => {
      calls.push({ id, arg })
      if (!host.can(id)) return false
      if (id.startsWith('format.')) {
        const current = read(id)
        if (typeof arg === 'string' || typeof arg === 'number') {
          states.set(id, { ...current, value: arg })
        } else {
          states.set(id, { ...current, active: current.active !== true })
        }
        notify()
      }
      return true
    },
    subscribe: (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }

  return {
    host,
    calls,
    set(id, patch) {
      states.set(id, { ...read(id), ...patch })
      notify()
    },
  }
}
