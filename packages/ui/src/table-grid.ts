/**
 * 表格框选的交互模型（prd/03 §4）。
 *
 * 高亮范围由 `vars()` 交给一层 CSS overlay（`--oj-gp-row` / `--oj-gp-col`），
 * 模型本身不给每个格子记 class。指针离开网格时保留当前格：用户会移向「插入表格…」。
 */

export interface GridLimits {
  rows: number
  cols: number
}

export interface GridCell {
  row: number
  col: number
}

export type GridKeyResult = 'move' | 'commit' | 'cancel' | 'ignore'

export interface GridPicker {
  readonly limits: GridLimits
  readonly hover: GridCell | null
  /** 指针或方向键越出上限。当前悬停格保持不变。 */
  readonly exceeded: boolean
  move(cell: GridCell): void
  /** 指针离开网格。不清空悬停。 */
  leave(): void
  key(key: string): GridKeyResult
  commit(): GridCell | null
  vars(): { '--oj-gp-row': string; '--oj-gp-col': string }
}

/** prd/03 §4：可见网格到 10 行 × 20 列，再大走插入对话框。 */
export const DEFAULT_GRID_LIMITS: GridLimits = { rows: 10, cols: 20 }

function assertLimits(limits: GridLimits): void {
  if (!Number.isInteger(limits.rows) || !Number.isInteger(limits.cols) || limits.rows < 1 || limits.cols < 1) {
    throw new Error('表格框选上限必须是正整数')
  }
}

export function createGridPicker(limits: GridLimits = DEFAULT_GRID_LIMITS): GridPicker {
  assertLimits(limits)
  let hover: GridCell | null = null
  let exceeded = false

  function place(cell: GridCell): void {
    if (!Number.isInteger(cell.row) || !Number.isInteger(cell.col)) return
    // 撞到 1 的内侧：停在当前格，不算「超出上限」。超出只留给越过 max 的那一侧。
    if (cell.row < 1 || cell.col < 1) return
    if (cell.row > limits.rows || cell.col > limits.cols) {
      exceeded = true
      return
    }
    exceeded = false
    hover = { row: cell.row, col: cell.col }
  }

  return {
    limits,
    get hover() {
      return hover
    },
    get exceeded() {
      return exceeded
    },
    move: place,
    leave() {
      // 移向面板底部的「插入表格…」时，高亮必须留在原格。
    },
    key(key) {
      const current = hover ?? { row: 1, col: 1 }
      if (key === 'Escape') return 'cancel'
      if (key === 'Enter') return hover ? 'commit' : 'ignore'
      if (key === 'Home') {
        place({ row: current.row, col: 1 })
        return 'move'
      }
      if (key === 'End') {
        place({ row: current.row, col: limits.cols })
        return 'move'
      }
      const delta: Record<string, GridCell> = {
        ArrowUp: { row: current.row - 1, col: current.col },
        ArrowDown: { row: current.row + 1, col: current.col },
        ArrowLeft: { row: current.row, col: current.col - 1 },
        ArrowRight: { row: current.row, col: current.col + 1 },
      }
      const next = delta[key]
      if (!next) return 'ignore'
      // 没有悬停时，第一次方向键落到 (1,1)，而不是从 (1,1) 再走一步。
      place(hover ? next : { row: 1, col: 1 })
      return 'move'
    },
    commit: () => hover,
    vars: () => ({
      '--oj-gp-row': String(hover?.row ?? 0),
      '--oj-gp-col': String(hover?.col ?? 0),
    }),
  }
}
