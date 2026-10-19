/**
 * 编辑命令。UI 不实现加粗、分隔线、插表，只把它们登记进命令表。
 *
 * 注册表本身来自 `@jitoffice/shared`。这里用结构类型接收，是为了行为层不出现包名导入：
 * `pnpm verify` 在没有 node_modules 时仍要能跑到这些文件。
 */

import type { OjEditorHost, OjEditorState } from './editor-host.ts'

export const COMMAND_BOLD = 'format.bold'
export const COMMAND_ITALIC = 'format.italic'
export const COMMAND_UNDERLINE = 'format.underline'
export const COMMAND_ALIGN_LEFT = 'format.alignLeft'
export const COMMAND_HEADING = 'format.heading'
export const COMMAND_BLOCKQUOTE = 'format.blockquote'
export const COMMAND_BULLET_LIST = 'format.bulletList'
export const COMMAND_ORDERED_LIST = 'format.orderedList'
export const COMMAND_CODE_BLOCK = 'format.codeBlock'
export const COMMAND_HARD_BREAK = 'insert.hardBreak'
export const COMMAND_HORIZONTAL_RULE = 'insert.horizontalRule'
export const COMMAND_TABLE = 'insert.table'

export interface TableSize {
  rows: number
  cols: number
}

export interface OjCommandLike {
  id: string
  label: string | { key: string }
  icon?: string
  keys?: string
  group?: string
  history?: 'undoable' | 'transient' | 'none'
  state?: (host: OjEditorHost) => OjEditorState
  run: (host: OjEditorHost, arg?: unknown) => void
}

export interface OjCommandSink {
  register(command: OjCommandLike): () => void
}

export function isHeadingLevel(arg: unknown): arg is { level: number } {
  if (arg === null || typeof arg !== 'object') return false
  const level = (arg as { level?: unknown }).level
  return typeof level === 'number' && Number.isInteger(level) && level >= 1 && level <= 6
}

export function isTableSize(arg: unknown): arg is TableSize {
  if (arg === null || typeof arg !== 'object') return false
  const row = (arg as { rows?: unknown }).rows
  const col = (arg as { cols?: unknown }).cols
  return typeof row === 'number' && typeof col === 'number' && Number.isInteger(row) && Number.isInteger(col) && row > 0 && col > 0
}

function toggleCommand(id: string, labelKey: string, icon: string, keys?: string): OjCommandLike {
  const command: OjCommandLike = {
    id,
    label: { key: labelKey },
    icon,
    group: '开始',
    history: 'undoable',
    state: (host) => host.state(id),
    run: (host) => {
      host.exec(id)
    },
  }
  if (keys) command.keys = keys
  return command
}

export function editorCommands(): readonly OjCommandLike[] {
  return [
    toggleCommand(COMMAND_BOLD, 'oj.command.bold', 'oj-format-bold', 'mod+b'),
    toggleCommand(COMMAND_ITALIC, 'oj.command.italic', 'oj-format-italic', 'mod+i'),
    toggleCommand(COMMAND_UNDERLINE, 'oj.command.underline', 'oj-format-underline', 'mod+u'),
    toggleCommand(COMMAND_ALIGN_LEFT, 'oj.command.alignLeft', 'oj-align-left'),
    {
      id: COMMAND_HEADING,
      label: { key: 'oj.command.heading' },
      group: '开始',
      history: 'undoable',
      state: (host) => host.state(COMMAND_HEADING),
      run: (host, arg) => {
        host.exec(COMMAND_HEADING, { level: isHeadingLevel(arg) ? arg.level : 1 })
      },
    },
    toggleCommand(COMMAND_BLOCKQUOTE, 'oj.command.blockquote', 'oj-comment'),
    toggleCommand(COMMAND_BULLET_LIST, 'oj.command.bulletList', 'oj-list-bullet'),
    toggleCommand(COMMAND_ORDERED_LIST, 'oj.command.orderedList', 'oj-list-number'),
    toggleCommand(COMMAND_CODE_BLOCK, 'oj.command.codeBlock', 'oj-code'),
    {
      id: COMMAND_HARD_BREAK,
      label: { key: 'oj.command.hardBreak' },
      group: '插入',
      history: 'undoable',
      state: (host) => host.state(COMMAND_HARD_BREAK),
      run: (host) => {
        host.exec(COMMAND_HARD_BREAK)
      },
    },
    {
      id: COMMAND_HORIZONTAL_RULE,
      label: { key: 'oj.command.horizontalRule' },
      icon: 'oj-horizontal-rule',
      group: '插入',
      history: 'undoable',
      state: (host) => host.state(COMMAND_HORIZONTAL_RULE),
      run: (host) => {
        host.exec(COMMAND_HORIZONTAL_RULE)
      },
    },
    {
      id: COMMAND_TABLE,
      label: { key: 'oj.command.insertTable' },
      icon: 'oj-insert-table',
      group: '插入',
      history: 'undoable',
      state: (host) => host.state(COMMAND_TABLE),
      run: (host, arg) => {
        if (!isTableSize(arg)) throw new Error('insert.table 需要正整数 { rows, cols }')
        host.exec(COMMAND_TABLE, { rows: arg.rows, cols: arg.cols })
      },
    },
  ]
}

/** 登记编辑命令，返回一次性注销。 */
export function registerEditorCommands(sink: OjCommandSink): () => void {
  const offs = editorCommands().map((command) => sink.register(command))
  return () => {
    for (const off of offs) off()
  }
}
