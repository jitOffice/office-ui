/**
 * Tiptap 形编辑器的命令桥。
 *
 * 这里故意不 import `@tiptap/core`：节点实现（`<hr>` 解析、光标落到规则后、文末补段落、
 * 行首 `---` 输入规则）留在内核，见 prd/06。本文件只把稳定的命令 id 译成 Tiptap 的方法名。
 */

import type { OjEditorHost, OjEditorState } from './editor-host.ts'

/** Tiptap `Editor` 上这几条命令实际用到的那一小面。方法缺失时视为当前不能执行。 */
export interface TiptapLikeEditor {
  isActive(name: string): boolean
  can(): Record<string, (() => boolean) | undefined>
  commands: Record<string, ((arg?: unknown) => boolean) | undefined>
  on(event: string, handler: () => void): void
  off(event: string, handler: () => void): void
}

interface BridgeEntry {
  can: string
  run: string
  /** 有值时 `state().active` 读 `editor.isActive(active)`。 */
  active?: string
}

const BRIDGE: Record<string, BridgeEntry> = {
  'format.bold': { can: 'toggleBold', run: 'toggleBold', active: 'bold' },
  'insert.horizontalRule': { can: 'setHorizontalRule', run: 'setHorizontalRule' },
  'insert.table': { can: 'insertTable', run: 'insertTable' },
}

function call(table: Record<string, ((arg?: unknown) => boolean) | undefined>, name: string, arg?: unknown): boolean {
  const fn = table[name]
  if (typeof fn !== 'function') return false
  return fn(arg) !== false
}

export function tiptapEditorHost(editor: TiptapLikeEditor): OjEditorHost {
  return {
    can(id) {
      const entry = BRIDGE[id]
      if (!entry) return false
      return call(editor.can(), entry.can)
    },
    state(id): OjEditorState {
      const entry = BRIDGE[id]
      if (!entry) return { enabled: false }
      const enabled = call(editor.can(), entry.can)
      if (!entry.active) return { enabled }
      return { enabled, active: editor.isActive(entry.active) }
    },
    exec(id, arg) {
      const entry = BRIDGE[id]
      if (!entry) return false
      return call(editor.commands, entry.run, arg)
    },
    subscribe(listener) {
      editor.on('transaction', listener)
      editor.on('selectionUpdate', listener)
      return () => {
        editor.off('transaction', listener)
        editor.off('selectionUpdate', listener)
      }
    },
  }
}
