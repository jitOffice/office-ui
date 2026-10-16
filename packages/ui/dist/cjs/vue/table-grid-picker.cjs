const require_table_grid = require("../table-grid.cjs");
let vue = require("vue");
//#region src/vue/table-grid-picker.ts
var OjTableGridPicker = (0, vue.defineComponent)({
	name: "OjTableGridPicker",
	props: {
		rows: {
			type: Number,
			default: 10
		},
		cols: {
			type: Number,
			default: 20
		},
		format: {
			type: Function,
			default: void 0
		},
		detailLabel: {
			type: String,
			default: ""
		},
		exceedLabel: {
			type: String,
			default: ""
		}
	},
	emits: ["select", "detail"],
	setup(props, { emit }) {
		const picker = require_table_grid.createGridPicker({
			rows: props.rows,
			cols: props.cols
		});
		const tick = (0, vue.ref)(0);
		function touch() {
			tick.value += 1;
		}
		return () => {
			tick.value;
			const hover = picker.hover;
			const vars = picker.vars();
			const cells = [];
			for (let row = 1; row <= picker.limits.rows; row += 1) {
				const rowCells = [];
				for (let col = 1; col <= picker.limits.cols; col += 1) {
					const cell = {
						row,
						col
					};
					rowCells.push((0, vue.h)("button", {
						type: "button",
						class: "oj-grid-picker__cell",
						role: "gridcell",
						"aria-selected": hover?.row === row && hover?.col === col ? "true" : "false",
						tabindex: -1,
						onMouseenter: () => {
							picker.move(cell);
							touch();
						},
						onClick: () => {
							picker.move(cell);
							const chosen = picker.commit();
							if (chosen) emit("select", chosen);
						}
					}));
				}
				cells.push((0, vue.h)("div", { role: "row" }, rowCells));
			}
			const size = hover ? props.format?.(hover) ?? `${hover.row} × ${hover.col}` : "";
			return (0, vue.h)("div", {
				class: "oj-grid-picker",
				onMouseleave: () => {
					picker.leave();
					touch();
				}
			}, [
				(0, vue.h)("div", {
					class: "oj-grid-picker__cells",
					role: "grid",
					tabindex: 0,
					"aria-rowcount": picker.limits.rows,
					"aria-colcount": picker.limits.cols,
					style: {
						...vars,
						"--oj-gp-cols": String(picker.limits.cols)
					},
					onKeydown: (event) => {
						const result = picker.key(event.key);
						if (result === "ignore" || result === "cancel") return;
						event.preventDefault();
						touch();
						if (result === "commit") {
							const chosen = picker.commit();
							if (chosen) emit("select", chosen);
						}
					}
				}, [(0, vue.h)("div", {
					class: "oj-grid-picker__overlay",
					"aria-hidden": "true",
					"data-empty": hover ? void 0 : ""
				}), ...cells]),
				size ? (0, vue.h)("p", { class: "oj-grid-picker__size" }, size) : null,
				picker.exceeded && props.exceedLabel ? (0, vue.h)("p", { class: "oj-grid-picker__exceed" }, props.exceedLabel) : null,
				props.detailLabel ? (0, vue.h)("button", {
					type: "button",
					class: "oj-grid-picker__detail",
					onClick: () => emit("detail")
				}, props.detailLabel) : null
			]);
		};
	}
});
//#endregion
exports.OjTableGridPicker = OjTableGridPicker;
