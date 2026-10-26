/**
 * Tiptap 形编辑器的命令桥。
 *
 * 这里故意不 import `@tiptap/core`。分隔线的节点约定在 `nodes/horizontal-rule.ts`，
 * 给没有 ProseMirror 的宿主用。接到真正的 Tiptap 时，本文件只把命令 id 译成
 * `commands.setHorizontalRule()`，光标和输入规则由那个编辑器自己执行。
 */

import type { OjEditorHost, OjEditorState } from './editor-host.ts'

/**
 * Tiptap `Editor` 上这几条命令实际用到的那一小面。方法缺失时视为当前不能执行。
 *
 * `isActive` 与 `can()` 里的方法都要能收参数：对齐不是布尔切换，Tiptap 用
 * `setTextAlign('left')` / `isActive({ textAlign: 'left' })` 表达方向与当前值。
 */
export interface TiptapLikeEditor {
  isActive(name: string | Record<string, unknown>): boolean
  can(): Record<string, ((...args: unknown[]) => boolean) | undefined>
  commands: Record<string, ((...args: unknown[]) => boolean) | undefined>
  on(event: string, handler: () => void): void
  off(event: string, handler: () => void): void
}

interface BridgeEntry {
  can: string
  run: string
  /** 有值时 `state().active` 读 `editor.isActive(active)`。 */
  active?: string | Record<string, unknown>
  /**
   * 固定实参：命令语义里已经确定的那个值（例如左对齐的 `'left'`）。
   * 调用方显式传参时以调用方为准。
   */
  arg?: unknown
}

const BRIDGE: Record<string, BridgeEntry> = {
  'format.bold': { can: 'toggleBold', run: 'toggleBold', active: 'bold' },
  'format.italic': { can: 'toggleItalic', run: 'toggleItalic', active: 'italic' },
  'format.underline': { can: 'toggleUnderline', run: 'toggleUnderline', active: 'underline' },
  // 对齐在 Tiptap 里归 `@tiptap/extension-text-align`，没有 `setAlignLeft` 这个方法名：
  // 方向和当前值都走参数。缺这一条时 `format.alignLeft` 会静默返回 false。
  'format.alignLeft': { can: 'setTextAlign', run: 'setTextAlign', active: { textAlign: 'left' }, arg: 'left' },
  'format.heading': { can: 'toggleHeading', run: 'toggleHeading', active: 'heading' },
  'format.blockquote': { can: 'toggleBlockquote', run: 'toggleBlockquote', active: 'blockquote' },
  'format.bulletList': { can: 'toggleBulletList', run: 'toggleBulletList', active: 'bulletList' },
  'format.orderedList': { can: 'toggleOrderedList', run: 'toggleOrderedList', active: 'orderedList' },
  'format.codeBlock': { can: 'toggleCodeBlock', run: 'toggleCodeBlock', active: 'codeBlock' },
  'insert.hardBreak': { can: 'setHardBreak', run: 'setHardBreak' },
  'insert.horizontalRule': { can: 'setHorizontalRule', run: 'setHorizontalRule' },
  'insert.table': { can: 'insertTable', run: 'insertTable' },
}

function call(table: Record<string, ((...args: unknown[]) => boolean) | undefined>, name: string, arg?: unknown): boolean {
  const fn = table[name]
  if (typeof fn !== 'function') return false
  return fn(arg) !== false
}

/** 桥里登记过的命令 id。用来证明它和 `editorCommands()` 没有漂移。 */
export function bridgedCommandIds(): readonly string[] {
  return Object.keys(BRIDGE)
}

export function tiptapEditorHost(editor: TiptapLikeEditor): OjEditorHost {
  return {
    can(id) {
      const entry = BRIDGE[id]
      if (!entry) return false
      return call(editor.can(), entry.can, entry.arg)
    },
    state(id): OjEditorState {
      const entry = BRIDGE[id]
      if (!entry) return { enabled: false }
      const enabled = call(editor.can(), entry.can, entry.arg)
      if (!entry.active) return { enabled }
      return { enabled, active: editor.isActive(entry.active) }
    },
    exec(id, arg) {
      const entry = BRIDGE[id]
      if (!entry) return false
      return call(editor.commands, entry.run, arg === undefined ? entry.arg : arg)
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
