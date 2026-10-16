/**
 * E1 的三条命令。UI 不实现加粗、分隔线、插表，只把它们登记进命令表。
 *
 * 注册表本身来自 `@jitoffice/shared`。这里用结构类型接收，是为了行为层不出现包名导入：
 * `pnpm verify` 在没有 node_modules 时仍要能跑到这些文件。
 */

import type { OjEditorHost, OjEditorState } from './editor-host.ts'

export const COMMAND_BOLD = 'format.bold'
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

export function isTableSize(arg: unknown): arg is TableSize {
  if (arg === null || typeof arg !== 'object') return false
  const row = (arg as { rows?: unknown }).rows
  const col = (arg as { cols?: unknown }).cols
  return typeof row === 'number' && typeof col === 'number' && Number.isInteger(row) && Number.isInteger(col) && row > 0 && col > 0
}

export function editorCommands(): readonly OjCommandLike[] {
  return [
    {
      id: COMMAND_BOLD,
      label: { key: 'oj.command.bold' },
      icon: 'oj-format-bold',
      keys: 'mod+b',
      group: '开始',
      history: 'undoable',
      state: (host) => host.state(COMMAND_BOLD),
      run: (host) => {
        host.exec(COMMAND_BOLD)
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

/** 登记三条命令，返回一次性注销。 */
export function registerEditorCommands(sink: OjCommandSink): () => void {
  const offs = editorCommands().map((command) => sink.register(command))
  return () => {
    for (const off of offs) off()
  }
}
