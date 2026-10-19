/**
 * Tiptap 形编辑器的命令桥。
 *
 * 这里故意不 import `@tiptap/core`。分隔线的节点约定在 `nodes/horizontal-rule.ts`，
 * 给没有 ProseMirror 的宿主用。接到真正的 Tiptap 时，本文件只把命令 id 译成
 * `commands.setHorizontalRule()`，光标和输入规则由那个编辑器自己执行。
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
  'format.italic': { can: 'toggleItalic', run: 'toggleItalic', active: 'italic' },
  'format.underline': { can: 'toggleUnderline', run: 'toggleUnderline', active: 'underline' },
  'format.heading': { can: 'toggleHeading', run: 'toggleHeading', active: 'heading' },
  'format.blockquote': { can: 'toggleBlockquote', run: 'toggleBlockquote', active: 'blockquote' },
  'format.bulletList': { can: 'toggleBulletList', run: 'toggleBulletList', active: 'bulletList' },
  'format.orderedList': { can: 'toggleOrderedList', run: 'toggleOrderedList', active: 'orderedList' },
  'format.codeBlock': { can: 'toggleCodeBlock', run: 'toggleCodeBlock', active: 'codeBlock' },
  'insert.hardBreak': { can: 'setHardBreak', run: 'setHardBreak' },
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
