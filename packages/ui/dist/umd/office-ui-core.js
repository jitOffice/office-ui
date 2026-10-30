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
	//#region src/trigger.ts
	var defaultScheduler = {
		setTimeout: (task, ms) => globalThis.setTimeout(task, ms),
		clearTimeout: (handle) => globalThis.clearTimeout(handle)
	};
	function createTriggerMachine(options = {}) {
		var _options$modes, _options$openDelay, _options$closeDelay, _options$scheduler;
		const modes = new Set((_options$modes = options.modes) !== null && _options$modes !== void 0 ? _options$modes : ["click"]);
		const openDelay = (_options$openDelay = options.openDelay) !== null && _options$openDelay !== void 0 ? _options$openDelay : 0;
		const closeDelay = (_options$closeDelay = options.closeDelay) !== null && _options$closeDelay !== void 0 ? _options$closeDelay : 120;
		const scheduler = (_options$scheduler = options.scheduler) !== null && _options$scheduler !== void 0 ? _options$scheduler : defaultScheduler;
		let timer;
		let open = false;
		function cancel() {
			if (timer === void 0) return;
			scheduler.clearTimeout(timer);
			timer = void 0;
		}
		function apply(next, reason) {
			var _options$onOpen, _options$onClose;
			cancel();
			if (next === open) return;
			open = next;
			if (open) (_options$onOpen = options.onOpen) === null || _options$onOpen === void 0 || _options$onOpen.call(options);
			else (_options$onClose = options.onClose) === null || _options$onClose === void 0 || _options$onClose.call(options, reason);
		}
		function later(ms, task) {
			cancel();
			if (ms <= 0) {
				task();
				return;
			}
			timer = scheduler.setTimeout(() => {
				timer = void 0;
				task();
			}, ms);
		}
		return {
			isOpen: () => open,
			/** 指针进入触发器（或触发器获得焦点时的 hover 语义） */
			enter() {
				if (modes.has("hover")) later(openDelay, () => apply(true, "leave"));
			},
			leave() {
				if (modes.has("hover")) later(closeDelay, () => apply(false, "leave"));
			},
			/**
			* 指针进入面板：只取消待关闭，不动 open。
			* 这是 closeDelay 存在的全部理由——从触发器到面板之间必然有一段空白。
			*/
			panelEnter() {
				cancel();
			},
			panelLeave() {
				if (modes.has("hover")) later(closeDelay, () => apply(false, "panel-leave"));
			},
			press() {
				if (modes.has("click")) apply(!open, "press");
			},
			focusIn() {
				if (modes.has("focus")) apply(true, "leave");
			},
			focusOut() {
				if (modes.has("focus")) later(closeDelay, () => apply(false, "blur"));
			},
			escape() {
				apply(false, "escape");
			},
			close(reason = "manual") {
				apply(false, reason);
			},
			/**
			* 跟上外部真值（`v-model:open`）。
			*
			* 不跟的话，外部把面板关掉之后机器内部还记着 `open === true`，
			* 下一次 `press()` 会算成"关闭"，用户点两下才打开。
			*/
			sync(value) {
				cancel();
				open = value;
			},
			dispose() {
				cancel();
			}
		};
	}
	//#endregion
	//#region src/hotkey.ts
	var MODIFIERS = /* @__PURE__ */ new Set([
		"mod",
		"ctrl",
		"control",
		"cmd",
		"command",
		"meta",
		"alt",
		"option",
		"shift"
	]);
	var KEY_ALIASES = {
		" ": "space",
		spacebar: "space",
		esc: "escape",
		del: "delete",
		ins: "insert",
		up: "arrowup",
		down: "arrowdown",
		left: "arrowleft",
		right: "arrowright",
		plus: "+",
		add: "+"
	};
	/** 显示用的主键名：字母照抄、特殊键给人看得懂的写法 */
	var KEY_LABELS = {
		space: "Space",
		escape: "Esc",
		enter: "Enter",
		tab: "Tab",
		backspace: "Backspace",
		delete: "Del",
		insert: "Ins",
		arrowup: "↑",
		arrowdown: "↓",
		arrowleft: "←",
		arrowright: "→",
		"+": "+",
		"-": "-"
	};
	function normalizeKey(raw) {
		var _KEY_ALIASES$lower;
		if (raw === " ") return "space";
		const lower = raw.trim().toLowerCase();
		return (_KEY_ALIASES$lower = KEY_ALIASES[lower]) !== null && _KEY_ALIASES$lower !== void 0 ? _KEY_ALIASES$lower : lower;
	}
	/** 平台推断只看字符串，方便测试。空串按 linux 处理（最保守的一档）。 */
	function platformFrom(source) {
		if (/mac|iphone|ipad|ipod/i.test(source)) return "mac";
		if (/win/i.test(source)) return "win";
		return "linux";
	}
	/** 运行时平台。拿不到 `navigator` 时按 linux——宁可显示 Ctrl，也不要显示一个假 ⌘。 */
	function detectPlatform() {
		var _nav$platform, _nav$userAgent;
		const nav = globalThis.navigator;
		return platformFrom(`${(_nav$platform = nav === null || nav === void 0 ? void 0 : nav.platform) !== null && _nav$platform !== void 0 ? _nav$platform : ""} ${(_nav$userAgent = nav === null || nav === void 0 ? void 0 : nav.userAgent) !== null && _nav$userAgent !== void 0 ? _nav$userAgent : ""}`);
	}
	function emptySpec() {
		return {
			key: "",
			ctrl: false,
			alt: false,
			shift: false,
			meta: false
		};
	}
	/**
	* 解析 `'mod+shift+z'`。坏绑定一律返回 `undefined`，不抛异常：
	* 命令表是数据，一条写错不应该把整个应用带崩。
	*/
	function parseHotkey(binding, platform) {
		const trimmed = binding.trim();
		const parts = (trimmed.endsWith("++") ? `${trimmed.slice(0, -2)}+plus` : trimmed).split("+").map((part) => part.trim());
		const spec = emptySpec();
		const keys = [];
		for (const part of parts) {
			if (part.length === 0) return void 0;
			const lower = part.toLowerCase();
			if (MODIFIERS.has(lower)) {
				if (lower === "mod") {
					if (platform === "mac") spec.meta = true;
					else spec.ctrl = true;
				} else if (lower === "ctrl" || lower === "control") spec.ctrl = true;
				else if (lower === "cmd" || lower === "command" || lower === "meta") spec.meta = true;
				else if (lower === "alt" || lower === "option") spec.alt = true;
				else spec.shift = true;
				continue;
			}
			keys.push(normalizeKey(part));
		}
		if (keys.length !== 1) return void 0;
		spec.key = keys[0];
		return spec;
	}
	/** 严格匹配：修饰键多一个、少一个都不算命中。 */
	function matchHotkey(spec, event) {
		return normalizeKey(event.key) === spec.key && event.ctrlKey === spec.ctrl && event.altKey === spec.alt && event.shiftKey === spec.shift && event.metaKey === spec.meta;
	}
	/** 显示用文案：mac 用符号且不加 `+`，Windows/Linux 用 `Ctrl+Shift+Z` 这种写法。 */
	function formatHotkey(binding, platform) {
		var _KEY_LABELS$spec$key;
		const spec = parseHotkey(binding, platform);
		if (spec === void 0) return binding;
		const key = (_KEY_LABELS$spec$key = KEY_LABELS[spec.key]) !== null && _KEY_LABELS$spec$key !== void 0 ? _KEY_LABELS$spec$key : spec.key.length === 1 ? spec.key.toUpperCase() : spec.key;
		if (platform === "mac") return `${spec.ctrl ? "⌃" : ""}${spec.alt ? "⌥" : ""}${spec.shift ? "⇧" : ""}${spec.meta ? "⌘" : ""}${key}`;
		const parts = [];
		if (spec.ctrl) parts.push("Ctrl");
		if (spec.alt) parts.push("Alt");
		if (spec.shift) parts.push("Shift");
		if (spec.meta) parts.push("Win");
		parts.push(key);
		return parts.join("+");
	}
	function canonical(spec) {
		return `${spec.ctrl ? "C" : ""}${spec.alt ? "A" : ""}${spec.shift ? "S" : ""}${spec.meta ? "M" : ""}:${spec.key}`;
	}
	function keysOf(binding) {
		const keys = binding.keys;
		if (keys === void 0) return [];
		return typeof keys === "string" ? [keys] : [...keys];
	}
	/**
	* 冲突检测。同一个命令把同一条快捷键写两遍不算冲突——冲突是**两个命令抢一个键**，
	* 报出来的第一条就是"后注册的把先注册的盖掉了"。
	*/
	function hotkeyConflicts(bindings, platform) {
		const seen = /* @__PURE__ */ new Map();
		for (const binding of bindings) for (const key of keysOf(binding)) {
			const spec = parseHotkey(key, platform);
			if (spec === void 0) continue;
			const id = canonical(spec);
			const entry = seen.get(id);
			if (entry === void 0) {
				seen.set(id, {
					label: formatHotkey(key, platform),
					ids: [binding.id]
				});
				continue;
			}
			if (!entry.ids.includes(binding.id)) entry.ids.push(binding.id);
		}
		return [...seen.values()].filter((entry) => entry.ids.length > 1).map((entry) => ({
			label: entry.label,
			ids: entry.ids
		}));
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
	//#region src/ribbon.ts
	var DEGRADE = {
		large: "medium",
		medium: "small",
		small: void 0
	};
	var SIZE_RANK = {
		large: 2,
		medium: 1,
		small: 0
	};
	/** 取更小的那一档。探测时用它保证只会往下压，不会把命令反向放大。 */
	function ribbonSmallerSize(a, b) {
		return SIZE_RANK[a] <= SIZE_RANK[b] ? a : b;
	}
	/**
	* 还差哪一档的宽度没量到。
	*
	* 没给 `width` 的命令，第一版只能按"设计尺寸"渲染出来才量得到宽度；比它更小的档位
	* 则要**真的按那一档渲染一次**才能量。所以组件按 `medium` → `small` 的顺序整组探一次，
	* 量到就记进表里、立刻按真实宽度重算——不靠比例猜，也不事先克隆一份插槽内容去量。
	*
	* 返回 `undefined` 表示已经量全，或者所有缺失都被使用方用 `widths` 显式给出了。
	*/
	function ribbonProbeSize(items, measured) {
		for (const target of ["medium", "small"]) if (items.some((item) => {
			var _item$widths, _measured$item$id;
			if (SIZE_RANK[item.size] < SIZE_RANK[target]) return false;
			if (target === item.size) return false;
			if (((_item$widths = item.widths) === null || _item$widths === void 0 ? void 0 : _item$widths[target]) !== void 0) return false;
			return ((_measured$item$id = measured[item.id]) === null || _measured$item$id === void 0 ? void 0 : _measured$item$id[target]) === void 0;
		})) return target;
	}
	function widthOf(item) {
		var _item$widths$item$dis, _item$widths2;
		return (_item$widths$item$dis = (_item$widths2 = item.widths) === null || _item$widths2 === void 0 ? void 0 : _item$widths2[item.display]) !== null && _item$widths$item$dis !== void 0 ? _item$widths$item$dis : item.width;
	}
	function span(items, gap) {
		if (items.length === 0) return 0;
		return items.reduce((sum, item) => sum + widthOf(item), 0) + gap * (items.length - 1);
	}
	/**
	* 把命令铺进有限宽度：
	*   1. 放得下就原样放；
	*   2. 放不下先**降级**（large→medium→small）：先整组降一档，还不够再整组降第二档，
	*      每降一个就复查一次——顺序不能乱，Ribbon 的肌肉记忆全靠位置；
	*   3. 还装不下就从**末尾**往 `»` 里塞，塞到连"最后一个可见项 + `»`"都放不下为止。
	*/
	function packRibbon(items, availableWidth, options = {}) {
		var _options$gap, _options$overflowWidt;
		const gap = (_options$gap = options.gap) !== null && _options$gap !== void 0 ? _options$gap : 2;
		const overflowWidth = (_options$overflowWidt = options.overflowWidth) !== null && _options$overflowWidt !== void 0 ? _options$overflowWidt : 20;
		const packed = items.map((item) => ({
			...item,
			display: item.size
		}));
		if (packed.length === 0) return {
			visible: [],
			overflow: [],
			used: 0
		};
		if (span(packed, gap) <= availableWidth) return {
			visible: packed,
			overflow: [],
			used: span(packed, gap)
		};
		for (const target of ["medium", "small"]) for (const item of packed) {
			if (DEGRADE[item.display] !== target) continue;
			item.display = target;
			if (span(packed, gap) <= availableWidth) return {
				visible: packed,
				overflow: [],
				used: span(packed, gap)
			};
		}
		const visible = [...packed];
		const overflow = [];
		while (visible.length > 0) {
			if (span(visible, gap) + gap + overflowWidth <= availableWidth) break;
			overflow.unshift(visible.pop());
		}
		return {
			visible,
			overflow,
			used: span(visible, gap) + (overflow.length > 0 ? (visible.length > 0 ? gap : 0) + overflowWidth : 0)
		};
	}
	function createRibbonChrome(tab, collapsed = false) {
		return {
			tab,
			collapsed,
			peek: false
		};
	}
	/** 面板此刻是否可见。收起 + 没临时展开 = 不可见。 */
	function ribbonPanelOpen(state) {
		return !state.collapsed || state.peek;
	}
	/**
	* 单击选项卡。展开态只切标签；收起态先临时展开，
	* 再点同一个标签则收回（Word/WPS 都是这个手感）。
	*/
	function ribbonSelect(state, id) {
		if (!state.collapsed) return state.tab === id ? state : {
			...state,
			tab: id,
			peek: false
		};
		if (state.peek && state.tab === id) return {
			...state,
			peek: false
		};
		return {
			tab: id,
			collapsed: true,
			peek: true
		};
	}
	/** 双击选项卡（或点收起箭头）：在"固定展开"与"固定收起"之间切，顺手清掉临时展开。 */
	function ribbonToggleCollapsed(state) {
		return {
			tab: state.tab,
			collapsed: !state.collapsed,
			peek: false
		};
	}
	/** Esc / 点到面板外面：只收回临时展开，不动固定状态。 */
	function ribbonDismiss(state) {
		return state.peek ? {
			...state,
			peek: false
		} : state;
	}
	/**
	* 把一次按键映射到选项卡 id。只认单字符、大小写不敏感、先到先得。
	* 多字符（`Enter`、`ArrowLeft`）一律不认：那些键在 Ribbon 里另有语义。
	*/
	function ribbonKeyTip(items, key) {
		if (key.length !== 1) return void 0;
		const wanted = key.toLowerCase();
		for (const item of items) if (item.keyTip !== void 0 && item.keyTip.length > 0 && item.keyTip.toLowerCase() === wanted) return item.id;
	}
	/** 有没有任何标签配了 Key Tip——没配就别在按 `Alt` 时弹一排空提示。 */
	function ribbonHasKeyTips(items) {
		return items.some((item) => item.keyTip !== void 0 && item.keyTip.length > 0);
	}
	//#endregion
	//#region src/icon-registry.ts
	/** kebab-case，且不能落在内置命名空间里。 */
	var NAME_PATTERN = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
	var RESERVED_PREFIX = "oj-";
	var FORBIDDEN = [
		{
			pattern: /<script/i,
			reason: "含 <script>"
		},
		{
			pattern: /\son[a-z]+\s*=/i,
			reason: "含内联事件处理器（onload= 这类）"
		},
		{
			pattern: /javascript:/i,
			reason: "含 javascript: 协议"
		},
		{
			pattern: /<foreignobject/i,
			reason: "含 <foreignObject>（可嵌入任意 HTML）"
		},
		{
			pattern: /<image\b/i,
			reason: "含 <image>（外链图片，离线环境会挂住首帧）"
		},
		{
			pattern: /(?:xlink:)?href\s*=\s*["']?\s*(?:https?:)?\/\//i,
			reason: "含外链 href"
		}
	];
	var registry = /* @__PURE__ */ new Map();
	/**
	* 校验一份图标 markup。返回 `undefined` 表示可用；否则返回给人看的问题描述。
	* 独立导出是为了让它能在零依赖的 `node --test` 里被逐条断言（不加载 vue）。
	*/
	function iconMarkupProblem(name, markup) {
		var _trimmed$match$length, _trimmed$match;
		if (typeof name !== "string" || !NAME_PATTERN.test(name)) return `名字 "${name}" 不是 kebab-case（只允许小写字母、数字、连字符，且不以数字开头）`;
		if (name.startsWith(RESERVED_PREFIX)) return `名字 "${name}" 占用了内置命名空间（oj-* 由 @jitoffice/icons 提供，业务图标请换个前缀）`;
		if (typeof markup !== "string") return `"${name}" 的 markup 不是字符串`;
		const trimmed = markup.trim();
		if (!trimmed.toLowerCase().startsWith("<svg")) return `"${name}" 的 markup 不是以 <svg 开头`;
		if (!trimmed.toLowerCase().endsWith("</svg>")) return `"${name}" 的 markup 不是以 </svg> 结尾`;
		const roots = (_trimmed$match$length = (_trimmed$match = trimmed.match(/<svg[\s>]/gi)) === null || _trimmed$match === void 0 ? void 0 : _trimmed$match.length) !== null && _trimmed$match$length !== void 0 ? _trimmed$match$length : 0;
		if (roots !== 1) return `"${name}" 的 markup 含 ${roots} 个 <svg>，必须是单个图标`;
		if (!/\sviewBox\s*=\s*["'][^"']+["']/i.test(trimmed)) return `"${name}" 的 markup 缺 viewBox`;
		for (const { pattern, reason } of FORBIDDEN) if (pattern.test(trimmed)) return `"${name}" 的 markup ${reason}`;
	}
	function assert(name, markup) {
		const problem = iconMarkupProblem(name, markup);
		if (problem !== void 0) throw new Error(`[OjIcon] 注册失败：${problem}`);
	}
	/** 注册单枚图标。同名覆盖（主题/微前端替换用）。 */
	function registerIcon(name, markup) {
		assert(name, markup);
		registry.set(name, markup.trim());
	}
	/** 批量注册。**先整体校验再写入**：一条不合格时不留半套注册结果。 */
	function registerIcons(table) {
		for (const [name, markup] of Object.entries(table)) assert(name, markup);
		for (const [name, markup] of Object.entries(table)) registry.set(name, markup.trim());
	}
	/** 注销。返回是否真的删掉了（重复注销不该当成错误）。 */
	function unregisterIcon(name) {
		return registry.delete(name);
	}
	/** 已注册的业务图标名（不含内置的三十枚）。 */
	function registeredIconNames() {
		return [...registry.keys()];
	}
	/** 清空。测试与"整站换一套图标"用。 */
	function resetRegisteredIcons() {
		registry.clear();
	}
	function registeredIconMarkup(name) {
		return registry.get(name);
	}
	//#endregion
	//#region src/icons.ts
	/**
	* 自绘图标。只发 SVG 字符串，不发图标字体（prd/00 许可红线）。
	* 完整图标管线仍是后续的 `@jitoffice/icons`，这里先覆盖外壳会用到的三十枚。
	* 业务侧要加图标不要改这张表——用 `registerIcon`（见 `icon-registry.ts`），
	* 否则每次升级都会把改动冲掉。
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
		const registered = registeredIconMarkup(name);
		if (registered !== void 0) return registered;
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
	//#region src/shell/gallery.ts
	/**
	* 网格陈列的方向键模型（03 §3 B 组 `OjRibbonGallery`）。
	*
	* 单独抽出来是因为"上下左右在网格里怎么走"是最容易写歪的一段：写成按 `columns`
	* 硬算行列，碰到最后一行不满就会算出不存在的下标；写成纯 `+1/-1`，上下键又变成
	* 左右键的别名。这里统一按**下标**算，并且永远夹在 `[0, count-1]` 里。
	*/
	/** 返回移动后的下标。`columns` 非法（0、负数、NaN）时按 1 列处理，不抛异常。 */
	function galleryNeighbor(columns, count, index, key) {
		if (count <= 0) return 0;
		const cols = Number.isFinite(columns) && columns >= 1 ? Math.floor(columns) : 1;
		const current = Math.min(Math.max(Number.isFinite(index) ? Math.floor(index) : 0, 0), count - 1);
		if (key === "ArrowRight") return Math.min(current + 1, count - 1);
		if (key === "ArrowLeft") return Math.max(current - 1, 0);
		if (key === "ArrowDown") return Math.min(current + cols, count - 1);
		if (key === "ArrowUp") return Math.max(current - cols, 0);
		if (key === "Home") return 0;
		if (key === "End") return count - 1;
		return current;
	}
	//#endregion
	//#region src/menu.ts
	/** 这一项能不能被选中/聚焦。分隔线与禁用项都不行。 */
	function menuSelectable(item) {
		return item.kind !== "separator" && item.disabled !== true;
	}
	/** 可选项的下标表，按原顺序。组件用它做 tabindex 轮换，导航用它算邻居。 */
	function menuSelectableIndices(items) {
		const out = [];
		items.forEach((item, index) => {
			if (menuSelectable(item)) out.push(index);
		});
		return out;
	}
	/**
	* 方向键/Home/End 之后该聚焦哪一项。返回**项下标**，没有可选项时返回 `-1`。
	*
	* `index` 传 `-1` 表示"当前没有任何项被聚焦"：`ArrowDown` 落到第一个可选项，
	* `ArrowUp` 落到最后一个——这是菜单刚打开时的两种进入方向。
	* 未知按键原样返回 `index`，调用方据此判断"这个键不归我管"。
	*/
	function menuNeighbor(items, index, key) {
		const enabled = menuSelectableIndices(items);
		if (enabled.length === 0) return -1;
		const at = enabled.indexOf(index);
		const first = enabled[0];
		const last = enabled[enabled.length - 1];
		if (key === "Home") return first;
		if (key === "End") return last;
		if (key === "ArrowDown") return enabled[(at + 1) % enabled.length];
		if (key === "ArrowUp") return enabled[(at <= 0 ? enabled.length : at) - 1];
		return index;
	}
	/** 回车/空格该触发哪一项。`-1`（无聚焦）或落在禁用项上时返回 `undefined`。 */
	function menuAction(items, index) {
		const item = items[index];
		if (item === void 0 || !menuSelectable(item)) return void 0;
		return item;
	}
	//#endregion
	//#region src/palette.ts
	function isSubsequence(needle, haystack) {
		let at = 0;
		for (const char of haystack) {
			if (char === needle[at]) at += 1;
			if (at === needle.length) return true;
		}
		return needle.length === 0;
	}
	/** 命中返回分数（越大越靠前），不命中返回 `undefined`。空查询一律命中且同分。 */
	function paletteScore(item, query) {
		const wanted = query.trim().toLowerCase();
		if (wanted.length === 0) return 0;
		const label = item.label.toLowerCase();
		if (label === wanted) return 100;
		if (label.startsWith(wanted)) return 80;
		if (label.includes(wanted)) return 60;
		if (item.id.toLowerCase().includes(wanted)) return 40;
		if (item.description !== void 0 && item.description.toLowerCase().includes(wanted)) return 30;
		if (isSubsequence(wanted, label)) return 20;
	}
	function filterPaletteItems(items, query) {
		const scored = [];
		items.forEach((item, index) => {
			const score = paletteScore(item, query);
			if (score !== void 0) scored.push({
				item,
				score,
				index
			});
		});
		scored.sort((a, b) => b.score - a.score || a.index - b.index);
		return scored.map((entry) => entry.item);
	}
	/** 面板里上下移动高亮。**循环**：在最后一条按 ↓ 应该回到第一条，而不是卡住。 */
	function paletteStep(count, current, delta) {
		if (count <= 0) return 0;
		const size = Math.floor(count);
		return (((Number.isFinite(current) ? Math.floor(current) : 0) + (Number.isFinite(delta) ? Math.floor(delta) : 0)) % size + size) % size;
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
	exports.createRibbonChrome = createRibbonChrome;
	exports.createTooltipMachine = createTooltipMachine;
	exports.createTriggerMachine = createTriggerMachine;
	exports.detectPlatform = detectPlatform;
	exports.editorCommands = editorCommands;
	exports.extendStroke = extendStroke;
	exports.filterPaletteItems = filterPaletteItems;
	exports.filterTree = filterTree;
	exports.formatHotkey = formatHotkey;
	exports.galleryNeighbor = galleryNeighbor;
	exports.horizontalRuleOptions = horizontalRuleOptions;
	exports.hotkeyConflicts = hotkeyConflicts;
	exports.iconLabelProblem = iconLabelProblem;
	exports.iconMarkup = iconMarkup;
	exports.iconMarkupProblem = iconMarkupProblem;
	exports.icons = icons;
	exports.isDevEnv = isDevEnv;
	exports.isHeadingLevel = isHeadingLevel;
	exports.isHorizontalRuleInput = isHorizontalRuleInput;
	exports.isTableSize = isTableSize;
	exports.isTextblockType = isTextblockType;
	exports.matchHotkey = matchHotkey;
	exports.matchNodeInput = matchNodeInput;
	exports.menuAction = menuAction;
	exports.menuNeighbor = menuNeighbor;
	exports.menuSelectable = menuSelectable;
	exports.menuSelectableIndices = menuSelectableIndices;
	exports.mergeAttributes = mergeAttributes;
	exports.neighbor = neighbor;
	exports.nodeExtension = nodeExtension;
	exports.normalizeKey = normalizeKey;
	exports.packRibbon = packRibbon;
	exports.pageWidth = pageWidth;
	exports.paletteScore = paletteScore;
	exports.paletteStep = paletteStep;
	exports.parseHorizontalRuleHTML = parseHorizontalRuleHTML;
	exports.parseHorizontalRuleMarkdown = parseHorizontalRuleMarkdown;
	exports.parseHotkey = parseHotkey;
	exports.placePopper = placePopper;
	exports.plainText = plainText;
	exports.platformFrom = platformFrom;
	exports.registerEditorCommands = registerEditorCommands;
	exports.registerIcon = registerIcon;
	exports.registerIcons = registerIcons;
	exports.registeredIconMarkup = registeredIconMarkup;
	exports.registeredIconNames = registeredIconNames;
	exports.renderHorizontalRule = renderHorizontalRule;
	exports.renderHorizontalRuleMarkdown = renderHorizontalRuleMarkdown;
	exports.replaceAll = replaceAll;
	exports.replaceOne = replaceOne;
	exports.resetRegisteredIcons = resetRegisteredIcons;
	exports.ribbonDismiss = ribbonDismiss;
	exports.ribbonHasKeyTips = ribbonHasKeyTips;
	exports.ribbonKeyTip = ribbonKeyTip;
	exports.ribbonPanelOpen = ribbonPanelOpen;
	exports.ribbonProbeSize = ribbonProbeSize;
	exports.ribbonSelect = ribbonSelect;
	exports.ribbonSmallerSize = ribbonSmallerSize;
	exports.ribbonToggleCollapsed = ribbonToggleCollapsed;
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
	exports.unregisterIcon = unregisterIcon;
	exports.withPlain = withPlain;
});
