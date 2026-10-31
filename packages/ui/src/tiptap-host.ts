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
  /**
   * 值型命令（字号、颜色、行距…）。`true` 时"能不能执行"只看方法在不在：
   * `editor.can().setFontFamily()` 缺参调用没有意义，问出来的 false 也不代表扩展没装。
   */
  value?: boolean
  /**
   * 把命令的值翻译成 Tiptap 认的实参。典型例子是 `format.align`：
   * 命令层要同时表达水平与垂直（`"center middle"`），而 `setTextAlign` 只收水平方向。
   */
  toArg?: (arg: unknown) => unknown
}

const BRIDGE: Record<string, BridgeEntry> = {
  'format.bold': { can: 'toggleBold', run: 'toggleBold', active: 'bold' },
  'format.italic': { can: 'toggleItalic', run: 'toggleItalic', active: 'italic' },
  'format.underline': { can: 'toggleUnderline', run: 'toggleUnderline', active: 'underline' },
  // 对齐在 Tiptap 里归 `@tiptap/extension-text-align`，没有 `setAlignLeft` 这个方法名：
  // 方向和当前值都走参数。缺这一条时 `format.alignLeft` 会静默返回 false。
  'format.alignLeft': { can: 'setTextAlign', run: 'setTextAlign', active: { textAlign: 'left' }, arg: 'left' },
  // 值型命令：方法名按各扩展的公开名写（`@tiptap/extension-font-family` / `-color` /
  // `-text-align` 都是这个拼法）。没装扩展时 `can()` 为 false，控件灰显而不是静默无效。
  'format.fontFamily': { can: 'setFontFamily', run: 'setFontFamily', value: true },
  'format.fontSize': { can: 'setFontSize', run: 'setFontSize', value: true },
  'format.textColor': { can: 'setColor', run: 'setColor', value: true },
  // 边框没有官方扩展：宿主给了 `setBorder` 就能用，没给就灰着——这比"假装成功"诚实。
  'format.border': { can: 'setBorder', run: 'setBorder', value: true },
  'format.lineSpacing': { can: 'setLineHeight', run: 'setLineHeight', value: true, toArg: (arg) => String(arg) },
  'format.align': {
    can: 'setTextAlign',
    run: 'setTextAlign',
    value: true,
    // 垂直方向在 Tiptap 里没有对应命令（`text-align` 只作用在文本流上），
    // 直接透传会让 `setTextAlign('center middle')` 写进一个浏览器不认的值。
    toArg: (arg) => String(arg).trim().split(/\s+/)[0],
  },
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

/**
 * 值型命令"能不能执行"的判据：方法在不在。
 *
 * 不用 `editor.can().setFontFamily()`：缺参调用时 Tiptap 返回 false，
 * 于是"装了字体扩展但当前选区分不出值"会被读成"这个宿主没有这条命令"。
 */
function hasCommand(editor: TiptapLikeEditor, name: string): boolean {
  return typeof editor.commands[name] === 'function'
}

export function tiptapEditorHost(editor: TiptapLikeEditor): OjEditorHost {
  return {
    can(id) {
      const entry = BRIDGE[id]
      if (!entry) return false
      if (entry.value === true) return hasCommand(editor, entry.can)
      return call(editor.can(), entry.can, entry.arg)
    },
    state(id): OjEditorState {
      const entry = BRIDGE[id]
      if (!entry) return { enabled: false }
      const enabled = entry.value === true ? hasCommand(editor, entry.can) : call(editor.can(), entry.can, entry.arg)
      if (!entry.active) return { enabled }
      return { enabled, active: editor.isActive(entry.active) }
    },
    exec(id, arg) {
      const entry = BRIDGE[id]
      if (!entry) return false
      const actual = arg === undefined ? entry.arg : entry.toArg === undefined ? arg : entry.toArg(arg)
      return call(editor.commands, entry.run, actual)
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
