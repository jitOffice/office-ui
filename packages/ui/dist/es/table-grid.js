//#region src/table-grid.ts
/** prd/03 §4：可见网格到 10 行 × 20 列，再大走插入对话框。 */
var DEFAULT_GRID_LIMITS = {
	rows: 10,
	cols: 20
};
function assertLimits(limits) {
	if (!Number.isInteger(limits.rows) || !Number.isInteger(limits.cols) || limits.rows < 1 || limits.cols < 1) throw new Error("表格框选上限必须是正整数");
}
function createGridPicker(limits = DEFAULT_GRID_LIMITS) {
	assertLimits(limits);
	let hover = null;
	let exceeded = false;
	function place(cell) {
		if (!Number.isInteger(cell.row) || !Number.isInteger(cell.col)) return;
		if (cell.row < 1 || cell.col < 1) return;
		if (cell.row > limits.rows || cell.col > limits.cols) {
			exceeded = true;
			return;
		}
		exceeded = false;
		hover = {
			row: cell.row,
			col: cell.col
		};
	}
	return {
		limits,
		get hover() {
			return hover;
		},
		get exceeded() {
			return exceeded;
		},
		move: place,
		leave() {},
		key(key) {
			const current = hover ?? {
				row: 1,
				col: 1
			};
			if (key === "Escape") return "cancel";
			if (key === "Enter") return hover ? "commit" : "ignore";
			if (key === "Home") {
				place({
					row: current.row,
					col: 1
				});
				return "move";
			}
			if (key === "End") {
				place({
					row: current.row,
					col: limits.cols
				});
				return "move";
			}
			const next = {
				ArrowUp: {
					row: current.row - 1,
					col: current.col
				},
				ArrowDown: {
					row: current.row + 1,
					col: current.col
				},
				ArrowLeft: {
					row: current.row,
					col: current.col - 1
				},
				ArrowRight: {
					row: current.row,
					col: current.col + 1
				}
			}[key];
			if (!next) return "ignore";
			place(hover ? next : {
				row: 1,
				col: 1
			});
			return "move";
		},
		commit: () => hover,
		vars: () => ({
			"--oj-gp-row": String(hover?.row ?? 0),
			"--oj-gp-col": String(hover?.col ?? 0)
		})
	};
}
//#endregion
export { DEFAULT_GRID_LIMITS, createGridPicker };
