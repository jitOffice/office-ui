/**
 * 表格框选的交互模型（prd/03 §4）。
 *
 * 高亮范围由 `vars()` 交给一层 CSS overlay（`--oj-gp-row` / `--oj-gp-col`），
 * 模型本身不给每个格子记 class。指针离开网格时保留当前格：用户会移向「插入表格…」。
 */
export interface GridLimits {
    rows: number;
    cols: number;
}
export interface GridCell {
    row: number;
    col: number;
}
export type GridKeyResult = 'move' | 'commit' | 'cancel' | 'ignore';
export interface GridPicker {
    readonly limits: GridLimits;
    readonly hover: GridCell | null;
    /** 指针或方向键越出上限。当前悬停格保持不变。 */
    readonly exceeded: boolean;
    move(cell: GridCell): void;
    /** 指针离开网格。不清空悬停。 */
    leave(): void;
    key(key: string): GridKeyResult;
    commit(): GridCell | null;
    vars(): {
        '--oj-gp-row': string;
        '--oj-gp-col': string;
    };
}
/** prd/03 §4：可见网格到 10 行 × 20 列，再大走插入对话框。 */
export declare const DEFAULT_GRID_LIMITS: GridLimits;
export declare function createGridPicker(limits?: GridLimits): GridPicker;
