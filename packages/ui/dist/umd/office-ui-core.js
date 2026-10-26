(function(global, factory) {
	typeof exports === "object" && typeof module !== "undefined" ? factory(exports) : typeof define === "function" && define.amd ? define(["exports"], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, factory(global.OfficeUICore = {}));
})(this, function(exports) {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	//#region src/editor-host.ts
	var ENABLED = Object.freeze({ enabled: true });
	/**
	* 测试与 demo 用的内存宿主。`format.*` 被执行时翻转 `active`，用来证明按钮能跟上选区。
	*/
	function createMemoryEditor(initial = {}) {
		const states = new Map(Object.entries(initial));
		const calls = [];
		const listeners = /* @__PURE__ */ new Set();
		function read(id) {
			var _states$get;
			return (_states$get = states.get(id)) !== null && _states$get !== void 0 ? _states$get : ENABLED;
		}
		function notify() {
			for (const listener of [...listeners]) listener();
		}
		const host = {
			can: (id) => read(id).enabled !== false,
			state: (id) => read(id),
			exec: (id, arg) => {
				calls.push({
					id,
					arg
				});
				if (!host.can(id)) return false;
				if (id.startsWith("format.")) {
					const current = read(id);
					states.set(id, {
						...current,
						active: current.active !== true
					});
					notify();
				}
				return true;
			},
			subscribe: (listener) => {
				listeners.add(listener);
				return () => listeners.delete(listener);
			}
		};
		return {
			host,
			calls,
			set(id, patch) {
				states.set(id, {
					...read(id),
					...patch
				});
				notify();
			}
		};
	}
	//#endregion
	//#region src/tiptap-host.ts
	var BRIDGE = {
		"format.bold": {
			can: "toggleBold",
			run: "toggleBold",
			active: "bold"
		},
		"format.italic": {
			can: "toggleItalic",
			run: "toggleItalic",
			active: "italic"
		},
		"format.underline": {
			can: "toggleUnderline",
			run: "toggleUnderline",
			active: "underline"
		},
		"format.alignLeft": {
			can: "setTextAlign",
			run: "setTextAlign",
			active: { textAlign: "left" },
			arg: "left"
		},
		"format.heading": {
			can: "toggleHeading",
			run: "toggleHeading",
			active: "heading"
		},
		"format.blockquote": {
			can: "toggleBlockquote",
			run: "toggleBlockquote",
			active: "blockquote"
		},
		"format.bulletList": {
			can: "toggleBulletList",
			run: "toggleBulletList",
			active: "bulletList"
		},
		"format.orderedList": {
			can: "toggleOrderedList",
			run: "toggleOrderedList",
			active: "orderedList"
		},
		"format.codeBlock": {
			can: "toggleCodeBlock",
			run: "toggleCodeBlock",
			active: "codeBlock"
		},
		"insert.hardBreak": {
			can: "setHardBreak",
			run: "setHardBreak"
		},
		"insert.horizontalRule": {
			can: "setHorizontalRule",
			run: "setHorizontalRule"
		},
		"insert.table": {
			can: "insertTable",
			run: "insertTable"
		}
	};
	function call(table, name, arg) {
		const fn = table[name];
		if (typeof fn !== "function") return false;
		return fn(arg) !== false;
	}
	/** 桥里登记过的命令 id。用来证明它和 `editorCommands()` 没有漂移。 */
	function bridgedCommandIds() {
		return Object.keys(BRIDGE);
	}
	function tiptapEditorHost(editor) {
		return {
			can(id) {
				const entry = BRIDGE[id];
				if (!entry) return false;
				return call(editor.can(), entry.can, entry.arg);
			},
			state(id) {
				const entry = BRIDGE[id];
				if (!entry) return { enabled: false };
				const enabled = call(editor.can(), entry.can, entry.arg);
				if (!entry.active) return { enabled };
				return {
					enabled,
					active: editor.isActive(entry.active)
				};
			},
			exec(id, arg) {
				const entry = BRIDGE[id];
				if (!entry) return false;
				return call(editor.commands, entry.run, arg === void 0 ? entry.arg : arg);
			},
			subscribe(listener) {
				editor.on("transaction", listener);
				editor.on("selectionUpdate", listener);
				return () => {
					editor.off("transaction", listener);
					editor.off("selectionUpdate", listener);
				};
			}
		};
	}
	//#endregion
	//#region src/commands.ts
	var COMMAND_BOLD = "format.bold";
	var COMMAND_ITALIC = "format.italic";
	var COMMAND_UNDERLINE = "format.underline";
	var COMMAND_ALIGN_LEFT = "format.alignLeft";
	var COMMAND_HEADING = "format.heading";
	var COMMAND_BLOCKQUOTE = "format.blockquote";
	var COMMAND_BULLET_LIST = "format.bulletList";
	var COMMAND_ORDERED_LIST = "format.orderedList";
	var COMMAND_CODE_BLOCK = "format.codeBlock";
	var COMMAND_HARD_BREAK = "insert.hardBreak";
	var COMMAND_HORIZONTAL_RULE = "insert.horizontalRule";
	var COMMAND_TABLE = "insert.table";
	function isHeadingLevel(arg) {
		if (arg === null || typeof arg !== "object") return false;
		const level = arg.level;
		return typeof level === "number" && Number.isInteger(level) && level >= 1 && level <= 6;
	}
	function isTableSize(arg) {
		if (arg === null || typeof arg !== "object") return false;
		const row = arg.rows;
		const col = arg.cols;
		return typeof row === "number" && typeof col === "number" && Number.isInteger(row) && Number.isInteger(col) && row > 0 && col > 0;
	}
	function toggleCommand(id, labelKey, icon, keys) {
		const command = {
			id,
			label: { key: labelKey },
			icon,
			group: "开始",
			history: "undoable",
			state: (host) => host.state(id),
			run: (host) => {
				host.exec(id);
			}
		};
		if (keys) command.keys = keys;
		return command;
	}
	function editorCommands() {
		return [
			toggleCommand(COMMAND_BOLD, "oj.command.bold", "oj-format-bold", "mod+b"),
			toggleCommand(COMMAND_ITALIC, "oj.command.italic", "oj-format-italic", "mod+i"),
			toggleCommand(COMMAND_UNDERLINE, "oj.command.underline", "oj-format-underline", "mod+u"),
			toggleCommand(COMMAND_ALIGN_LEFT, "oj.command.alignLeft", "oj-align-left"),
			{
				id: COMMAND_HEADING,
				label: { key: "oj.command.heading" },
				group: "开始",
				history: "undoable",
				state: (host) => host.state(COMMAND_HEADING),
				run: (host, arg) => {
					host.exec(COMMAND_HEADING, { level: isHeadingLevel(arg) ? arg.level : 1 });
				}
			},
			toggleCommand(COMMAND_BLOCKQUOTE, "oj.command.blockquote", "oj-comment"),
			toggleCommand(COMMAND_BULLET_LIST, "oj.command.bulletList", "oj-list-bullet"),
			toggleCommand(COMMAND_ORDERED_LIST, "oj.command.orderedList", "oj-list-number"),
			toggleCommand(COMMAND_CODE_BLOCK, "oj.command.codeBlock", "oj-code"),
			{
				id: COMMAND_HARD_BREAK,
				label: { key: "oj.command.hardBreak" },
				group: "插入",
				history: "undoable",
				state: (host) => host.state(COMMAND_HARD_BREAK),
				run: (host) => {
					host.exec(COMMAND_HARD_BREAK);
				}
			},
			{
				id: COMMAND_HORIZONTAL_RULE,
				label: { key: "oj.command.horizontalRule" },
				icon: "oj-horizontal-rule",
				group: "插入",
				history: "undoable",
				state: (host) => host.state(COMMAND_HORIZONTAL_RULE),
				run: (host) => {
					host.exec(COMMAND_HORIZONTAL_RULE);
				}
			},
			{
				id: COMMAND_TABLE,
				label: { key: "oj.command.insertTable" },
				icon: "oj-insert-table",
				group: "插入",
				history: "undoable",
				state: (host) => host.state(COMMAND_TABLE),
				run: (host, arg) => {
					if (!isTableSize(arg)) throw new Error("insert.table 需要正整数 { rows, cols }");
					host.exec(COMMAND_TABLE, {
						rows: arg.rows,
						cols: arg.cols
					});
				}
			}
		];
	}
	/** 登记编辑命令，返回一次性注销。 */
	function registerEditorCommands(sink) {
		const offs = editorCommands().map((command) => sink.register(command));
		return () => {
			for (const off of offs) off();
		};
	}
	//#endregion
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
				var _hover;
				const current = (_hover = hover) !== null && _hover !== void 0 ? _hover : {
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
			vars: () => {
				var _hover$row, _hover$col;
				return {
					"--oj-gp-row": String((_hover$row = hover === null || hover === void 0 ? void 0 : hover.row) !== null && _hover$row !== void 0 ? _hover$row : 0),
					"--oj-gp-col": String((_hover$col = hover === null || hover === void 0 ? void 0 : hover.col) !== null && _hover$col !== void 0 ? _hover$col : 0)
				};
			}
		};
	}
	//#endregion
	//#region src/popper.ts
	function placePopper(options) {
		var _options$gap, _options$padding, _options$placement;
		const gap = (_options$gap = options.gap) !== null && _options$gap !== void 0 ? _options$gap : 4;
		const padding = (_options$padding = options.padding) !== null && _options$padding !== void 0 ? _options$padding : 8;
		const { anchor, popup, viewport } = options;
		const preferred = (_options$placement = options.placement) !== null && _options$placement !== void 0 ? _options$placement : "bottom-start";
		let placement = preferred;
		let y = preferred === "bottom-start" ? anchor.y + anchor.height + gap : anchor.y - gap - popup.height;
		const bottom = anchor.y + anchor.height + gap;
		const top = anchor.y - gap - popup.height;
		const bottomOverflows = bottom + popup.height > viewport.height - padding;
		const topOverflows = top < padding;
		if (preferred === "bottom-start" && bottomOverflows && !topOverflows) {
			placement = "top-start";
			y = top;
		} else if (preferred === "top-start" && topOverflows && !bottomOverflows) {
			placement = "bottom-start";
			y = bottom;
		}
		const maxX = Math.max(padding, viewport.width - padding - popup.width);
		const maxY = Math.max(padding, viewport.height - padding - popup.height);
		const x = Math.min(Math.max(anchor.x, padding), maxX);
		y = Math.min(Math.max(y, padding), maxY);
		return {
			x,
			y,
			placement
		};
	}
	//#endregion
	//#region src/tooltip.ts
	function defaultSchedule(fn, ms) {
		const id = setTimeout(fn, ms);
		return () => clearTimeout(id);
	}
	function createTooltipMachine(options = {}) {
		var _options$delay, _options$schedule;
		const delay = (_options$delay = options.delay) !== null && _options$delay !== void 0 ? _options$delay : 400;
		const schedule = (_options$schedule = options.schedule) !== null && _options$schedule !== void 0 ? _options$schedule : defaultSchedule;
		let open = false;
		let pending = null;
		function setOpen(next) {
			var _options$onChange;
			if (open === next) return;
			open = next;
			(_options$onChange = options.onChange) === null || _options$onChange === void 0 || _options$onChange.call(options, open);
		}
		function cancel() {
			pending === null || pending === void 0 || pending();
			pending = null;
		}
		return {
			get open() {
				return open;
			},
			enter() {
				if (open || pending) return;
				pending = schedule(() => {
					pending = null;
					setOpen(true);
				}, delay);
			},
			leave() {
				cancel();
				setOpen(false);
			},
			show() {
				cancel();
				setOpen(true);
			},
			hide() {
				cancel();
				setOpen(false);
			},
			dispose() {
				cancel();
			}
		};
	}
	//#endregion
	//#region src/icons.ts
	/**
	* 自绘图标。只发 SVG 字符串，不发图标字体（prd/00 许可红线）。
	* 完整图标管线仍是后续的 `@jitoffice/icons`，这里先覆盖外壳会用到的三十枚。
	*/
	var SVG_OPEN = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\" fill=\"currentColor\">";
	var icons = {
		"oj-format-bold": SVG_OPEN + "<path d=\"M4 2h4.1A2.55 2.55 0 0 1 8.1 7.1H4V2zm0 5.1h4.7A2.65 2.65 0 0 1 8.7 14H4V7.1z\"/></svg>",
		"oj-insert-table": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.2\"><rect x=\"2.2\" y=\"2.2\" width=\"11.6\" height=\"11.6\" rx=\"1\"/><path d=\"M2.2 6.4h11.6M2.2 10.2h11.6M6.4 2.2v11.6M10.2 2.2v11.6\"/></svg>",
		"oj-horizontal-rule": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.4\"><path d=\"M2 8h12\"/></svg>",
		"oj-format-italic": SVG_OPEN + "<path d=\"M6.2 2h6l-.4 1.6H9.7L7.4 12.4h2.1L9.1 14H3.2l.4-1.6h2.1L8 3.6H5.8L6.2 2z\"/></svg>",
		"oj-format-underline": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.3\"><path d=\"M4 2.5v5.2a4 4 0 0 0 8 0V2.5M3 13.5h10\"/></svg>",
		"oj-align-left": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\" fill=\"currentColor\"><path d=\"M2 3h12v1.4H2zm0 3.2h8v1.4H2zm0 3.2h12v1.4H2zm0 3.2h8v1.4H2z\"/></svg>",
		"oj-align-center": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\" fill=\"currentColor\"><path d=\"M2 3h12v1.4H2zm2 3.2h8v1.4H4zm-2 3.2h12v1.4H2zm2 3.2h8v1.4H4z\"/></svg>",
		"oj-align-right": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\" fill=\"currentColor\"><path d=\"M2 3h12v1.4H2zm4 3.2h8v1.4H6zm-4 3.2h12v1.4H2zm4 3.2h8v1.4H6z\"/></svg>",
		"oj-list-bullet": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\" fill=\"currentColor\"><circle cx=\"3\" cy=\"4\" r=\"1.1\"/><circle cx=\"3\" cy=\"8\" r=\"1.1\"/><circle cx=\"3\" cy=\"12\" r=\"1.1\"/><path d=\"M6 3.3h8v1.4H6zm0 4h8v1.4H6zm0 4h8v1.4H6z\"/></svg>",
		"oj-list-number": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\" fill=\"currentColor\"><path d=\"M2.2 3.2h1.2V6H2.2zm0 3.6h2.2v.9H3.2v.5h1.2V9.6H2.2v-.9h1.2v-.4H2.2zm.2 3.2h1.6c.4 0 .7.2.7.6s-.3.6-.7.6H2.4v.9h2.2v.9H2.2v-2.1h.2zM6 3.3h8v1.4H6zm0 4h8v1.4H6zm0 4h8v1.4H6z\"/></svg>",
		"oj-search": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.4\"><circle cx=\"7\" cy=\"7\" r=\"4.2\"/><path d=\"M10.2 10.2 13.5 13.5\"/></svg>",
		"oj-zoom-in": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.4\"><circle cx=\"7\" cy=\"7\" r=\"4.2\"/><path d=\"M10.2 10.2 13.5 13.5M7 5v4M5 7h4\"/></svg>",
		"oj-zoom-out": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.4\"><circle cx=\"7\" cy=\"7\" r=\"4.2\"/><path d=\"M10.2 10.2 13.5 13.5M5 7h4\"/></svg>",
		"oj-folder": SVG_OPEN + "<path d=\"M2 4.2A1.2 1.2 0 0 1 3.2 3h3l1.2 1.4H13a1 1 0 0 1 1 1V12a1 1 0 0 1-1 1H3.2A1.2 1.2 0 0 1 2 11.8z\"/></svg>",
		"oj-file": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.2\"><path d=\"M4 2.2h5.2L12.5 5.5V13.8H4z\"/><path d=\"M9.2 2.2V5.5H12.5\"/></svg>",
		"oj-chevron-right": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.4\"><path d=\"M6 3.5 10.5 8 6 12.5\"/></svg>",
		"oj-chevron-down": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.4\"><path d=\"M3.5 6 8 10.5 12.5 6\"/></svg>",
		"oj-close": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.4\"><path d=\"M4 4l8 8M12 4l-8 8\"/></svg>",
		"oj-undo": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.3\"><path d=\"M4 7.5 1.8 5.2 4 3\"/><path d=\"M2.2 5.2h6.2a4.2 4.2 0 1 1 0 8.4H6\"/></svg>",
		"oj-image": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.2\"><rect x=\"2.2\" y=\"3\" width=\"11.6\" height=\"10\" rx=\"1\"/><circle cx=\"5.5\" cy=\"6.2\" r=\"1\"/><path d=\"M3 11.5 6.2 8.2l2 2 1.6-1.4L13 11.5\"/></svg>",
		"oj-link": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.3\"><path d=\"M6.8 9.2a2.6 2.6 0 0 0 3.7 0l1.8-1.8a2.6 2.6 0 0 0-3.7-3.7L7.6 4.7\"/><path d=\"M9.2 6.8a2.6 2.6 0 0 0-3.7 0L3.7 8.6a2.6 2.6 0 0 0 3.7 3.7l1-1\"/></svg>",
		"oj-comment": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.2\"><path d=\"M3 3.2h10v7.2H6.2L3 12.8z\"/></svg>",
		"oj-print": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.2\"><path d=\"M4.5 6V2.8h7V6\"/><path d=\"M4 11.2H2.8V6.5h10.4v4.7H12\"/><rect x=\"4.5\" y=\"9\" width=\"7\" height=\"4.2\"/></svg>",
		"oj-page": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.2\"><rect x=\"3.5\" y=\"2\" width=\"9\" height=\"12\" rx=\"0.6\"/></svg>",
		"oj-signature": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.3\"><path d=\"M2 11.5c1.6-2.4 2.4-2.2 3.2-.4.6 1.4 1.2 1.6 2-.2 1-2.2 1.6-2 2.6.2.6 1.4 1.4 1.6 2.4-.2\"/><path d=\"M2 13.6h12\"/></svg>",
		"oj-stamp": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.2\"><circle cx=\"8\" cy=\"7\" r=\"4.2\"/><path d=\"M5.2 13.2h5.6M6.4 11.2h3.2\"/></svg>",
		"oj-watermark": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.2\"><rect x=\"2.2\" y=\"2.2\" width=\"11.6\" height=\"11.6\" rx=\"1\"/><path d=\"M4 11.2 12 4.8\"/></svg>",
		"oj-ai": SVG_OPEN + "<path d=\"M8 1.8 9.2 6h4.3L10.3 8.6l1.1 4.2L8 10.4 4.6 12.8 5.7 8.6 2.5 6h4.3z\"/></svg>",
		"oj-indent": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\" fill=\"currentColor\"><path d=\"M2 3h12v1.4H2zm4 3.2h8v1.4H6zm-4 3.2h12v1.4H2zm4 3.2h8v1.4H6z\"/></svg>",
		"oj-outdent": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\" fill=\"currentColor\"><path d=\"M2 3h12v1.4H2zm0 3.2h8v1.4H2zm0 3.2h12v1.4H2zm0 3.2h8v1.4H2z\"/></svg>",
		"oj-code": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.4\"><path d=\"M6 4.5 3 8l3 3.5M10 4.5 13 8l-3 3.5\"/></svg>"
	};
	function iconMarkup(name) {
		if (Object.prototype.hasOwnProperty.call(icons, name)) return icons[name];
	}
	function iconLabelProblem(name, options = {}) {
		if (typeof options.label === "string" && options.label.length > 0 || options.decorative === true) return void 0;
		return `[OjIcon] "${name}" 既没有 label 也没有标 decorative：纯图标元素不进无障碍树，读屏用户读到的是一片空白（prd/03 §2）。给 label（有语义）或 decorative（装饰性，渲染 aria-hidden）二选一。`;
	}
	/**
	* 只有构建器**明确**说是 dev 才告警。宁可线上漏报，也不要在产物里刷控制台——
	* 这个判定读的是 `import.meta.env.DEV`，Vite 在 dev server 下注入 true，产物里没有它。
	*/
	function isDevEnv(env) {
		return (env === null || env === void 0 ? void 0 : env.DEV) === true;
	}
	//#endregion
	//#region src/shell/tabs.ts
	/** 选项卡键盘模型。方向键在一组 id 里循环，Home / End 跳到两端。 */
	function selectByKey(ids, current, key) {
		var _ids, _ids2, _ids$, _ids3;
		if (ids.length === 0) return current;
		const index = Math.max(0, ids.indexOf(current));
		if (key === "ArrowRight") return (_ids = ids[(index + 1) % ids.length]) !== null && _ids !== void 0 ? _ids : current;
		if (key === "ArrowLeft") return (_ids2 = ids[(index - 1 + ids.length) % ids.length]) !== null && _ids2 !== void 0 ? _ids2 : current;
		if (key === "Home") return (_ids$ = ids[0]) !== null && _ids$ !== void 0 ? _ids$ : current;
		if (key === "End") return (_ids3 = ids[ids.length - 1]) !== null && _ids3 !== void 0 ? _ids3 : current;
		return current;
	}
	//#endregion
	//#region src/shell/search.ts
	function searchHits(text, query) {
		if (query.find.length === 0) return [];
		const source = query.matchCase ? text : text.toLowerCase();
		const needle = query.matchCase ? query.find : query.find.toLowerCase();
		const hits = [];
		let from = 0;
		while (from <= source.length) {
			const at = source.indexOf(needle, from);
			if (at < 0) break;
			hits.push({
				start: at,
				end: at + needle.length
			});
			from = at + Math.max(needle.length, 1);
		}
		return hits;
	}
	function replaceOne(text, hit, replacement) {
		return text.slice(0, hit.start) + replacement + text.slice(hit.end);
	}
	function replaceAll(text, query) {
		const hits = searchHits(text, query);
		let out = "";
		let cursor = 0;
		for (const hit of hits) {
			out += text.slice(cursor, hit.start) + query.replace;
			cursor = hit.end;
		}
		return {
			text: out + text.slice(cursor),
			count: hits.length
		};
	}
	/** 没有命中时返回 -1。 */
	function neighbor(index, count, direction) {
		if (count <= 0) return -1;
		return ((index < 0 ? direction > 0 ? -1 : 0 : index) + direction + count) % count;
	}
	//#endregion
	//#region src/shell/zoom.ts
	/** 画布缩放。步进 10，夹在 50% 与 200% 之间。 */
	var ZOOM_MIN = 50;
	var ZOOM_MAX = 200;
	var ZOOM_STEP = 10;
	function clampZoom(value) {
		if (!Number.isFinite(value)) return 100;
		return Math.min(200, Math.max(50, Math.round(value)));
	}
	function stepZoom(value, direction) {
		return clampZoom(clampZoom(value) + direction * 10);
	}
	//#endregion
	//#region src/shell/files.ts
	function filterTree(nodes, query) {
		const needle = query.trim().toLowerCase();
		if (needle.length === 0) return nodes.map((node) => node);
		const walk = (node) => {
			var _node$children;
			if (node.name.toLowerCase().includes(needle)) return node;
			const children = (_node$children = node.children) === null || _node$children === void 0 ? void 0 : _node$children.map(walk).filter((item) => item !== null);
			if (children && children.length > 0) return {
				...node,
				children
			};
			return null;
		};
		return nodes.map(walk).filter((item) => item !== null);
	}
	function toggleId(open, id) {
		return open.includes(id) ? open.filter((item) => item !== id) : [...open, id];
	}
	//#endregion
	//#region src/shell/ruler.ts
	/** 标尺刻度。1cm 按 96dpi 换算，再乘当前缩放。 */
	var PX_PER_CM = 96 / 2.54;
	function rulerTicks(lengthPx, zoomPercent) {
		if (lengthPx <= 0 || zoomPercent <= 0) return [];
		const step = PX_PER_CM * (zoomPercent / 100);
		const ticks = [];
		const count = Math.floor(lengthPx / step);
		for (let index = 0; index <= count; index += 1) ticks.push({
			offset: Math.round(index * step),
			label: String(index)
		});
		return ticks;
	}
	/** A4 短边在 96dpi 下的像素宽度，供纸张容器使用。 */
	var A4_WIDTH_PX = 794;
	function pageWidth(zoomPercent) {
		return Math.round(794 * (zoomPercent / 100));
	}
	//#endregion
	//#region src/shell/signature.ts
	function startStroke(strokes, point) {
		return [...strokes, { points: [point] }];
	}
	function extendStroke(strokes, point) {
		const last = strokes[strokes.length - 1];
		if (!last) return startStroke(strokes, point);
		return [...strokes.slice(0, -1), { points: [...last.points, point] }];
	}
	function strokePath(stroke) {
		const first = stroke.points[0];
		if (!first) return "";
		const rest = stroke.points.slice(1).map((point) => `L ${point.x} ${point.y}`);
		return [`M ${first.x} ${first.y}`, ...rest].join(" ");
	}
	//#endregion
	//#region src/nodes/tree.ts
	var TEXTBLOCKS = /* @__PURE__ */ new Set([
		"paragraph",
		"heading",
		"codeBlock"
	]);
	function isTextblockType(type) {
		return TEXTBLOCKS.has(type);
	}
	function createDocument(text = "") {
		return {
			doc: {
				type: "doc",
				content: [textblock("paragraph", text)]
			},
			selection: {
				kind: "text",
				path: [0],
				offset: text.length
			}
		};
	}
	function textblock(type, text, attrs) {
		const content = text.length > 0 ? [{
			type: "text",
			text
		}] : [];
		return attrs ? {
			type,
			attrs,
			content
		} : {
			type,
			content
		};
	}
	/** 文本块的可见文字。硬换行算作一个换行符。 */
	function blockPlain(node) {
		var _node$text, _node$content;
		if (node.type === "text") return (_node$text = node.text) !== null && _node$text !== void 0 ? _node$text : "";
		if (node.type === "hardBreak") return "\n";
		if (!isTextblockType(node.type)) return "";
		return ((_node$content = node.content) !== null && _node$content !== void 0 ? _node$content : []).map((child) => blockPlain(child)).join("");
	}
	function nodeAt(root, path) {
		let current = root;
		for (const index of path) {
			var _current$content;
			const next = (_current$content = current.content) === null || _current$content === void 0 ? void 0 : _current$content[index];
			if (!next) return null;
			current = next;
		}
		return current;
	}
	function spliceChildren(root, parentPath, index, deleteCount, insert) {
		var _root$content2;
		if (parentPath.length === 0) {
			var _root$content;
			const content = [...(_root$content = root.content) !== null && _root$content !== void 0 ? _root$content : []];
			content.splice(index, deleteCount, ...insert);
			return {
				...root,
				content
			};
		}
		const [head, ...rest] = parentPath;
		if (head === void 0) return root;
		const content = [...(_root$content2 = root.content) !== null && _root$content2 !== void 0 ? _root$content2 : []];
		const child = content[head];
		if (!child) return root;
		content[head] = spliceChildren(child, rest, index, deleteCount, insert);
		return {
			...root,
			content
		};
	}
	/** 按阅读顺序收集文本块。块与块之间用换行符隔开，和 `plainText` 一致。 */
	function textblocks(root) {
		const hits = [];
		let cursor = 0;
		const walk = (node, path) => {
			var _node$content2;
			if (isTextblockType(node.type)) {
				const text = blockPlain(node);
				hits.push({
					path,
					node,
					start: cursor,
					end: cursor + text.length
				});
				cursor += text.length + 1;
				return;
			}
			(_node$content2 = node.content) === null || _node$content2 === void 0 || _node$content2.forEach((child, index) => walk(child, [...path, index]));
		};
		walk(root, []);
		return hits;
	}
	function plainText(doc) {
		return textblocks(doc.doc).map((hit) => blockPlain(hit.node)).join("\n");
	}
	function withPlain(doc, plain) {
		const hits = textblocks(doc.doc);
		const parts = plain.split("\n");
		if (parts.length !== hits.length) return doc;
		let root = doc.doc;
		hits.forEach((hit, index) => {
			var _parts$index;
			const text = (_parts$index = parts[index]) !== null && _parts$index !== void 0 ? _parts$index : "";
			const parentPath = hit.path.slice(0, -1);
			const at = hit.path[hit.path.length - 1];
			if (at === void 0) return;
			root = spliceChildren(root, parentPath, at, 1, [textblock(hit.node.type, text, hit.node.attrs)]);
		});
		return {
			...doc,
			doc: root
		};
	}
	//#endregion
	//#region src/nodes/horizontal-rule.ts
	/**
	* 分隔线节点，对齐 Tiptap `HorizontalRule`（`@tiptap/extension-horizontal-rule`）。
	*
	* 不 import `@tiptap/*`，也不操作 ProseMirror transaction。这里只保留那条节点对外可观察的约定：
	* 块级 `hr`、`setHorizontalRule` 之后光标落在规则后、文末没有节点时补 `nextNodeType`、
	* 行首 `---` / `—-` / `___ ` / `*** ` 变成节点。真正的编辑器仍由宿主执行
	* `commands.setHorizontalRule()`，见 `tiptapEditorHost`。
	*/
	var HORIZONTAL_RULE_NAME = "horizontalRule";
	var HORIZONTAL_RULE_GROUP = "block";
	/** Markdown 词法名。渲染结果是 `---`。 */
	var HORIZONTAL_RULE_MARKDOWN_TOKEN = "hr";
	var HORIZONTAL_RULE_MARKDOWN = "---";
	/**
	* 与 Tiptap `nodeInputRule` 的 `find` 相同。
	* 第二支是 U+2014 EM DASH 再加一个连字符。
	*/
	var HORIZONTAL_RULE_INPUT = /^(?:---|[\u2014]-|___\s|\*\*\*\s)$/;
	var DEFAULT_OPTIONS = {
		HTMLAttributes: {},
		nextNodeType: "paragraph"
	};
	function horizontalRuleOptions(partial) {
		var _partial$HTMLAttribut;
		return {
			HTMLAttributes: (_partial$HTMLAttribut = partial === null || partial === void 0 ? void 0 : partial.HTMLAttributes) !== null && _partial$HTMLAttribut !== void 0 ? _partial$HTMLAttribut : DEFAULT_OPTIONS.HTMLAttributes,
			nextNodeType: (partial === null || partial === void 0 ? void 0 : partial.nextNodeType) && partial.nextNodeType.length > 0 ? partial.nextNodeType : DEFAULT_OPTIONS.nextNodeType
		};
	}
	function isHorizontalRuleInput(text) {
		return HORIZONTAL_RULE_INPUT.test(text);
	}
	var ATTR_NAME = /^[A-Za-z_:][\w:.-]*$/;
	function safeName(name) {
		return ATTR_NAME.test(name) && !/^on/i.test(name);
	}
	/** 后者覆盖前者。事件处理属性名会被丢掉。 */
	function mergeAttributes(...sources) {
		const out = {};
		for (const source of sources) {
			if (!source) continue;
			for (const [key, value] of Object.entries(source)) {
				if (!safeName(key)) continue;
				out[key] = value;
			}
		}
		return out;
	}
	function escapeAttr(value) {
		return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
	}
	function readAttributes(source) {
		const attrs = {};
		const re = /([A-Za-z_:][\w:.-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
		let matched = 0;
		for (const match of source.matchAll(re)) {
			var _ref, _ref2, _match$;
			matched += match[0].length;
			const name = match[1];
			if (!name || !safeName(name)) continue;
			attrs[name] = (_ref = (_ref2 = (_match$ = match[2]) !== null && _match$ !== void 0 ? _match$ : match[3]) !== null && _ref2 !== void 0 ? _ref2 : match[4]) !== null && _ref !== void 0 ? _ref : "";
		}
		const leftovers = source.replace(/\s/g, "");
		if (matched !== leftovers.length && source.trim().length > 0) {
			if (source.replace(re, "").trim().length > 0) return null;
		}
		return attrs;
	}
	/** `parseHTML: [{ tag: 'hr' }]`。只接受单独一个 hr 标签。 */
	function parseHorizontalRuleHTML(html) {
		var _match$2;
		const match = /^<hr\b([^>]*)>$/i.exec(html.trim());
		if (!match) return null;
		let raw = ((_match$2 = match[1]) !== null && _match$2 !== void 0 ? _match$2 : "").trim();
		if (raw.endsWith("/")) raw = raw.slice(0, -1).trim();
		const htmlAttributes = readAttributes(raw);
		if (!htmlAttributes) return null;
		return {
			type: "horizontalRule",
			htmlAttributes
		};
	}
	/** `renderHTML`：选项上的 HTMLAttributes 打底，节点自己的属性覆盖。 */
	function renderHorizontalRule(node, options) {
		const attrs = mergeAttributes(horizontalRuleOptions(options).HTMLAttributes, node.htmlAttributes);
		const body = Object.entries(attrs).map(([key, value]) => `${key}="${escapeAttr(value)}"`).join(" ");
		return body.length === 0 ? "<hr>" : `<hr ${body}>`;
	}
	function renderHorizontalRuleMarkdown() {
		return "---";
	}
	function parseHorizontalRuleMarkdown(token) {
		return token === "hr";
	}
	function ruleNode(options) {
		const attrs = mergeAttributes(options.HTMLAttributes);
		return Object.keys(attrs).length > 0 ? {
			type: "horizontalRule",
			attrs
		} : { type: "horizontalRule" };
	}
	function nextTextblock(typeName) {
		if (typeName === "heading") return textblock("heading", "", { level: 1 });
		return textblock("paragraph", "");
	}
	function finish(root, parentPath, hrIndex, options) {
		var _parent$content;
		const parent = parentPath.length === 0 ? root : nodeAt(root, parentPath);
		const content = (_parent$content = parent === null || parent === void 0 ? void 0 : parent.content) !== null && _parent$content !== void 0 ? _parent$content : [];
		const next = content[hrIndex + 1];
		if (next && isTextblockType(next.type)) return {
			doc: root,
			selection: {
				kind: "text",
				path: [...parentPath, hrIndex + 1],
				offset: 0
			}
		};
		if (next) return {
			doc: root,
			selection: {
				kind: "node",
				path: [...parentPath, hrIndex + 1],
				offset: 0
			}
		};
		return {
			doc: spliceChildren(root, parentPath, content.length, 0, [nextTextblock(options.nextNodeType)]),
			selection: {
				kind: "text",
				path: [...parentPath, content.length],
				offset: 0
			}
		};
	}
	/**
	* `setHorizontalRule()`。
	* 文本光标把当前文本块拆开，规则插在中间；节点选区则插在选中块之后。
	* 后面已有文本块时，光标进到那个块的开头；后面是别的块时改成节点选区；
	* 后面什么都没有时补 `nextNodeType`（默认段落）。
	*/
	function setHorizontalRule(doc, options) {
		var _doc$doc$content, _parent$content2;
		const resolved = horizontalRuleOptions(options);
		const hr = ruleNode(resolved);
		if (((_doc$doc$content = doc.doc.content) !== null && _doc$doc$content !== void 0 ? _doc$doc$content : []).length === 0) return finish(spliceChildren(doc.doc, [], 0, 0, [hr]), [], 0, resolved);
		const path = doc.selection.path;
		const index = path[path.length - 1];
		const parentPath = path.slice(0, -1);
		if (index === void 0) return doc;
		const parent = parentPath.length === 0 ? doc.doc : nodeAt(doc.doc, parentPath);
		const siblings = (_parent$content2 = parent === null || parent === void 0 ? void 0 : parent.content) !== null && _parent$content2 !== void 0 ? _parent$content2 : [];
		const at = Math.min(siblings.length - 1, Math.max(0, index));
		const current = siblings[at];
		if (doc.selection.kind === "node" || !current || !isTextblockType(current.type)) return finish(spliceChildren(doc.doc, parentPath, at + 1, 0, [hr]), parentPath, at + 1, resolved);
		const text = blockPlain(current);
		const offset = Math.min(text.length, Math.max(0, doc.selection.offset));
		const left = text.slice(0, offset);
		const right = text.slice(offset);
		const middle = [];
		if (left.length > 0) middle.push(textblock(current.type, left, current.attrs));
		const hrIndex = at + middle.length;
		middle.push(hr);
		if (right.length > 0) middle.push(textblock(current.type, right, current.attrs));
		return finish(spliceChildren(doc.doc, parentPath, at, 1, middle), parentPath, hrIndex, resolved);
	}
	/**
	* 输入规则。光标在文本块末尾，且光标前的整段匹配 `HORIZONTAL_RULE_INPUT` 时，
	* 用分隔线换掉这一段，光标规则与 `setHorizontalRule` 相同。
	*/
	function applyHorizontalRuleInput(doc, options) {
		if (doc.selection.kind !== "text") return null;
		const path = doc.selection.path;
		const current = nodeAt(doc.doc, path);
		if (!current || !isTextblockType(current.type)) return null;
		const text = blockPlain(current);
		if (doc.selection.offset !== text.length || !isHorizontalRuleInput(text)) return null;
		const index = path[path.length - 1];
		if (index === void 0) return null;
		const resolved = horizontalRuleOptions(options);
		const parentPath = path.slice(0, -1);
		return finish(spliceChildren(doc.doc, parentPath, index, 1, [ruleNode(resolved)]), parentPath, index, resolved);
	}
	//#endregion
	//#region src/nodes/catalog.ts
	/**
	* 节点扩展目录。形状对齐 Tiptap 的 Node：
	* https://tiptap.dev/docs/editor/extensions/nodes
	*
	* 每个节点声明 name、group、content、parseHTML、命令名、快捷键和输入规则。
	* 这里不 import `@tiptap/*`。命令真正改文档的函数在 `document.ts`。
	*/
	var none = {};
	var documentNode = {
		name: "doc",
		group: "block",
		content: "block+",
		parseHTML: [],
		renderTag: "div",
		commands: [],
		shortcuts: none
	};
	var paragraphNode = {
		name: "paragraph",
		group: "block",
		content: "inline*",
		parseHTML: [{ tag: "p" }],
		renderTag: "p",
		commands: ["setParagraph"],
		shortcuts: none
	};
	var textNode = {
		name: "text",
		group: "inline",
		content: "",
		parseHTML: [],
		renderTag: "",
		commands: [],
		shortcuts: none
	};
	var headingNode = {
		name: "heading",
		group: "block",
		content: "inline*",
		defining: true,
		parseHTML: [
			{ tag: "h1" },
			{ tag: "h2" },
			{ tag: "h3" },
			{ tag: "h4" },
			{ tag: "h5" },
			{ tag: "h6" }
		],
		renderTag: "h1",
		commands: ["setHeading", "toggleHeading"],
		shortcuts: {
			"Mod-Alt-1": "toggleHeading",
			"Mod-Alt-2": "toggleHeading",
			"Mod-Alt-3": "toggleHeading",
			"Mod-Alt-4": "toggleHeading",
			"Mod-Alt-5": "toggleHeading",
			"Mod-Alt-6": "toggleHeading"
		},
		input: /^(#{1,6})\s$/
	};
	var blockquoteNode = {
		name: "blockquote",
		group: "block",
		content: "block+",
		defining: true,
		parseHTML: [{ tag: "blockquote" }],
		renderTag: "blockquote",
		commands: [
			"setBlockquote",
			"toggleBlockquote",
			"unsetBlockquote"
		],
		shortcuts: { "Mod-Shift-b": "toggleBlockquote" },
		input: /^\s*>\s$/
	};
	var bulletListNode = {
		name: "bulletList",
		group: "block",
		content: "listItem+",
		parseHTML: [{ tag: "ul" }],
		renderTag: "ul",
		commands: ["toggleBulletList"],
		shortcuts: { "Mod-Shift-8": "toggleBulletList" },
		input: /^\s*[-+*]\s$/
	};
	var orderedListNode = {
		name: "orderedList",
		group: "block",
		content: "listItem+",
		parseHTML: [{ tag: "ol" }],
		renderTag: "ol",
		commands: ["toggleOrderedList"],
		shortcuts: { "Mod-Shift-7": "toggleOrderedList" },
		input: /^(\d+)\.\s$/
	};
	var listItemNode = {
		name: "listItem",
		group: "block",
		content: "paragraph block*",
		defining: true,
		parseHTML: [{ tag: "li" }],
		renderTag: "li",
		commands: [],
		shortcuts: none
	};
	var codeBlockNode = {
		name: "codeBlock",
		group: "block",
		content: "text*",
		defining: true,
		parseHTML: [{ tag: "pre" }],
		renderTag: "pre",
		commands: ["setCodeBlock", "toggleCodeBlock"],
		shortcuts: { "Mod-Alt-c": "toggleCodeBlock" },
		input: /^```([a-z]+)?[\s\n]$/
	};
	var hardBreakNode = {
		name: "hardBreak",
		group: "inline",
		content: "",
		atom: true,
		parseHTML: [{ tag: "br" }],
		renderTag: "br",
		commands: ["setHardBreak"],
		shortcuts: {
			"Shift-Enter": "setHardBreak",
			"Mod-Enter": "setHardBreak"
		}
	};
	var horizontalRuleNode = {
		name: "horizontalRule",
		group: "block",
		content: "",
		atom: true,
		parseHTML: [{ tag: "hr" }],
		renderTag: "hr",
		commands: ["setHorizontalRule"],
		shortcuts: none,
		input: HORIZONTAL_RULE_INPUT,
		markdownToken: "hr",
		markdown: "---"
	};
	/** 与 Tiptap StarterKit 的节点集合对应，另加 image。 */
	var starterNodes = [
		documentNode,
		paragraphNode,
		textNode,
		headingNode,
		blockquoteNode,
		bulletListNode,
		orderedListNode,
		listItemNode,
		codeBlockNode,
		hardBreakNode,
		horizontalRuleNode,
		{
			name: "image",
			group: "block",
			content: "",
			atom: true,
			parseHTML: [{ tag: "img" }],
			renderTag: "img",
			commands: ["setImage"],
			shortcuts: none
		}
	];
	function nodeExtension(name) {
		return starterNodes.find((node) => node.name === name);
	}
	/** 把光标前的文本交给各节点的 input。先匹配的规则生效。 */
	function matchNodeInput(before) {
		var _headingNode$input, _blockquoteNode$input, _bulletListNode$input, _orderedListNode$inpu, _codeBlockNode$input, _horizontalRuleNode$i;
		const heading = (_headingNode$input = headingNode.input) === null || _headingNode$input === void 0 ? void 0 : _headingNode$input.exec(before);
		const marks = heading === null || heading === void 0 ? void 0 : heading[1];
		if (heading && marks) return {
			node: "heading",
			consume: before.length,
			level: marks.length
		};
		if ((_blockquoteNode$input = blockquoteNode.input) === null || _blockquoteNode$input === void 0 ? void 0 : _blockquoteNode$input.test(before)) return {
			node: "blockquote",
			consume: before.length
		};
		if ((_bulletListNode$input = bulletListNode.input) === null || _bulletListNode$input === void 0 ? void 0 : _bulletListNode$input.test(before)) return {
			node: "bulletList",
			consume: before.length
		};
		if ((_orderedListNode$inpu = orderedListNode.input) === null || _orderedListNode$inpu === void 0 ? void 0 : _orderedListNode$inpu.test(before)) return {
			node: "orderedList",
			consume: before.length
		};
		if ((_codeBlockNode$input = codeBlockNode.input) === null || _codeBlockNode$input === void 0 ? void 0 : _codeBlockNode$input.test(before)) return {
			node: "codeBlock",
			consume: before.length
		};
		if ((_horizontalRuleNode$i = horizontalRuleNode.input) === null || _horizontalRuleNode$i === void 0 ? void 0 : _horizontalRuleNode$i.test(before)) return {
			node: "horizontalRule",
			consume: before.length
		};
		return null;
	}
	//#endregion
	//#region src/nodes/document.ts
	/**
	* 节点命令。名字与 Tiptap 的 `editor.commands.*` 相同，作用在 {@link OjDocument} 上。
	* 接到真正的 Tiptap 时不要再调用这些函数，命令桥会把 id 交给编辑器自己的实现。
	*/
	function selected(doc) {
		const node = nodeAt(doc.doc, doc.selection.path);
		if (!node) return null;
		return {
			path: doc.selection.path,
			node
		};
	}
	function replaceAt(doc, path, node, selection) {
		const index = path[path.length - 1];
		if (index === void 0) return doc;
		return {
			doc: spliceChildren(doc.doc, path.slice(0, -1), index, 1, [node]),
			selection
		};
	}
	function toggleHeading(doc, level) {
		var _hit$node$attrs;
		const hit = selected(doc);
		if (!hit || !isTextblockType(hit.node.type)) return doc;
		const safe = level >= 1 && level <= 6 ? level : 1;
		const next = hit.node.type === "heading" && ((_hit$node$attrs = hit.node.attrs) === null || _hit$node$attrs === void 0 ? void 0 : _hit$node$attrs.level) === safe ? textblock("paragraph", blockPlain(hit.node)) : textblock("heading", blockPlain(hit.node), { level: safe });
		const offset = Math.min(doc.selection.offset, blockPlain(next).length);
		return replaceAt(doc, hit.path, next, {
			kind: "text",
			path: hit.path,
			offset
		});
	}
	function toggleCodeBlock(doc) {
		const hit = selected(doc);
		if (!hit || !isTextblockType(hit.node.type)) return doc;
		const next = textblock(hit.node.type === "codeBlock" ? "paragraph" : "codeBlock", blockPlain(hit.node));
		const offset = Math.min(doc.selection.offset, blockPlain(next).length);
		return replaceAt(doc, hit.path, next, {
			kind: "text",
			path: hit.path,
			offset
		});
	}
	function ancestor(doc, type) {
		let current = doc.doc;
		const acc = [];
		let found = null;
		for (const index of doc.selection.path) {
			var _current$content;
			const child = (_current$content = current.content) === null || _current$content === void 0 ? void 0 : _current$content[index];
			if (!child) return found;
			acc.push(index);
			if (child.type === type && acc.length < doc.selection.path.length) found = {
				path: [...acc],
				node: child
			};
			current = child;
		}
		return found;
	}
	function lift(doc, path) {
		var _node$content, _node$content2, _relative$;
		const node = nodeAt(doc.doc, path);
		const index = path[path.length - 1];
		if (!node || index === void 0) return doc;
		const isList = node.type === "bulletList" || node.type === "orderedList";
		const pieces = isList ? ((_node$content = node.content) !== null && _node$content !== void 0 ? _node$content : []).flatMap((item) => {
			var _item$content;
			return [...(_item$content = item.content) !== null && _item$content !== void 0 ? _item$content : []];
		}) : [...(_node$content2 = node.content) !== null && _node$content2 !== void 0 ? _node$content2 : []];
		const root = spliceChildren(doc.doc, path.slice(0, -1), index, 1, pieces);
		const relative = doc.selection.path.slice(path.length);
		let flat = (_relative$ = relative[0]) !== null && _relative$ !== void 0 ? _relative$ : 0;
		let tail = relative.slice(1);
		if (isList) {
			var _relative$2, _node$content$item$co, _node$content3, _inside$;
			const itemIndex = (_relative$2 = relative[0]) !== null && _relative$2 !== void 0 ? _relative$2 : 0;
			flat = 0;
			for (let item = 0; item < itemIndex; item += 1) flat += (_node$content$item$co = (_node$content3 = node.content) === null || _node$content3 === void 0 || (_node$content3 = _node$content3[item]) === null || _node$content3 === void 0 || (_node$content3 = _node$content3.content) === null || _node$content3 === void 0 ? void 0 : _node$content3.length) !== null && _node$content$item$co !== void 0 ? _node$content$item$co : 0;
			const inside = relative.slice(1);
			flat += (_inside$ = inside[0]) !== null && _inside$ !== void 0 ? _inside$ : 0;
			tail = inside.slice(1);
		}
		return {
			doc: root,
			selection: {
				kind: "text",
				path: [
					...path.slice(0, -1),
					index + flat,
					...tail
				],
				offset: doc.selection.offset
			}
		};
	}
	function wrap(doc, path, make, depth) {
		const node = nodeAt(doc.doc, path);
		const index = path[path.length - 1];
		if (!node || index === void 0) return doc;
		const root = spliceChildren(doc.doc, path.slice(0, -1), index, 1, [make(node)]);
		const nested = Array.from({ length: depth }, () => 0);
		return {
			doc: root,
			selection: {
				kind: "text",
				path: [...path, ...nested],
				offset: doc.selection.offset
			}
		};
	}
	function toggleBlockquote(doc) {
		const quote = ancestor(doc, "blockquote");
		if (quote) return lift(doc, quote.path);
		const hit = selected(doc);
		if (!hit) return doc;
		return wrap(doc, hit.path, (node) => ({
			type: "blockquote",
			content: [node]
		}), 1);
	}
	function toggleList(doc, type) {
		var _ancestor;
		const list = (_ancestor = ancestor(doc, "bulletList")) !== null && _ancestor !== void 0 ? _ancestor : ancestor(doc, "orderedList");
		if (list) {
			if (list.node.type === type) return lift(doc, list.path);
			return replaceAt(doc, list.path, {
				...list.node,
				type
			}, doc.selection);
		}
		const hit = selected(doc);
		if (!hit || !isTextblockType(hit.node.type)) return doc;
		return wrap(doc, hit.path, (node) => ({
			type,
			content: [{
				type: "listItem",
				content: [node]
			}]
		}), 2);
	}
	function toggleBulletList(doc) {
		return toggleList(doc, "bulletList");
	}
	function toggleOrderedList(doc) {
		return toggleList(doc, "orderedList");
	}
	function setHardBreak(doc) {
		const hit = selected(doc);
		if (!hit || doc.selection.kind !== "text" || !isTextblockType(hit.node.type)) return doc;
		const text = blockPlain(hit.node);
		const offset = Math.min(text.length, Math.max(0, doc.selection.offset));
		const content = [];
		const left = text.slice(0, offset);
		const right = text.slice(offset);
		if (left.length > 0) content.push({
			type: "text",
			text: left
		});
		content.push({ type: "hardBreak" });
		if (right.length > 0) content.push({
			type: "text",
			text: right
		});
		const next = hit.node.attrs ? {
			type: hit.node.type,
			attrs: hit.node.attrs,
			content
		} : {
			type: hit.node.type,
			content
		};
		return replaceAt(doc, hit.path, next, {
			kind: "text",
			path: hit.path,
			offset
		});
	}
	/** 光标前的文本命中某个节点的输入规则时，换成那个节点并删掉标记。 */
	function applyNodeInput(doc) {
		if (doc.selection.kind !== "text") return null;
		const hit = selected(doc);
		if (!hit || !isTextblockType(hit.node.type)) return null;
		const text = blockPlain(hit.node);
		const match = matchNodeInput(text.slice(0, Math.min(doc.selection.offset, text.length)));
		if (!match) return null;
		if (match.node === "horizontalRule") return applyHorizontalRuleInput(doc);
		const rest = text.slice(match.consume);
		const caret = {
			kind: "text",
			path: hit.path,
			offset: rest.length
		};
		if (match.node === "heading") {
			var _match$level;
			return replaceAt(doc, hit.path, textblock("heading", rest, { level: (_match$level = match.level) !== null && _match$level !== void 0 ? _match$level : 1 }), caret);
		}
		if (match.node === "codeBlock") return replaceAt(doc, hit.path, textblock("codeBlock", rest), caret);
		const paragraph = replaceAt(doc, hit.path, textblock("paragraph", rest), caret);
		if (match.node === "blockquote") return ancestor(paragraph, "blockquote") ? paragraph : toggleBlockquote(paragraph);
		if (match.node === "bulletList") return ancestor(paragraph, "bulletList") ? paragraph : toggleBulletList(paragraph);
		if (match.node === "orderedList") return ancestor(paragraph, "orderedList") ? paragraph : toggleOrderedList(paragraph);
		return null;
	}
	//#endregion
	exports.A4_WIDTH_PX = A4_WIDTH_PX;
	exports.COMMAND_ALIGN_LEFT = COMMAND_ALIGN_LEFT;
	exports.COMMAND_BLOCKQUOTE = COMMAND_BLOCKQUOTE;
	exports.COMMAND_BOLD = COMMAND_BOLD;
	exports.COMMAND_BULLET_LIST = COMMAND_BULLET_LIST;
	exports.COMMAND_CODE_BLOCK = COMMAND_CODE_BLOCK;
	exports.COMMAND_HARD_BREAK = COMMAND_HARD_BREAK;
	exports.COMMAND_HEADING = COMMAND_HEADING;
	exports.COMMAND_HORIZONTAL_RULE = COMMAND_HORIZONTAL_RULE;
	exports.COMMAND_ITALIC = COMMAND_ITALIC;
	exports.COMMAND_ORDERED_LIST = COMMAND_ORDERED_LIST;
	exports.COMMAND_TABLE = COMMAND_TABLE;
	exports.COMMAND_UNDERLINE = COMMAND_UNDERLINE;
	exports.DEFAULT_GRID_LIMITS = DEFAULT_GRID_LIMITS;
	exports.HORIZONTAL_RULE_GROUP = HORIZONTAL_RULE_GROUP;
	exports.HORIZONTAL_RULE_INPUT = HORIZONTAL_RULE_INPUT;
	exports.HORIZONTAL_RULE_MARKDOWN = HORIZONTAL_RULE_MARKDOWN;
	exports.HORIZONTAL_RULE_MARKDOWN_TOKEN = HORIZONTAL_RULE_MARKDOWN_TOKEN;
	exports.HORIZONTAL_RULE_NAME = HORIZONTAL_RULE_NAME;
	exports.ZOOM_MAX = ZOOM_MAX;
	exports.ZOOM_MIN = ZOOM_MIN;
	exports.ZOOM_STEP = ZOOM_STEP;
	exports.applyHorizontalRuleInput = applyHorizontalRuleInput;
	exports.applyNodeInput = applyNodeInput;
	exports.blockPlain = blockPlain;
	exports.bridgedCommandIds = bridgedCommandIds;
	exports.clampZoom = clampZoom;
	exports.createDocument = createDocument;
	exports.createGridPicker = createGridPicker;
	exports.createMemoryEditor = createMemoryEditor;
	exports.createTooltipMachine = createTooltipMachine;
	exports.editorCommands = editorCommands;
	exports.extendStroke = extendStroke;
	exports.filterTree = filterTree;
	exports.horizontalRuleOptions = horizontalRuleOptions;
	exports.iconLabelProblem = iconLabelProblem;
	exports.iconMarkup = iconMarkup;
	exports.icons = icons;
	exports.isDevEnv = isDevEnv;
	exports.isHeadingLevel = isHeadingLevel;
	exports.isHorizontalRuleInput = isHorizontalRuleInput;
	exports.isTableSize = isTableSize;
	exports.isTextblockType = isTextblockType;
	exports.matchNodeInput = matchNodeInput;
	exports.mergeAttributes = mergeAttributes;
	exports.neighbor = neighbor;
	exports.nodeExtension = nodeExtension;
	exports.pageWidth = pageWidth;
	exports.parseHorizontalRuleHTML = parseHorizontalRuleHTML;
	exports.parseHorizontalRuleMarkdown = parseHorizontalRuleMarkdown;
	exports.placePopper = placePopper;
	exports.plainText = plainText;
	exports.registerEditorCommands = registerEditorCommands;
	exports.renderHorizontalRule = renderHorizontalRule;
	exports.renderHorizontalRuleMarkdown = renderHorizontalRuleMarkdown;
	exports.replaceAll = replaceAll;
	exports.replaceOne = replaceOne;
	exports.rulerTicks = rulerTicks;
	exports.searchHits = searchHits;
	exports.selectByKey = selectByKey;
	exports.setHardBreak = setHardBreak;
	exports.setHorizontalRule = setHorizontalRule;
	exports.startStroke = startStroke;
	exports.starterNodes = starterNodes;
	exports.stepZoom = stepZoom;
	exports.strokePath = strokePath;
	exports.textblock = textblock;
	exports.tiptapEditorHost = tiptapEditorHost;
	exports.toggleBlockquote = toggleBlockquote;
	exports.toggleBulletList = toggleBulletList;
	exports.toggleCodeBlock = toggleCodeBlock;
	exports.toggleHeading = toggleHeading;
	exports.toggleId = toggleId;
	exports.toggleOrderedList = toggleOrderedList;
	exports.withPlain = withPlain;
});
