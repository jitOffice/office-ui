(function(global, factory) {
	typeof exports === "object" && typeof module !== "undefined" ? factory(exports) : typeof define === "function" && define.amd ? define(["exports"], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, factory(global.OfficeUICore = {}));
})(this, function(exports) {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	//#region src/editor-host.ts
	var ENABLED = Object.freeze({ enabled: true });
	/**
	* 测试与 demo 用的内存宿主。
	*
	* 两条 `format.*` 规则按实参分流，因为这两类命令在 UI 上是两种控件：
	*   - 实参是字符串/数字 → **值型命令**（字号、颜色、边框…），记进 `value`，不动 `active`；
	*   - 其它（含无实参）→ **布尔命令**，翻转 `active`。
	*
	* 早先一版对所有 `format.*` 一律翻转 `active`，于是"把字号设成 16"会让字号控件显示成"已选中"，
	* 而真正该变的是 `value`。这类错误只在有了值型命令之后才现形。
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
					if (typeof arg === "string" || typeof arg === "number") states.set(id, {
						...current,
						value: arg
					});
					else states.set(id, {
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
		"format.fontFamily": {
			can: "setFontFamily",
			run: "setFontFamily",
			value: true
		},
		"format.fontSize": {
			can: "setFontSize",
			run: "setFontSize",
			value: true
		},
		"format.textColor": {
			can: "setColor",
			run: "setColor",
			value: true
		},
		"format.border": {
			can: "setBorder",
			run: "setBorder",
			value: true
		},
		"format.lineSpacing": {
			can: "setLineHeight",
			run: "setLineHeight",
			value: true,
			toArg: (arg) => String(arg)
		},
		"format.align": {
			can: "setTextAlign",
			run: "setTextAlign",
			value: true,
			toArg: (arg) => String(arg).trim().split(/\s+/)[0]
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
	/**
	* 值型命令"能不能执行"的判据：方法在不在。
	*
	* 不用 `editor.can().setFontFamily()`：缺参调用时 Tiptap 返回 false，
	* 于是"装了字体扩展但当前选区分不出值"会被读成"这个宿主没有这条命令"。
	*/
	function hasCommand(editor, name) {
		return typeof editor.commands[name] === "function";
	}
	function tiptapEditorHost(editor) {
		return {
			can(id) {
				const entry = BRIDGE[id];
				if (!entry) return false;
				if (entry.value === true) return hasCommand(editor, entry.can);
				return call(editor.can(), entry.can, entry.arg);
			},
			state(id) {
				const entry = BRIDGE[id];
				if (!entry) return { enabled: false };
				const enabled = entry.value === true ? hasCommand(editor, entry.can) : call(editor.can(), entry.can, entry.arg);
				if (!entry.active) return { enabled };
				return {
					enabled,
					active: editor.isActive(entry.active)
				};
			},
			exec(id, arg) {
				const entry = BRIDGE[id];
				if (!entry) return false;
				const actual = arg === void 0 ? entry.arg : entry.toArg === void 0 ? arg : entry.toArg(arg);
				return call(editor.commands, entry.run, actual);
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
	//#region src/shell/alignment.ts
	var HORIZONTAL_ALIGNS = [
		"left",
		"center",
		"right",
		"justify"
	];
	var VERTICAL_ALIGNS = [
		"top",
		"middle",
		"bottom"
	];
	/** 默认值：左对齐 + 顶端对齐，与 Office 新建文档一致。 */
	var DEFAULT_ALIGNMENT = {
		horizontal: "left",
		vertical: "top"
	};
	function isHorizontal(value) {
		return typeof value === "string" && HORIZONTAL_ALIGNS.includes(value);
	}
	function isVertical(value) {
		return typeof value === "string" && VERTICAL_ALIGNS.includes(value);
	}
	function isAlignmentValue(value) {
		if (typeof value !== "object" || value === null) return false;
		const candidate = value;
		return isHorizontal(candidate.horizontal) && isVertical(candidate.vertical);
	}
	/**
	* 归一化：任一方向不合法就回退到默认值，而不是保留半边。
	* 半边合法会让界面出现"水平高亮在右、垂直一个都没高亮"的状态。
	*/
	function normalizeAlignment(value) {
		if (value === void 0) return DEFAULT_ALIGNMENT;
		return {
			horizontal: isHorizontal(value.horizontal) ? value.horizontal : DEFAULT_ALIGNMENT.horizontal,
			vertical: isVertical(value.vertical) ? value.vertical : DEFAULT_ALIGNMENT.vertical
		};
	}
	/** 在水平方向循环（方向键左右用）。两端不环绕：环绕会让"按到底"变成"回到另一头"。 */
	function stepHorizontal(value, direction) {
		const next = HORIZONTAL_ALIGNS[HORIZONTAL_ALIGNS.indexOf(value) + direction];
		return next !== null && next !== void 0 ? next : value;
	}
	function stepVertical(value, direction) {
		const next = VERTICAL_ALIGNS[VERTICAL_ALIGNS.indexOf(value) + direction];
		return next !== null && next !== void 0 ? next : value;
	}
	/** 预览用的 CSS `text-align`。`justify` 原样透出，浏览器认它。 */
	function textAlignCss(horizontal) {
		return horizontal === "justify" ? "justify" : horizontal;
	}
	/** 预览用的 CSS `vertical-align`：`middle` 在表格单元格里要写成 `middle`，不是 `center`。 */
	function verticalAlignCss(vertical) {
		return vertical === "middle" ? "middle" : vertical;
	}
	//#endregion
	//#region src/shell/color.ts
	/**
	* 默认色板：品牌十阶 + 一组中性色。
	*
	* 只取 3~9 阶：1/2 阶在白底上几乎看不见，10 阶是深色文字色，
	* 做"填充色"都会让用户以为没生效。
	*/
	var COLOR_SWATCH_GROUPS = [{
		id: "brand",
		values: [
			"var(--oj-brand-3)",
			"var(--oj-brand-4)",
			"var(--oj-brand-5)",
			"var(--oj-brand-6)",
			"var(--oj-brand-7)",
			"var(--oj-brand-8)",
			"var(--oj-brand-9)"
		]
	}, {
		id: "neutral",
		values: [
			"#000000",
			"#404040",
			"#808080",
			"#bfbfbf",
			"#e5e6eb",
			"#ffffff",
			"transparent"
		]
	}];
	var HEX = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;
	/**
	* 归一化十六进制颜色。返回 `#rrggbb`（小写）或 `undefined`。
	* 带 alpha 的 8 位写法（`#rrggbbaa`）刻意不收：文档格式里 alpha 是独立属性，
	* 混进颜色值会让"透明度"出现两种来源。
	*/
	function normalizeHex(input) {
		const match = HEX.exec(input.trim());
		if (match === null) return void 0;
		const body = match[1].toLowerCase();
		if (body.length === 3) return `#${body[0]}${body[0]}${body[1]}${body[1]}${body[2]}${body[2]}`;
		return `#${body}`;
	}
	/** 是否是一个组件能渲染的颜色值：token 引用、十六进制、`transparent`、`rgb()/hsl()`。 */
	function isCssColor(value) {
		const trimmed = value.trim();
		if (trimmed.length === 0) return false;
		if (trimmed === "transparent" || trimmed === "currentColor") return true;
		if (normalizeHex(trimmed) !== void 0) return true;
		if (/^var\(--oj-[a-z0-9-]+\)$/.test(trimmed)) return true;
		return /^(?:rgb|hsl)a?\([^()]*\)$/.test(trimmed);
	}
	/**
	* 色板里"最近的颜色"——给键盘左右移动用（不是给取色用）。
	* 只在 `values` 里找，找不到返回 `undefined`（调用方保留当前值）。
	*/
	function neighborSwatch(values, current, direction) {
		if (values.length === 0) return void 0;
		const index = values.indexOf(current);
		if (index === -1) return values[0];
		const next = index + direction;
		if (next < 0 || next >= values.length) return void 0;
		return values[next];
	}
	//#endregion
	//#region src/shell/border.ts
	/**
	* 边框模型（03 §3 / M2 `OjBorderPicker`）。
	*
	* 三个维度（线型 / 线宽 / 颜色）必须一起归一，否则会出现"选了无边框，但颜色还高亮着"的界面：
	* `none` 时宽度与颜色在语义上不存在，归一化后要显式表达这一点（`width: 0`）。
	*
	* 线宽是 **px 数值**而不是枚举字符串：文档格式存的是数值，组件只是提供几个常用档位。
	*/
	var BORDER_STYLES = [
		"none",
		"solid",
		"dashed",
		"dotted",
		"double"
	];
	/** Word 的常用线宽档（pt 换算后的近似值），含 0.5 这种细线。 */
	var BORDER_WIDTHS = [
		.5,
		.75,
		1,
		1.5,
		2,
		3
	];
	var BORDER_COLORS = [
		"var(--oj-text-1)",
		"var(--oj-text-3)",
		"var(--oj-border-3)",
		"var(--oj-brand-6)",
		"var(--oj-text-danger)"
	];
	var DEFAULT_BORDER = {
		style: "solid",
		width: 1,
		color: "var(--oj-text-1)"
	};
	var BORDER_WIDTH_RANGE = {
		min: 0,
		max: 12
	};
	function isStyle(value) {
		return typeof value === "string" && BORDER_STYLES.includes(value);
	}
	/**
	* 归一化三个维度。
	*
	* 规则：
	*   - `style: 'none'` 时宽度归 0（语义上"没有线"，留着 1px 会让下游导出工具画出细线）；
	*   - 宽度夹进 `[0, 12]` 并保留两位小数（0.75 这类值是合法档位）；
	*   - 颜色不合法就回退默认色，而不是保留一个渲染不出来的字符串。
	*/
	function normalizeBorder(value) {
		const style = isStyle(value === null || value === void 0 ? void 0 : value.style) ? value.style : DEFAULT_BORDER.style;
		const rawWidth = typeof (value === null || value === void 0 ? void 0 : value.width) === "number" && Number.isFinite(value.width) ? value.width : DEFAULT_BORDER.width;
		const clamped = Math.min(Math.max(rawWidth, BORDER_WIDTH_RANGE.min), BORDER_WIDTH_RANGE.max);
		const color = typeof (value === null || value === void 0 ? void 0 : value.color) === "string" && isCssColor(value.color) ? value.color : DEFAULT_BORDER.color;
		if (style === "none") return {
			style,
			width: 0,
			color
		};
		return {
			style,
			width: Number(clamped.toFixed(2)),
			color
		};
	}
	/**
	* 生成 CSS 值，供预览块与"应用到选区"两条路共用（两套字符串迟早会不一致）。
	* 入参收 `Partial`：预览时经常只想换一个维度（`{ ...current, style: 'none' }`），
	* 内部统一走 `normalizeBorder`，调用方不必先自己补齐三个字段。
	*/
	function borderCss(value) {
		const normalized = normalizeBorder(value);
		if (normalized.style === "none") return "none";
		return `${normalized.width}px ${normalized.style} ${normalized.color}`;
	}
	/** 线宽档位文案：`1` 而不是 `1.00`。 */
	function formatBorderWidth(width) {
		return String(Number(width.toFixed(2)));
	}
	//#endregion
	//#region src/shell/presets.ts
	/**
	* 档位表与"最近档位"（03 §3 `OjFontSizeField` / `OjLineSpacingPicker`）。
	*
	* 字号档位**必须与 token 一致**：`--oj-fs-12`~`--oj-fs-32` 那八档就是设计给的可用值，
	* 组件里再自造一套（比如加上 15px）会让"用户选的 15px"在 `ja` 档位下没有对应 token，
	* 于是又变成一次写死。这里把档位写成常量，并由用例与 token 表对账。
	*
	* 行距用**倍数**而不是 px：Word/WPS 的行距单位是"多倍行距"，存 px 会随字号变化而失真。
	*/
	/** 与 `packages/tokens` 的 `fs.*` 一一对应（顺序即下拉里的顺序）。 */
	var FONT_SIZE_PRESETS = [
		12,
		13,
		14,
		16,
		18,
		20,
		24,
		32
	];
	/** Word 的常用档位：单倍、1.15、1.5、双倍。 */
	var LINE_SPACING_PRESETS = [
		1,
		1.15,
		1.5,
		2
	];
	/** 字号上下限：低于 1px 或高于 999px 的输入是误操作，不是需求。 */
	var FONT_SIZE_RANGE = {
		min: 1,
		max: 999
	};
	/** 行距上下限：0 会让行叠在一起，10 倍以上没有排版意义。 */
	var LINE_SPACING_RANGE = {
		min: .5,
		max: 10
	};
	/** 离 `value` 最近的档位。空表返回 `value` 本身（调用方没给档位就不该被改值）。 */
	function nearestPreset(presets, value) {
		if (presets.length === 0 || !Number.isFinite(value)) return value;
		let best = presets[0];
		let bestGap = Math.abs(best - value);
		for (const preset of presets) {
			const gap = Math.abs(preset - value);
			if (gap < bestGap) {
				best = preset;
				bestGap = gap;
			}
		}
		return best;
	}
	/**
	* 在档位表里前进/后退一档。
	*
	* 当前值不在表里时（用户手输过 17px），先落到**最近的档位**再走一步：
	* 直接 `indexOf` 得到 -1 会让"下箭头"跳到第一档，用户会觉得方向反了。
	*/
	function stepPreset(presets, value, direction) {
		var _sorted$index;
		if (presets.length === 0) return value;
		const sorted = [...presets].sort((a, b) => a - b);
		const exact = sorted.indexOf(value);
		if (exact !== -1) {
			const next = sorted[exact + direction];
			return next !== null && next !== void 0 ? next : value;
		}
		const nearest = nearestPreset(sorted, value);
		if (nearest === value) return value;
		const nearestIndex = sorted.indexOf(nearest);
		return (_sorted$index = sorted[(direction === 1 ? nearest < value : nearest > value) ? nearestIndex + direction : nearestIndex]) !== null && _sorted$index !== void 0 ? _sorted$index : nearest;
	}
	/** 行距显示成 `1.5` / `1` / `1.15`：去掉无意义的尾零，但不把 1.50 显示成 1.5 以外的东西。 */
	function formatLineSpacing(value) {
		if (!Number.isFinite(value)) return "1";
		const rounded = Number(value.toFixed(2));
		return String(rounded);
	}
	/** 字号显示成 `14`（单位由使用方在其后补，语言不同单位写法也不同）。 */
	function formatFontSize(value) {
		if (!Number.isFinite(value)) return "";
		return String(Number(value.toFixed(1)));
	}
	//#endregion
	//#region src/format.ts
	/** 字体 id（如 `sans` / `doc`）。只校验"非空字符串"：自定义字体名也是合法值。 */
	function fontFamilyArg(arg) {
		if (typeof arg !== "string") throw new Error("format.fontFamily 需要字体 id 字符串");
		const id = arg.trim();
		if (id.length === 0) throw new Error("format.fontFamily 需要非空的字体 id");
		return id;
	}
	/** 字号：与 `OjFontSizeField` 同一区间（1–999），保留一位小数。 */
	function fontSizeArg(arg) {
		if (typeof arg !== "number" || !Number.isFinite(arg)) throw new Error("format.fontSize 需要数字");
		if (arg < FONT_SIZE_RANGE.min || arg > FONT_SIZE_RANGE.max) throw new Error(`format.fontSize 超出 ${FONT_SIZE_RANGE.min}–${FONT_SIZE_RANGE.max}`);
		return Number(formatFontSize(arg));
	}
	/**
	* 文字颜色：`isCssColor` 认的四种写法（token 引用 / 十六进制 / `transparent` / `rgb()`）。
	* 存 token 引用而不是解析成十六进制，是 `shell/color.ts` 的既有决策：主题切换要跟着变。
	*/
	function textColorArg(arg) {
		if (typeof arg !== "string") throw new Error("format.textColor 需要颜色字符串");
		const value = arg.trim();
		if (!isCssColor(value)) throw new Error(`format.textColor 不认识这个颜色：${value}`);
		return value;
	}
	/**
	* 边框：收 `BorderValue`（可部分给出）或字符串 `'none'`，**输出 CSS 简写**。
	*
	* 输出与预览块共用 `borderCss()`，所以"预览里看到的线"与"应用到选区上的线"永远是同一串字符。
	* `'none'` 单独收，是因为 `OjBorderPicker` 的"无边框"按钮在语义上不是"宽 0 的实线"。
	*/
	function borderArg(arg) {
		if (arg === "none") return "none";
		if (typeof arg !== "object" || arg === null) throw new Error("format.border 需要 BorderValue 或 \"none\"");
		return borderCss(arg);
	}
	/** 行距：倍数（`1` / `1.15` / `1.5` / `2`），区间与 `OjLineSpacingPicker` 一致。 */
	function lineSpacingArg(arg) {
		if (typeof arg !== "number" || !Number.isFinite(arg)) throw new Error("format.lineSpacing 需要数字");
		if (arg < LINE_SPACING_RANGE.min || arg > LINE_SPACING_RANGE.max) throw new Error(`format.lineSpacing 超出 ${LINE_SPACING_RANGE.min}–${LINE_SPACING_RANGE.max}`);
		return Number(formatLineSpacing(arg));
	}
	/**
	* 对齐：收 `AlignmentValue`，编码成 `"center middle"`。
	*
	* 两个方向**一起**传，而不是拆成两条命令：Office 的"两端对齐 + 垂直居中"是一次操作，
	* 拆开会让一次点击产生两条撤销记录，而用户按一次 Ctrl+Z 只期望退回一步。
	*/
	function alignArg(arg) {
		if (!isAlignmentValue(arg)) throw new Error("format.align 需要 { horizontal, vertical }");
		return `${textAlignCss(arg.horizontal)} ${verticalAlignCss(arg.vertical)}`;
	}
	/** `alignArg` 的逆运算。不认识的值返回 `undefined`（调用方保留当前对齐，不要猜）。 */
	function parseAlignValue(value) {
		if (typeof value !== "string") return void 0;
		const [horizontal, vertical] = value.trim().split(/\s+/);
		if (vertical === void 0) return void 0;
		const candidate = {
			horizontal,
			vertical
		};
		return isAlignmentValue(candidate) ? candidate : void 0;
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
	/**
	* 值型格式命令（M2 选择器集群的出口）。
	*
	* 与上面几条**布尔**命令的区别不是"有没有参数"，而是 `state()` 里报什么：
	* 布尔命令报 `active`，值型命令报 `value`。控件（字号框、色板、边框面板）读 `value` 决定高亮，
	* 读 `active` 会把"字号 16"读成"被选中"，于是控件自己也不知道该显示什么。
	*/
	var COMMAND_FONT_FAMILY = "format.fontFamily";
	var COMMAND_FONT_SIZE = "format.fontSize";
	var COMMAND_TEXT_COLOR = "format.textColor";
	var COMMAND_BORDER = "format.border";
	var COMMAND_LINE_SPACING = "format.lineSpacing";
	var COMMAND_ALIGN = "format.align";
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
	/**
	* 值型命令：`run` 先把实参归一化，再把**归一化后的原始值**交给宿主。
	*
	* 传原始值而不是结构体，是为了让 `state().value` 能原样读回来（见 `format.ts` 的不变式）。
	* 归一化放在 `run` 里而不是 `state` 里：只有真正执行时才知道实参合不合法，
	* 而 `state()` 每帧都可能被调，不该带抛错的可能。
	*/
	function valueCommand(id, labelKey, normalize) {
		return {
			id,
			label: { key: labelKey },
			group: "开始",
			history: "undoable",
			state: (host) => host.state(id),
			run: (host, arg) => {
				host.exec(id, normalize(arg));
			}
		};
	}
	function editorCommands() {
		return [
			toggleCommand(COMMAND_BOLD, "oj.command.bold", "oj-format-bold", "mod+b"),
			toggleCommand(COMMAND_ITALIC, "oj.command.italic", "oj-format-italic", "mod+i"),
			toggleCommand(COMMAND_UNDERLINE, "oj.command.underline", "oj-format-underline", "mod+u"),
			valueCommand(COMMAND_FONT_FAMILY, "oj.command.fontFamily", fontFamilyArg),
			valueCommand(COMMAND_FONT_SIZE, "oj.command.fontSize", fontSizeArg),
			valueCommand(COMMAND_TEXT_COLOR, "oj.command.textColor", textColorArg),
			valueCommand(COMMAND_BORDER, "oj.command.border", borderArg),
			valueCommand(COMMAND_LINE_SPACING, "oj.command.lineSpacing", lineSpacingArg),
			valueCommand(COMMAND_ALIGN, "oj.command.align", alignArg),
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
	//#region src/shell/style-gallery.ts
	var STYLE_PRESETS = [
		{
			id: "title-1",
			fontSize: 32,
			bold: true
		},
		{
			id: "title-2",
			fontSize: 24,
			bold: true
		},
		{
			id: "title-3",
			fontSize: 20,
			bold: true
		},
		{
			id: "body",
			fontSize: 14
		},
		{
			id: "quote",
			fontSize: 14,
			italic: true,
			family: "doc"
		},
		{
			id: "code",
			fontSize: 14,
			family: "mono"
		}
	];
	/** 预览与"应用样式"共用的一份内联样式，避免两处各写一套。 */
	function stylePresetCss(preset) {
		var _preset$family;
		const css = { fontSize: `${preset.fontSize}px` };
		if (preset.bold === true) css.fontWeight = "600";
		if (preset.italic === true) css.fontStyle = "italic";
		css.fontFamily = `var(--oj-font-${(_preset$family = preset.family) !== null && _preset$family !== void 0 ? _preset$family : "sans"})`;
		return css;
	}
	/**
	* 显示名缺省时回退到 id。
	* 不在这里编中文名：`title-1` 在日文界面应该是"見出し1"，写死中文就永远翻不掉。
	*/
	function styleLabel(labels, id) {
		var _labels$id;
		return (_labels$id = labels === null || labels === void 0 ? void 0 : labels[id]) !== null && _labels$id !== void 0 ? _labels$id : id;
	}
	//#endregion
	//#region src/shell/fonts.ts
	var FONT_OPTIONS = [
		{
			id: "sans",
			label: "Sans",
			stack: "var(--oj-font-sans)"
		},
		{
			id: "mono",
			label: "Mono",
			stack: "var(--oj-font-mono)"
		},
		{
			id: "mono-cjk",
			label: "Mono CJK",
			stack: "var(--oj-font-mono-cjk)"
		},
		{
			id: "doc",
			label: "Serif",
			stack: "var(--oj-font-doc)"
		}
	];
	/** 按 id 或显示名做子串过滤（忽略大小写与首尾空白）。空查询返回全部。 */
	function filterFonts(fonts, query) {
		const needle = query.trim().toLowerCase();
		if (needle.length === 0) return [...fonts];
		return fonts.filter((font) => font.id.toLowerCase().includes(needle) || font.label.toLowerCase().includes(needle));
	}
	/** 从字体表里找一项；找不到返回 `undefined`（调用方据此决定要不要回退）。 */
	function findFont(fonts, id) {
		return fonts.find((font) => font.id === id);
	}
	/** 键盘上下移动：到两端就停住，不环绕（环绕会让用户在列表底部误以为是顶部）。 */
	function stepFont(fonts, id, direction) {
		var _next$id;
		if (fonts.length === 0) return id;
		const index = fonts.findIndex((font) => font.id === id);
		if (index === -1) return fonts[0].id;
		const next = fonts[index + direction];
		return (_next$id = next === null || next === void 0 ? void 0 : next.id) !== null && _next$id !== void 0 ? _next$id : id;
	}
	//#endregion
	//#region src/shell/symbols.ts
	var SYMBOL_GROUPS = [
		{
			id: "common",
			symbols: [
				{
					char: "©",
					name: "copyright"
				},
				{
					char: "®",
					name: "registered"
				},
				{
					char: "™",
					name: "trademark"
				},
				{
					char: "§",
					name: "section"
				},
				{
					char: "¶",
					name: "paragraph"
				},
				{
					char: "°",
					name: "degree"
				},
				{
					char: "‰",
					name: "per mille"
				},
				{
					char: "№",
					name: "numero"
				}
			]
		},
		{
			id: "math",
			symbols: [
				{
					char: "±",
					name: "plus minus"
				},
				{
					char: "×",
					name: "multiply"
				},
				{
					char: "÷",
					name: "divide"
				},
				{
					char: "≠",
					name: "not equal"
				},
				{
					char: "≤",
					name: "less or equal"
				},
				{
					char: "≥",
					name: "greater or equal"
				},
				{
					char: "∞",
					name: "infinity"
				},
				{
					char: "∑",
					name: "sum"
				},
				{
					char: "√",
					name: "square root"
				},
				{
					char: "π",
					name: "pi"
				},
				{
					char: "≈",
					name: "almost equal"
				},
				{
					char: "µ",
					name: "micro"
				}
			]
		},
		{
			id: "arrow",
			symbols: [
				{
					char: "←",
					name: "left arrow"
				},
				{
					char: "→",
					name: "right arrow"
				},
				{
					char: "↑",
					name: "up arrow"
				},
				{
					char: "↓",
					name: "down arrow"
				},
				{
					char: "↔",
					name: "left right arrow"
				},
				{
					char: "⇄",
					name: "swap arrows"
				},
				{
					char: "⇧",
					name: "shift arrow"
				},
				{
					char: "⇒",
					name: "double right arrow"
				}
			]
		},
		{
			id: "currency",
			symbols: [
				{
					char: "$",
					name: "dollar"
				},
				{
					char: "€",
					name: "euro"
				},
				{
					char: "£",
					name: "pound"
				},
				{
					char: "¥",
					name: "yen"
				},
				{
					char: "₩",
					name: "won"
				},
				{
					char: "₹",
					name: "rupee"
				},
				{
					char: "¢",
					name: "cent"
				}
			]
		},
		{
			id: "punctuation",
			symbols: [
				{
					char: "—",
					name: "em dash"
				},
				{
					char: "–",
					name: "en dash"
				},
				{
					char: "…",
					name: "ellipsis"
				},
				{
					char: "·",
					name: "middle dot"
				},
				{
					char: "“",
					name: "left double quote"
				},
				{
					char: "”",
					name: "right double quote"
				},
				{
					char: "‘",
					name: "left single quote"
				},
				{
					char: "’",
					name: "right single quote"
				}
			]
		}
	];
	/**
	* 按名字过滤。空查询返回原表（保持分组结构，调用方据此渲染标题）。
	* 同时接受直接输入字符：用户已经知道要插哪个符号时，比记名字快。
	*/
	function filterSymbols(groups, query) {
		const needle = query.trim().toLowerCase();
		if (needle.length === 0) return [...groups];
		return groups.map((group) => ({
			id: group.id,
			symbols: group.symbols.filter((symbol) => symbol.char === needle || symbol.name.toLowerCase().includes(needle))
		})).filter((group) => group.symbols.length > 0);
	}
	/** 摊平成一维（键盘导航按下标走，分组只是视觉）。 */
	function flattenSymbols(groups) {
		return groups.flatMap((group) => [...group.symbols]);
	}
	//#endregion
	//#region src/shell/number-field.ts
	function normalizeStep(step) {
		if (step === void 0 || !Number.isFinite(step) || step <= 0) return 1;
		return step;
	}
	function normalizePrecision(precision) {
		if (precision === void 0 || !Number.isFinite(precision) || precision <= 0) return 0;
		return Math.min(Math.floor(precision), 6);
	}
	/** 按精度取整。用 `Number(x.toFixed(n))` 而不是 `Math.round(x * 10^n) / 10^n`，后者有浮点尾数。 */
	function roundTo(value, precision) {
		const digits = normalizePrecision(precision);
		if (!Number.isFinite(value)) return 0;
		return Number(value.toFixed(digits));
	}
	/**
	* 夹进 `[min, max]`。`min > max`（配置写反）时**以 min 为准**：
	* 宁可显示下限，也不要把 `NaN` 或越界值写回使用方的状态。
	*/
	function clampNumber(value, bounds = {}) {
		const rounded = roundTo(value, bounds.precision);
		const { min, max } = bounds;
		if (min !== void 0 && Number.isFinite(min) && rounded < min) return roundTo(min, bounds.precision);
		if (max !== void 0 && Number.isFinite(max) && rounded > max) return roundTo(max, bounds.precision);
		return rounded;
	}
	/**
	* 步进一次并夹取。
	*
	* 从上限往下减时先减到上限再减 step：值本来就在界外（使用方传了脏数据）时，
	* 用户点一下减号应该**立刻回到合法区间**，而不是在界外一格一格挪。
	*/
	function stepNumber(value, direction, bounds = {}) {
		return clampNumber(roundTo(clampNumber(value, bounds) + direction * normalizeStep(bounds.step), bounds.precision), bounds);
	}
	/**
	* 解析用户输入。返回 `undefined` 表示"不提交，回退到当前值"。
	*
	* 认这些：`12`、` 12 `、`12px`（单位由调用方决定，这里只取数字）、`-3`、`+3`、`1.5`、`1,5`（欧洲键盘）。
	* 不认：空串、`-`、`12abc`、`1e3`（指数写法在字号/行距里没有意义，放进来只会让人误以为支持）。
	*/
	function parseNumberDraft(text) {
		const trimmed = text.trim().replace(",", ".");
		if (trimmed.length === 0) return void 0;
		const match = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:px|pt|%|em|rem|cm|mm|in)?$/i.exec(trimmed);
		if (match === null) return void 0;
		const numeric = match[0].replace(/[a-z%]+$/i, "");
		const value = Number(numeric);
		return Number.isFinite(value) ? value : void 0;
	}
	//#endregion
	//#region src/shell/people.ts
	/**
	* 头像色板档数：4 档（品牌 / 成功 / 警告 / 危险四组"浅底 + 同色字"）。
	*
	* 不按色阶（`--oj-brand-3..9`）取 8 档：色阶在暗色主题里是**反向**的
	* （浅色下 brand-3 是浅蓝、暗色下 brand-3 是深蓝），"浅底 + 深字"的配对会整体翻转，
	* 于是同一套规则在暗色下变成"深底 + 深字"。用语义色（`--oj-bg-*-subtle` / `--oj-text-*`）
	* 让主题自己保证对比度，代价是只有 4 档——4 档足够区分同桌的几个人。
	*/
	var AVATAR_TONES = 4;
	/**
	* 头像上的首字母。
	*
	* 拉丁名取首尾两词首字母（`Ada Lovelace` → `AL`），单字取首字符，中日韩整名取**首字**——
	* 取末字会让"张伟 / 王伟"这类名字在头像上撞成同一个字。
	*
	* 中日韩名字中间带空格（`王 伟`）时仍只取一个字：这类空格是排版习惯，不是"两个词"，
	* 取两个字符在圆形头像里会挤成一团。
	*
	* 用 `[...name]` 而不是 `name[0]`：emoji 与部分 CJK 扩展字是代理对，按 UTF-16 切会切出半个字符。
	*/
	var CJK = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uac00-\ud7af]/;
	function initialsOf(name) {
		var _, _2;
		const parts = name.trim().split(/\s+/).filter((part) => part.length > 0);
		if (parts.length === 0) return "";
		const first = (_ = [...parts[0]][0]) !== null && _ !== void 0 ? _ : "";
		if (parts.length === 1 || CJK.test(first)) return first.toUpperCase();
		return (first + ((_2 = [...parts[parts.length - 1]][0]) !== null && _2 !== void 0 ? _2 : "")).toUpperCase();
	}
	/**
	* 色板序号：稳定哈希，同一 `id` 永远同一档。
	*
	* 不用 `charCodeAt(0)` 取模：`user-1`/`user-2`… 这类 id 的首字符全一样，会全部撞到同一档；
	* djb2 变体对"前缀相同、尾号不同"的 id 分布足够散。
	*/
	function avatarTone(person) {
		if (person.tone !== void 0 && Number.isInteger(person.tone)) return (person.tone % 4 + 4) % 4;
		let hash = 5381;
		for (let index = 0; index < person.id.length; index += 1) hash = (hash << 5) + hash + person.id.charCodeAt(index) >>> 0;
		return hash % 4;
	}
	/**
	* 头像堆叠：超过 `max` 个就折叠，**折叠数不含"更多"按钮自身**（按钮显示 `overflow` 个人）。
	*
	* `max` 为 0 时返回空 + 全折叠：调用方据此在窄侧栏里把整组隐藏掉，而不是渲染一个 `+5` 再也没地方展开。
	* `max` 非整数或负数按 0 处理——`max` 常常来自"容器宽度算出来的档数"，算错时应该什么都不画，而不是画非整数个。
	*/
	function stackPeople(people, max) {
		const limit = Number.isFinite(max) && max > 0 ? Math.floor(max) : 0;
		if (limit === 0) return {
			visible: [],
			overflow: people.length
		};
		if (people.length <= limit) return {
			visible: [...people],
			overflow: 0
		};
		const shown = Math.max(limit - 1, 0);
		return {
			visible: people.slice(0, shown),
			overflow: people.length - shown
		};
	}
	//#endregion
	//#region src/shell/comments.ts
	/**
	* 追加回复。**不改变解决状态**：已解决的线程收到回复仍是已解决，
	* 想重开得显式点"重新打开"——反过来（自动重开）会让"我回复一句确认"变成一次状态回退。
	*
	* 空文本直接返回原对象（引用不变）：上游 `watch` 不会因为一次空提交重渲染。
	*/
	function addReply(thread, reply) {
		if (reply.text.trim().length === 0) return thread;
		return {
			...thread,
			replies: [...thread.replies, reply]
		};
	}
	/** 切换解决状态。传 `resolved` 而不是"翻转"，因为协同下两次点击可能基于同一个旧状态。 */
	function setResolved(thread, resolved) {
		if (thread.resolved === resolved) return thread;
		return {
			...thread,
			resolved
		};
	}
	function commentCounts(threads) {
		let open = 0;
		let replies = 0;
		for (const thread of threads) {
			if (!thread.resolved) open += 1;
			replies += thread.replies.length;
		}
		return {
			total: threads.length,
			open,
			resolved: threads.length - open,
			replies
		};
	}
	/** 侧栏筛选。不认识的取值按 `all` 处理：筛选器是 UI 状态，不该因为一个脏值让列表整个空掉。 */
	function filterThreads(threads, filter) {
		if (filter === "open") return threads.filter((thread) => !thread.resolved);
		if (filter === "resolved") return threads.filter((thread) => thread.resolved);
		return [...threads];
	}
	/**
	* 下一条未解决批注的 id（侧栏"下一个批注"按钮用）。
	*
	* 到末尾**不环绕**：环绕会让"已看完最后一条"变成"跳回第一条"，用户不知道看完了。
	* 全部已解决时返回 `undefined`，让按钮自己灰掉。
	*/
	function nextOpenThread(threads, currentId, direction = 1) {
		var _open$, _open, _open2;
		const open = threads.filter((thread) => !thread.resolved);
		if (open.length === 0) return void 0;
		const index = open.findIndex((thread) => thread.id === currentId);
		if (index === -1) return direction === 1 ? (_open$ = open[0]) === null || _open$ === void 0 ? void 0 : _open$.id : (_open = open[open.length - 1]) === null || _open === void 0 ? void 0 : _open.id;
		return (_open2 = open[index + direction]) === null || _open2 === void 0 ? void 0 : _open2.id;
	}
	//#endregion
	//#region src/shell/review.ts
	var REVIEW_KINDS = [
		"insert",
		"delete",
		"format"
	];
	function match(change, filter) {
		var _filter$kind, _filter$authorId;
		const kind = (_filter$kind = filter.kind) !== null && _filter$kind !== void 0 ? _filter$kind : "all";
		const authorId = (_filter$authorId = filter.authorId) !== null && _filter$authorId !== void 0 ? _filter$authorId : "all";
		if (kind !== "all" && change.kind !== kind) return false;
		if (authorId !== "all" && change.author.id !== authorId) return false;
		return true;
	}
	/** 按种类/作者筛选，保持原有顺序（顺序即文档位置，重排会让"下一个修订"跳着走）。 */
	function filterChanges(changes, filter) {
		return changes.filter((change) => match(change, filter));
	}
	/** 移除一条已决策的修订。找不到时返回原对象（引用不变，避免无意义重渲染）。 */
	function decideChange(changes, id) {
		const index = changes.findIndex((change) => change.id === id);
		if (index === -1) return changes;
		return [...changes.slice(0, index), ...changes.slice(index + 1)];
	}
	/**
	* 批量决策：删除**当前筛选结果**里的全部修订。
	*
	* 语义按"当前所见"而不是"全部"：用户在"只看张三"的筛选下点"全部接受"，
	* 期望的是把张三的这几条处理掉；连别人的一起处理是数据事故。
	*/
	function decideAll(changes, filter) {
		return changes.filter((change) => !match(change, filter));
	}
	function reviewCounts(changes) {
		const counts = {
			total: changes.length,
			insert: 0,
			delete: 0,
			format: 0
		};
		for (const change of changes) counts[change.kind] += 1;
		return counts;
	}
	/** 列表里出现过的作者（按首次出现顺序），给筛选下拉用。 */
	function changeAuthors(changes) {
		const seen = /* @__PURE__ */ new Map();
		for (const change of changes) if (!seen.has(change.author.id)) seen.set(change.author.id, change.author);
		return [...seen.values()];
	}
	//#endregion
	//#region src/shell/file-name.ts
	/** Windows 保留字符（不含 `\0`，它在 JS 字符串里根本进不来）。 */
	var ILLEGAL = /[\\/:*?"<>|]/;
	/** Windows 保留设备名。大小写不敏感，且带扩展名也是保留的（`CON.txt` 同样建不出来）。 */
	var RESERVED = /* @__PURE__ */ new Set([
		"con",
		"prn",
		"aux",
		"nul",
		...Array.from({ length: 9 }, (_, index) => `com${index + 1}`),
		...Array.from({ length: 9 }, (_, index) => `lpt${index + 1}`)
	]);
	/**
	* 校验文件名。返回 `undefined` 表示可用。
	*
	* 首尾空白先裁掉再判空：`"  "` 是用户想清空名字的常见中间态，它必须报 `empty` 而不是"可用"。
	* `.` 与 `..` 归到 `reserved`：它们在所有平台上都不是合法文件名，但也不是"空"。
	*/
	function fileNameProblem(name) {
		var _trimmed$split$0$toLo, _trimmed$split$;
		const trimmed = name.trim();
		if (trimmed.length === 0) return "empty";
		if (trimmed === "." || trimmed === "..") return "reserved";
		if (ILLEGAL.test(trimmed)) return "illegal";
		const stem = (_trimmed$split$0$toLo = (_trimmed$split$ = trimmed.split(".")[0]) === null || _trimmed$split$ === void 0 ? void 0 : _trimmed$split$.toLowerCase()) !== null && _trimmed$split$0$toLo !== void 0 ? _trimmed$split$0$toLo : "";
		if (RESERVED.has(stem)) return "reserved";
	}
	/**
	* 重命名结果。**与原值相同视为成功且返回原名**（不是"没变化所以失败"）：
	* 用户回车确认一个没改的名字，界面应该退出编辑态，而不是弹错误。
	*/
	function renameFile(current, next) {
		const trimmed = next.trim();
		if (trimmed === current) return {
			ok: true,
			name: current
		};
		const problem = fileNameProblem(trimmed);
		if (problem !== void 0) return {
			ok: false,
			problem
		};
		return {
			ok: true,
			name: trimmed
		};
	}
	/**
	* 保存态是否处于"还没落盘"的状态。
	*
	* 标题栏要据此显示小圆点/星号，而 `saving` 也算未落盘：显示成"已保存"再改回来，
	* 用户会看到状态闪两下，误以为保存失败了两次。
	*/
	function isDirty(state) {
		return state !== "saved";
	}
	//#endregion
	//#region src/shell/splitter.ts
	/** 键盘一次步进（px）。与 `--oj-space-4` 同量级，不是随手写的数。 */
	var SPLITTER_STEP = 16;
	function finiteOr(value, fallback) {
		return value !== void 0 && Number.isFinite(value) ? value : fallback;
	}
	/**
	* 夹进 `[min, max]`；`collapsible` 时低于 `min / 2` 归 0。
	*
	* 折叠阈值取 `min / 2` 而不是 0 或 min：阈值等于 min 时"想拖窄一点"会被判成折叠，
	* 等于 0 时永远折叠不了（鼠标到 0 之前已经到 min）。一半是唯一能让两种意图都成立的界线。
	*
	* `max` 为 `Infinity`（或没给）表示**不设上限**，不能当成"缺省 = min"：
	* 那样"右侧批注栏最宽不限"会被夹成最小宽度，拖一下就弹回去，看起来像拖拽坏了。
	* `max` 小于 `min`（配置写反）时以 `min` 为准：宁可显示最小宽，也不要让栏宽变成 `NaN`。
	*/
	function clampPane(size, bounds) {
		const min = Math.max(0, finiteOr(bounds.min, 0));
		const limit = finiteOr(bounds.max, Number.POSITIVE_INFINITY);
		const max = Number.isFinite(limit) ? Math.max(min, limit) : Number.POSITIVE_INFINITY;
		const value = finiteOr(size, min);
		if (bounds.collapsible === true && value < min / 2) return 0;
		return Math.min(Math.max(value, min), max);
	}
	/**
	* 拖拽中的新尺寸。`delta` 是"这一栏要变宽多少"（向右拖左侧栏变大即正）。
	* 已经折叠（0）的栏在拖拽中不自动展开：展开走键盘或拖回 `min` 以上，避免手抖一下就弹回来。
	*/
	function resizePane(start, delta, bounds) {
		const current = finiteOr(start, bounds.min);
		if (current === 0) return 0;
		return clampPane(current + finiteOr(delta, 0), bounds);
	}
	/**
	* 键盘步进。折叠态下按"变大"直接回到 `min`（否则 `0 + 16` 会停在折叠区里出不来）。
	*
	* 反向的边界单独处理：已经在 `min` 上再按"变小"必须折叠到 0。走 `clampPane` 的话
	* `min - 16` 大于 `min / 2`，会被夹回 `min`——键盘就**永远收不起侧栏**，
	* 而拖拽能收，于是同一个组件的两条输入路径行为不一致。
	*/
	function stepPane(size, direction, bounds, step = 16) {
		const min = Math.max(0, finiteOr(bounds.min, 0));
		const current = finiteOr(size, min);
		const amount = Math.abs(finiteOr(step, 16)) || 16;
		if (current === 0) return direction === 1 ? clampPane(min, bounds) : 0;
		const next = current + direction * amount;
		if (direction === -1 && bounds.collapsible === true && next <= min) return 0;
		return clampPane(next, bounds);
	}
	/** 折叠/展开切换。不可折叠时返回原尺寸——按钮仍可在，但点了没反应比"变成 0 就回不来"好。 */
	function togglePane(size, bounds) {
		if (bounds.collapsible !== true) return clampPane(size, bounds);
		return finiteOr(size, bounds.min) === 0 ? clampPane(bounds.min, bounds) : 0;
	}
	/**
	* 第 `index` 栏左侧那根分隔条归谁管。`index` 是"后一栏"的下标，所以从 1 开始。
	*
	* 规则：**总是调固定宽的那一栏**。可伸缩栏的尺寸是"剩下的空间"，没有独立数值可拖，
	* 让它当被调对象只会出现"拖动后跳回原处"。两侧都固定时才调后一栏（与 `OjSplitter` 的默认一致）。
	* 两侧都 `flexible` 时返回 `undefined`：它们按比例分空间，拖谁都表达不成单个尺寸。
	*/
	function paneSplitter(panes, index) {
		if (index <= 0 || index >= panes.length) return void 0;
		const before = panes[index - 1];
		const after = panes[index];
		if (before === void 0 || after === void 0) return void 0;
		if (before.flexible === true && after.flexible === true) return void 0;
		const controlledIsBefore = after.flexible === true;
		const controlled = controlledIsBefore ? before : after;
		if (controlled.resizable === false) return void 0;
		return {
			controlled: controlled.id,
			side: controlledIsBefore ? "before" : "after"
		};
	}
	//#endregion
	//#region src/shell/virtual.ts
	/** 非法尺寸一律当 0：`NaN` 混进前缀和会让整张表的偏移全部变成 `NaN`，且再也恢复不了。 */
	function positive(value, fallback) {
		if (value === void 0 || !Number.isFinite(value)) return Math.max(0, fallback);
		return Math.max(0, value);
	}
	function createMetrics(items, estimateSize) {
		const estimate = positive(estimateSize, 0);
		const ids = [];
		const sizes = [];
		const offsets = [0];
		for (const item of items) {
			ids.push(item.id);
			const size = positive(item.size, estimate);
			sizes.push(size);
			offsets.push(offsets[offsets.length - 1] + size);
		}
		return {
			ids,
			sizes,
			offsets,
			total: offsets[offsets.length - 1]
		};
	}
	/**
	* 量到真实高度后重建偏移。
	*
	* 只改 `index` 之后的偏移：前面的行与它们的滚动位置都不受影响，列表才不会在测量时抖动。
	* 尺寸没变时返回原对象——`ResizeObserver` 会在同一帧里反复回调，引用变化会引发无意义的重渲染。
	*/
	function measureItem(metrics, index, size) {
		const current = metrics.sizes[index];
		if (current === void 0) return metrics;
		const next = positive(size, current);
		if (next === current) return metrics;
		const delta = next - current;
		const sizes = metrics.sizes.slice();
		sizes[index] = next;
		const offsets = metrics.offsets.slice();
		for (let cursor = index + 1; cursor < offsets.length; cursor += 1) offsets[cursor] = offsets[cursor] + delta;
		return {
			ids: metrics.ids,
			sizes,
			offsets,
			total: metrics.total + delta
		};
	}
	/**
	* 某个滚动位置落在第几行。
	*
	* 返回的是"顶部已滚过的那一行"，不是"完全可见的第一行"——两者在滚到一半时不同，
	* 锚点与可视窗口用的都是前者。空列表返回 0，调用方靠 `ids.length` 判断空态。
	*/
	function indexAtOffset(metrics, offset) {
		const count = metrics.ids.length;
		if (count === 0) return 0;
		const value = Number.isFinite(offset) ? offset : 0;
		if (value <= 0) return 0;
		if (value >= metrics.total) return count - 1;
		let low = 0;
		let high = count - 1;
		while (low < high) {
			const middle = Math.ceil((low + high) / 2);
			if (metrics.offsets[middle] <= value) low = middle;
			else high = middle - 1;
		}
		return low;
	}
	/**
	* 需要渲染的窗口。
	*
	* `overscan` 是上下各多渲染的行数：滚动时先看到"白块"再蹦出内容，多半就是少了这一圈。
	* 高度为 0 的视口仍然返回至少一行（见文件头第 3 条），否则永远量不到真实高度。
	*/
	function visibleRange(metrics, scrollOffset, viewportSize, overscan = 0) {
		const count = metrics.ids.length;
		if (count === 0) return {
			start: 0,
			end: 0,
			padTop: 0,
			padBottom: 0
		};
		const offset = Math.max(0, Number.isFinite(scrollOffset) ? scrollOffset : 0);
		const viewport = Math.max(0, Number.isFinite(viewportSize) ? viewportSize : 0);
		const buffer = Math.max(0, Math.floor(Number.isFinite(overscan) ? overscan : 0));
		const start = Math.max(0, indexAtOffset(metrics, offset) - buffer);
		const end = Math.min(count, indexAtOffset(metrics, offset + viewport) + 1 + buffer);
		return {
			start,
			end: Math.max(start, end),
			padTop: metrics.offsets[start],
			padBottom: metrics.total - metrics.offsets[end]
		};
	}
	/** 滚动位置夹进合法范围：内容比视口还短时只能停在 0。 */
	function clampScrollOffset(offset, metrics, viewportSize) {
		const viewport = Math.max(0, Number.isFinite(viewportSize) ? viewportSize : 0);
		const max = Math.max(0, metrics.total - viewport);
		return Math.min(Math.max(0, Number.isFinite(offset) ? offset : 0), max);
	}
	/** 记住"视口顶部是哪一行、被滚过去了多少"，供数据更新后还原。空列表没有锚点。 */
	function anchorAt(metrics, scrollOffset) {
		if (metrics.ids.length === 0) return void 0;
		const offset = Math.max(0, Number.isFinite(scrollOffset) ? scrollOffset : 0);
		const index = indexAtOffset(metrics, offset);
		const id = metrics.ids[index];
		if (id === void 0) return void 0;
		return {
			id,
			delta: offset - metrics.offsets[index]
		};
	}
	/**
	* 数据更新后要还原到的滚动位置。
	*
	* 锚点行被删掉时返回 `undefined`——猜一个位置会让用户从"读第 3 条"跳到"第 1 条"，
	* 保持当前滚动位置反而是唯一不突兀的选择。调用方负责再夹一次范围。
	*/
	function scrollTopForAnchor(metrics, anchor) {
		const index = metrics.ids.indexOf(anchor.id);
		if (index < 0) return void 0;
		return metrics.offsets[index] + anchor.delta;
	}
	//#endregion
	//#region src/shell/dock.ts
	/**
	* 可停靠面板的状态机（03 §3 D 组 `OjDockPanel`）。
	*
	* 面板只有四种位置，但状态里必须同时记住**上次停靠的那一侧**：从"停到左边"浮动出去，
	* 再点"停靠"，用户期望回到左边，而不是被扔回默认的右边。少记这一个字段，
	* 用户每次浮动完都得重新拖一次栏——而且他不会觉得是 bug，只会觉得这面板"难用"。
	*
	* 停靠尺寸**不在这里**：那是 `OjPaneGroup` 的栏位尺寸，由分隔条调。
	* 这里只管"在哪、是否收起、浮动时占多大一块"。
	*/
	var DOCKED_SIDES = [
		"left",
		"right",
		"bottom"
	];
	var FLOAT_DEFAULT_WIDTH = 320;
	var FLOAT_DEFAULT_HEIGHT = 480;
	var FLOAT_MIN_WIDTH = 240;
	var FLOAT_MIN_HEIGHT = 160;
	/**
	* 浮动面板必须露在视口里的宽度。
	*
	* 取标题栏宽度而不是"整个面板可见"：面板可以大半移出屏幕，但抓得住的那一条必须留着，
	* 否则鼠标一松手就再也拿不回来——这类"窗口飘走了"的 bug 只能靠约束位置来防。
	*/
	var FLOAT_GRAB_STRIP = 48;
	function finite(value, fallback) {
		return value !== void 0 && Number.isFinite(value) ? value : fallback;
	}
	function between(value, min, max) {
		return Math.min(Math.max(value, min), max);
	}
	/** 初始状态。`side` 为 `floating` 时 `docked` 落到 `right`（没有更好的默认值）。 */
	function createDockState(options = {}) {
		var _options$side, _options$float;
		const side = (_options$side = options.side) !== null && _options$side !== void 0 ? _options$side : "right";
		const float = (_options$float = options.float) !== null && _options$float !== void 0 ? _options$float : {};
		return {
			side,
			docked: side === "floating" ? "right" : side,
			collapsed: options.collapsed === true,
			float: {
				x: finite(float.x, 0),
				y: finite(float.y, 0),
				width: Math.max(1, finite(float.width, 320)),
				height: Math.max(1, finite(float.height, 480))
			}
		};
	}
	function isFloating(state) {
		return state.side === "floating";
	}
	/** 收起只是不画内容，标题栏必须留着——否则收起的面板就再也点不开了。 */
	function toggleCollapsed(state) {
		return {
			...state,
			collapsed: !state.collapsed
		};
	}
	/** 停靠到某一侧。已经停在该侧时返回原对象，避免宿主收到无变化的更新。 */
	function dockTo(state, side) {
		if (state.side === side && state.docked === side) return state;
		return {
			...state,
			side,
			docked: side
		};
	}
	/** 浮出。保留 `docked`，`float` 矩形也原样带回。 */
	function undock(state) {
		if (state.side === "floating") return state;
		return {
			...state,
			side: "floating"
		};
	}
	/** 回到上次停靠的那一侧（不是默认那一侧）。 */
	function redock(state) {
		if (state.side !== "floating") return state;
		return {
			...state,
			side: state.docked
		};
	}
	/**
	* 把浮动矩形夹回"抓得住"的范围。
	*
	* 横向允许左边缘移出到只剩一条标题栏（`FLOAT_GRAB_STRIP`），纵向不允许上边缘出界：
	* 标题栏被顶到视口上方时连拖动入口都没有了。
	*/
	function clampFloatRect(rect, viewport) {
		const width = Math.max(1, finite(rect.width, 320));
		const height = Math.max(1, finite(rect.height, 480));
		const minX = 48 - width;
		const maxX = Math.max(minX, finite(viewport.width, 0) - 48);
		const maxY = Math.max(0, finite(viewport.height, 0) - 48);
		return {
			x: between(finite(rect.x, 0), minX, maxX),
			y: between(finite(rect.y, 0), 0, maxY),
			width,
			height
		};
	}
	/** 移动浮动面板。停靠态下调用返回原对象：位置由容器决定，改它没有意义。 */
	function moveFloat(state, position, viewport) {
		if (!isFloating(state)) return state;
		const next = clampFloatRect({
			...state.float,
			x: position.x,
			y: position.y
		}, viewport);
		if (next.x === state.float.x && next.y === state.float.y) return state;
		return {
			...state,
			float: next
		};
	}
	/** 改浮动尺寸（宿主可接八向手柄）。上下界取 `limits`，没有就给默认最小值、上限不设。 */
	function resizeFloat(state, size, limits = {}) {
		const minWidth = Math.max(1, finite(limits.minWidth, 240));
		const minHeight = Math.max(1, finite(limits.minHeight, 160));
		const maxWidth = Math.max(minWidth, finite(limits.maxWidth, Number.POSITIVE_INFINITY));
		const maxHeight = Math.max(minHeight, finite(limits.maxHeight, Number.POSITIVE_INFINITY));
		const width = between(finite(size.width, state.float.width), minWidth, maxWidth);
		const height = between(finite(size.height, state.float.height), minHeight, maxHeight);
		if (width === state.float.width && height === state.float.height) return state;
		return {
			...state,
			float: {
				...state.float,
				width,
				height
			}
		};
	}
	//#endregion
	//#region src/shell/upload.ts
	function bytes(value) {
		if (value === void 0 || !Number.isFinite(value)) return 0;
		return Math.max(0, Math.floor(value));
	}
	function createUpload(input) {
		return {
			id: input.id,
			name: input.name,
			size: bytes(input.size),
			loaded: 0,
			state: "queued",
			attempts: 0
		};
	}
	/** 开始上传。已经结束或正在传的项返回原对象，避免宿主重复触发。 */
	function startUpload(item) {
		if (item.state === "uploading" || item.state === "done" || item.state === "failed") return item;
		return {
			id: item.id,
			name: item.name,
			size: item.size,
			loaded: item.loaded,
			state: "uploading",
			attempts: item.attempts
		};
	}
	/**
	* 推进进度。只有 `uploading` 接受推进：暂停期间到达的分片回报必须丢掉，
	* 否则界面会在"已暂停"上继续涨进度，用户以为暂停没生效。
	*/
	function advanceUpload(item, loaded) {
		if (item.state !== "uploading") return item;
		const next = Math.min(bytes(loaded), item.size);
		if (next < item.loaded) return item;
		if (next >= item.size) return {
			...item,
			loaded: item.size,
			state: "done"
		};
		if (next === item.loaded) return item;
		return {
			...item,
			loaded: next
		};
	}
	function pauseUpload(item) {
		if (item.state !== "uploading") return item;
		return {
			...item,
			state: "paused"
		};
	}
	/** 继续：暂停 → 上传中。失败项要走 `retryUpload`，两者语义不同（一个续传、一个重试）。 */
	function resumeUpload(item) {
		if (item.state !== "paused") return item;
		return {
			...item,
			state: "uploading"
		};
	}
	/** 记一次失败。已传字节保留，重试时从断点继续。 */
	function failUpload(item, error) {
		if (item.state !== "uploading") return item;
		return error === void 0 ? {
			...item,
			state: "failed",
			attempts: item.attempts + 1
		} : {
			...item,
			state: "failed",
			attempts: item.attempts + 1,
			error
		};
	}
	function retryUpload(item) {
		if (item.state !== "failed") return item;
		return {
			id: item.id,
			name: item.name,
			size: item.size,
			loaded: item.loaded,
			state: "uploading",
			attempts: item.attempts
		};
	}
	/** 0..1。大小为 0 的项没有"进度"，只有"完成没完成"。 */
	function uploadPercent(item) {
		if (item.size <= 0) return item.state === "done" ? 1 : 0;
		return Math.min(1, Math.max(0, item.loaded / item.size));
	}
	/**
	* 下一个要发的分片。
	*
	* `start` 取当前分片的起点而不是 `loaded`：半个分片拼不起来，重发整片是幂等的。
	* 非上传态或已传完返回 `undefined`——调用方据此停下发送循环，而不是靠 `0 字节` 判断。
	*/
	function nextChunk(item, chunkSize) {
		if (item.state !== "uploading" && item.state !== "paused") return void 0;
		if (!Number.isFinite(chunkSize) || chunkSize <= 0) return void 0;
		if (item.loaded >= item.size) return void 0;
		const size = Math.floor(chunkSize);
		const index = Math.floor(item.loaded / size);
		const start = index * size;
		return {
			index,
			start,
			end: Math.min(item.size, start + size)
		};
	}
	function uploadSummary(items) {
		let done = 0;
		let failed = 0;
		let active = 0;
		let loaded = 0;
		let size = 0;
		for (const item of items) {
			if (item.state === "done") done += 1;
			else if (item.state === "failed") failed += 1;
			else active += 1;
			loaded += item.loaded;
			size += item.size;
		}
		const percent = size > 0 ? loaded / size : items.length > 0 && done === items.length ? 1 : 0;
		return {
			count: items.length,
			done,
			failed,
			active,
			loaded,
			size,
			percent
		};
	}
	//#endregion
	//#region src/shell/drop-zone.ts
	/**
	* 按 `DataTransfer.types` 判断载荷种类。`types` 是**小写**的 MIME 列表，不是文件名。
	*
	* 顺序即优先级：文件优先于富文本，富文本优先于纯文本（前者信息更全）。
	* 同时带 `text/html` 与 `text/plain` 是浏览器对富文本的常规做法，取 html 才不会丢掉格式。
	*/
	function classifyTransfer(types) {
		let html = false;
		let text = false;
		for (const entry of types) {
			const value = entry.trim().toLowerCase();
			if (value === "files" || value === "application/x-moz-file") return "files";
			if (value === "text/html") html = true;
			else if (value === "text/plain") text = true;
		}
		return html ? "html" : text ? "text" : "none";
	}
	/** 扩展名（小写、带点）。没有扩展名或点在开头（`.gitignore`）时返回空串。 */
	function extensionOf(name) {
		const index = name.lastIndexOf(".");
		if (index <= 0 || index === name.length - 1) return "";
		return name.slice(index).toLowerCase();
	}
	/** 单个文件是否被受理。`accept.types` 为空/未给时一律受理。 */
	function acceptsFile(file, accept) {
		var _accept$types, _file$type;
		const types = (_accept$types = accept.types) !== null && _accept$types !== void 0 ? _accept$types : [];
		if (types.length === 0) return true;
		const extension = extensionOf(file.name);
		const mime = ((_file$type = file.type) !== null && _file$type !== void 0 ? _file$type : "").toLowerCase();
		for (const entry of types) {
			const rule = entry.trim().toLowerCase();
			if (rule.length === 0) continue;
			if (rule.startsWith(".")) {
				if (extension === rule) return true;
				continue;
			}
			if (rule.endsWith("/*")) {
				if (mime.startsWith(rule.slice(0, -1))) return true;
				continue;
			}
			if (mime === rule) return true;
		}
		return false;
	}
	/**
	* 一次拖放的整体判定。`multiple: false` 时**只收第一个**，其余算数量超限。
	*
	* 不把"多选"当格式错误：这两种拒绝在界面上要给的提示完全不同
	* （"这个格式不支持" vs "一次只能传一个"），混成一条会让用户改错方向。
	*/
	function selectDropped(files, accept) {
		const multiple = accept.multiple !== false;
		const accepted = [];
		let rejected;
		for (const file of files) {
			if (!acceptsFile(file, accept)) {
				rejected = "type";
				continue;
			}
			if (!multiple && accepted.length >= 1) {
				if (rejected === void 0) rejected = "count";
				continue;
			}
			accepted.push(file);
		}
		return {
			accepted,
			rejected
		};
	}
	//#endregion
	//#region src/shell/drag-context.ts
	/**
	* 拖放协议：区分**内部拖拽**与**外部拖入**（03 §3 D 组 `OjDragDropContext`，§8.9 类型协商）。
	*
	* 不看 MIME 就统一处理，是本项目里最容易犯的错：
	*   - 把"拖动文档里选中的一段字"当成"拖进来一个文件"，弹"只收 .docx"；
	*   - 把"从桌面拖进来的文件"当成内部拖动，直接插进正文变成一段二进制乱码。
	*
	* 判定靠一个私有 MIME 标记：内部拖拽在 `dragstart` 里写进 `DRAG_MARKER`，
	* 外部来源不可能带这个类型。相比"记住鼠标按下了"之类的猜测，这是唯一稳定的信号。
	*/
	/** 内部拖拽标记。私有 MIME 不会被任何外部应用发出。 */
	var DRAG_MARKER = "application/x-oj-drag";
	/** 内部拖拽写入的内容：标记 + 宿主数据 + 可选富文本兜底（拖到别的应用时还能用）。 */
	function writeInternalDrag(transfer, payload) {
		transfer.setData(DRAG_MARKER, payload.id);
		if (payload.html !== void 0) transfer.setData("text/html", payload.html);
		if (payload.text !== void 0) transfer.setData("text/plain", payload.text);
	}
	function safeGetData(transfer, format) {
		try {
			return transfer.getData(format);
		} catch (_unused) {
			return "";
		}
	}
	/**
	* 读一次拖放载荷。`types` 里带标记就是内部拖拽，此时不再当文件处理——
	* 内部拖拽同样会带 `text/html`，只看那些类型永远分不开。
	*/
	function readTransfer(transfer) {
		const files = [...transfer.files];
		const internal = transfer.types.some((type) => type.trim().toLowerCase() === DRAG_MARKER);
		return {
			kind: internal ? "internal" : classifyTransfer(transfer.types),
			files,
			html: safeGetData(transfer, "text/html"),
			text: safeGetData(transfer, "text/plain"),
			data: internal ? safeGetData(transfer, DRAG_MARKER) : ""
		};
	}
	/** MIME 规则（含通配）能否命中这次拖拽。拖入阶段拿不到文件名，只能按类型先判。 */
	function mimeMatches(types, rules) {
		const actual = types.map((type) => type.trim().toLowerCase());
		return rules.some((rule) => {
			const value = rule.trim().toLowerCase();
			const slash = value.indexOf("/");
			if (slash <= 0) return false;
			if (value.endsWith("/*")) {
				const prefix = value.slice(0, slash + 1);
				return actual.some((type) => type.startsWith(prefix));
			}
			return actual.includes(value);
		});
	}
	/**
	* 这次拖拽是否归我们处理。
	*
	* 文件分支的规则很别扭但必须这样：`accept.types` 里只有扩展名（`.docx`）时，
	* 拖入阶段**没有文件名**，只能放行，等 `drop` 再靠 `selectDropped` 判；
	* 反过来若按"扩展名不匹配 MIME"直接拒绝，用户会看到遮罩根本不出现，也就再没法导入。
	* 含 `/` 的规则（`application/pdf`、`image/*`）则必须命中，能提前挡掉明显不对的拖拽。
	*/
	function negotiateTransfer(types, accept = {}) {
		if (types.some((type) => type.trim().toLowerCase() === "application/x-oj-drag")) return true;
		const kind = classifyTransfer(types);
		if (kind === "files") {
			var _accept$types;
			const mimeRules = ((_accept$types = accept.types) !== null && _accept$types !== void 0 ? _accept$types : []).filter((rule) => rule.includes("/"));
			if (mimeRules.length === 0) return true;
			return mimeMatches(types, mimeRules);
		}
		if (kind === "none") return false;
		return accept.text === true;
	}
	//#endregion
	//#region src/shell/share.ts
	/**
	* 共享权限模型（03 §3 E 组 `OjShareDialog`）。
	*
	* 这里只做一件容易被做错的事：**决定"实际发出去的是什么权限"**。
	*
	* 界面上的选择组合不都是合法的：`private` 没有角色，`link` 不该给"可编辑"（拿到链接就能改），
	* 有效期只对链接有意义。把归一化放进组件，就会出现"界面上选了可编辑、请求里发的是可评论"，
	* 谁也不知道到底给了什么权限。所以：范围切换时把角色降级，`resolveShare()` 给出真正生效的值。
	*/
	var SHARE_SCOPES = [
		"private",
		"link",
		"org",
		"people"
	];
	var SHARE_ROLES = [
		"viewer",
		"commenter",
		"editor"
	];
	/** 各范围允许的角色。链接范围不给"可编辑"：链接会被转发，转发的人不该顺带给出编辑权。 */
	var ROLES_BY_SCOPE = {
		private: [],
		link: ["viewer", "commenter"],
		org: [
			"viewer",
			"commenter",
			"editor"
		],
		people: [
			"viewer",
			"commenter",
			"editor"
		]
	};
	var SHARE_MAX_EXPIRY_DAYS = 3650;
	var SHARE_MAX_PEOPLE = 9999;
	function rolesForScope(scope) {
		return ROLES_BY_SCOPE[scope];
	}
	function whole(value, fallback, max) {
		if (value === void 0 || !Number.isFinite(value)) return fallback;
		return Math.min(Math.max(0, Math.floor(value)), max);
	}
	function allowedRole(scope, role) {
		var _allowed$;
		const allowed = ROLES_BY_SCOPE[scope];
		if (allowed.includes(role)) return role;
		return (_allowed$ = allowed[0]) !== null && _allowed$ !== void 0 ? _allowed$ : role;
	}
	function createShareState(options = {}) {
		var _options$scope, _options$role;
		const scope = (_options$scope = options.scope) !== null && _options$scope !== void 0 ? _options$scope : "private";
		return {
			scope,
			role: allowedRole(scope, (_options$role = options.role) !== null && _options$role !== void 0 ? _options$role : "viewer"),
			expiryDays: whole(options.expiryDays, 0, SHARE_MAX_EXPIRY_DAYS),
			peopleCount: whole(options.peopleCount, 0, SHARE_MAX_PEOPLE)
		};
	}
	/** 切范围时顺手把角色降级到合法值：界面上不会出现"当前范围根本不允许的角色"。 */
	function setShareScope(state, scope) {
		const role = allowedRole(scope, state.role);
		if (scope === state.scope && role === state.role) return state;
		return {
			...state,
			scope,
			role
		};
	}
	/** 选角色。当前范围不允许的角色直接忽略（UI 不该放出这种选项，但宿主可能直接调）。 */
	function setShareRole(state, role) {
		if (state.role === role) return state;
		if (!ROLES_BY_SCOPE[state.scope].includes(role)) return state;
		return {
			...state,
			role
		};
	}
	/** 链接有效期。只影响 `link`；负数/NaN 归 0（永久）。 */
	function setShareExpiry(state, days) {
		const expiryDays = whole(days, state.expiryDays, SHARE_MAX_EXPIRY_DAYS);
		if (expiryDays === state.expiryDays) return state;
		return {
			...state,
			expiryDays
		};
	}
	function setSharePeopleCount(state, count) {
		const peopleCount = whole(count, state.peopleCount, SHARE_MAX_PEOPLE);
		if (peopleCount === state.peopleCount) return state;
		return {
			...state,
			peopleCount
		};
	}
	function isShareEnabled(state) {
		return state.scope !== "private";
	}
	/**
	* 归一化后的权限——真正该发给后端的东西。
	*
	* 不做这一步，就会出现"界面显示可评论、实际给了可编辑"或反过来的事故：
	* 两类信息（范围、角色）在 UI 上互相覆盖，只有一处能算出最终值才不会分叉。
	*/
	function resolveShare(state) {
		if (state.scope === "private") return {
			scope: state.scope,
			role: void 0,
			expiryDays: void 0,
			peopleCount: void 0
		};
		return {
			scope: state.scope,
			role: allowedRole(state.scope, state.role),
			expiryDays: state.scope === "link" ? state.expiryDays : void 0,
			peopleCount: state.scope === "people" ? state.peopleCount : void 0
		};
	}
	//#endregion
	//#region src/shell/versions.ts
	var IDLE_RESTORE = { status: "idle" };
	/** 新的在前；时间相同保持原有顺序（`Array.prototype.sort` 是稳定排序）。 */
	function sortVersions(entries) {
		return [...entries].sort((left, right) => right.at - left.at);
	}
	function latestVersion(entries) {
		return sortVersions(entries)[0];
	}
	/** 建条目：时间非数字归 0（宁可排在最后，也不要整列顺序变成随机）。 */
	function createVersion(input) {
		return {
			id: input.id,
			at: Number.isFinite(input.at) ? input.at : 0,
			author: input.author.trim(),
			...input.name === void 0 ? {} : { name: input.name },
			...input.summary === void 0 ? {} : { summary: input.summary }
		};
	}
	/**
	* 重命名。空白名字等于"去掉名字"，退回自动版本——
	* 清空输入框却留下一个空标题的条目，用户会以为重命名失败了。
	*/
	function renameVersion(entries, id, name) {
		const trimmed = name.trim();
		let changed = false;
		const next = entries.map((entry) => {
			var _entry$name;
			if (entry.id !== id) return entry;
			if (((_entry$name = entry.name) !== null && _entry$name !== void 0 ? _entry$name : "") === trimmed) return entry;
			changed = true;
			if (trimmed === "") return {
				id: entry.id,
				at: entry.at,
				author: entry.author,
				...entry.summary === void 0 ? {} : { summary: entry.summary }
			};
			return {
				...entry,
				name: trimmed
			};
		});
		return changed ? next : entries;
	}
	function deleteVersion(entries, id) {
		const next = entries.filter((entry) => entry.id !== id);
		return next.length === entries.length ? entries : next;
	}
	/** 请求恢复：进入"待确认"。同一条重复请求返回原对象。 */
	function requestRestore(state, entryId) {
		if (state.status === "confirming" && state.entryId === entryId) return state;
		return {
			status: "confirming",
			entryId
		};
	}
	function cancelRestore(state) {
		return state.status === "idle" ? state : IDLE_RESTORE;
	}
	/** 用户点了"确认恢复"：进入执行态，组件据此上抛 `restore`。 */
	function confirmRestore(state) {
		if (state.status !== "confirming") return state;
		return {
			status: "restoring",
			entryId: state.entryId
		};
	}
	function restoreEntryId(state) {
		return state.status === "idle" ? void 0 : state.entryId;
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
	exports.AVATAR_TONES = AVATAR_TONES;
	exports.BORDER_COLORS = BORDER_COLORS;
	exports.BORDER_STYLES = BORDER_STYLES;
	exports.BORDER_WIDTHS = BORDER_WIDTHS;
	exports.BORDER_WIDTH_RANGE = BORDER_WIDTH_RANGE;
	exports.COLOR_SWATCH_GROUPS = COLOR_SWATCH_GROUPS;
	exports.COMMAND_ALIGN = COMMAND_ALIGN;
	exports.COMMAND_ALIGN_LEFT = COMMAND_ALIGN_LEFT;
	exports.COMMAND_BLOCKQUOTE = COMMAND_BLOCKQUOTE;
	exports.COMMAND_BOLD = COMMAND_BOLD;
	exports.COMMAND_BORDER = COMMAND_BORDER;
	exports.COMMAND_BULLET_LIST = COMMAND_BULLET_LIST;
	exports.COMMAND_CODE_BLOCK = COMMAND_CODE_BLOCK;
	exports.COMMAND_FONT_FAMILY = COMMAND_FONT_FAMILY;
	exports.COMMAND_FONT_SIZE = COMMAND_FONT_SIZE;
	exports.COMMAND_HARD_BREAK = COMMAND_HARD_BREAK;
	exports.COMMAND_HEADING = COMMAND_HEADING;
	exports.COMMAND_HORIZONTAL_RULE = COMMAND_HORIZONTAL_RULE;
	exports.COMMAND_ITALIC = COMMAND_ITALIC;
	exports.COMMAND_LINE_SPACING = COMMAND_LINE_SPACING;
	exports.COMMAND_ORDERED_LIST = COMMAND_ORDERED_LIST;
	exports.COMMAND_TABLE = COMMAND_TABLE;
	exports.COMMAND_TEXT_COLOR = COMMAND_TEXT_COLOR;
	exports.COMMAND_UNDERLINE = COMMAND_UNDERLINE;
	exports.DEFAULT_ALIGNMENT = DEFAULT_ALIGNMENT;
	exports.DEFAULT_BORDER = DEFAULT_BORDER;
	exports.DEFAULT_GRID_LIMITS = DEFAULT_GRID_LIMITS;
	exports.DOCKED_SIDES = DOCKED_SIDES;
	exports.DRAG_MARKER = DRAG_MARKER;
	exports.FLOAT_DEFAULT_HEIGHT = FLOAT_DEFAULT_HEIGHT;
	exports.FLOAT_DEFAULT_WIDTH = FLOAT_DEFAULT_WIDTH;
	exports.FLOAT_GRAB_STRIP = FLOAT_GRAB_STRIP;
	exports.FLOAT_MIN_HEIGHT = FLOAT_MIN_HEIGHT;
	exports.FLOAT_MIN_WIDTH = FLOAT_MIN_WIDTH;
	exports.FONT_OPTIONS = FONT_OPTIONS;
	exports.FONT_SIZE_PRESETS = FONT_SIZE_PRESETS;
	exports.FONT_SIZE_RANGE = FONT_SIZE_RANGE;
	exports.HORIZONTAL_ALIGNS = HORIZONTAL_ALIGNS;
	exports.HORIZONTAL_RULE_GROUP = HORIZONTAL_RULE_GROUP;
	exports.HORIZONTAL_RULE_INPUT = HORIZONTAL_RULE_INPUT;
	exports.HORIZONTAL_RULE_MARKDOWN = HORIZONTAL_RULE_MARKDOWN;
	exports.HORIZONTAL_RULE_MARKDOWN_TOKEN = HORIZONTAL_RULE_MARKDOWN_TOKEN;
	exports.HORIZONTAL_RULE_NAME = HORIZONTAL_RULE_NAME;
	exports.IDLE_RESTORE = IDLE_RESTORE;
	exports.LINE_SPACING_PRESETS = LINE_SPACING_PRESETS;
	exports.LINE_SPACING_RANGE = LINE_SPACING_RANGE;
	exports.REVIEW_KINDS = REVIEW_KINDS;
	exports.SHARE_MAX_EXPIRY_DAYS = SHARE_MAX_EXPIRY_DAYS;
	exports.SHARE_MAX_PEOPLE = SHARE_MAX_PEOPLE;
	exports.SHARE_ROLES = SHARE_ROLES;
	exports.SHARE_SCOPES = SHARE_SCOPES;
	exports.SPLITTER_STEP = SPLITTER_STEP;
	exports.STYLE_PRESETS = STYLE_PRESETS;
	exports.SYMBOL_GROUPS = SYMBOL_GROUPS;
	exports.VERTICAL_ALIGNS = VERTICAL_ALIGNS;
	exports.ZOOM_MAX = ZOOM_MAX;
	exports.ZOOM_MIN = ZOOM_MIN;
	exports.ZOOM_STEP = ZOOM_STEP;
	exports.acceptsFile = acceptsFile;
	exports.addReply = addReply;
	exports.advanceUpload = advanceUpload;
	exports.alignArg = alignArg;
	exports.anchorAt = anchorAt;
	exports.applyHorizontalRuleInput = applyHorizontalRuleInput;
	exports.applyNodeInput = applyNodeInput;
	exports.avatarTone = avatarTone;
	exports.blockPlain = blockPlain;
	exports.borderArg = borderArg;
	exports.borderCss = borderCss;
	exports.bridgedCommandIds = bridgedCommandIds;
	exports.cancelRestore = cancelRestore;
	exports.changeAuthors = changeAuthors;
	exports.clampFloatRect = clampFloatRect;
	exports.clampNumber = clampNumber;
	exports.clampPane = clampPane;
	exports.clampScrollOffset = clampScrollOffset;
	exports.clampZoom = clampZoom;
	exports.classifyTransfer = classifyTransfer;
	exports.commentCounts = commentCounts;
	exports.confirmRestore = confirmRestore;
	exports.createDockState = createDockState;
	exports.createDocument = createDocument;
	exports.createGridPicker = createGridPicker;
	exports.createMemoryEditor = createMemoryEditor;
	exports.createMetrics = createMetrics;
	exports.createRibbonChrome = createRibbonChrome;
	exports.createShareState = createShareState;
	exports.createTooltipMachine = createTooltipMachine;
	exports.createTriggerMachine = createTriggerMachine;
	exports.createUpload = createUpload;
	exports.createVersion = createVersion;
	exports.decideAll = decideAll;
	exports.decideChange = decideChange;
	exports.deleteVersion = deleteVersion;
	exports.detectPlatform = detectPlatform;
	exports.dockTo = dockTo;
	exports.editorCommands = editorCommands;
	exports.extendStroke = extendStroke;
	exports.extensionOf = extensionOf;
	exports.failUpload = failUpload;
	exports.fileNameProblem = fileNameProblem;
	exports.filterChanges = filterChanges;
	exports.filterFonts = filterFonts;
	exports.filterPaletteItems = filterPaletteItems;
	exports.filterSymbols = filterSymbols;
	exports.filterThreads = filterThreads;
	exports.filterTree = filterTree;
	exports.findFont = findFont;
	exports.flattenSymbols = flattenSymbols;
	exports.fontFamilyArg = fontFamilyArg;
	exports.fontSizeArg = fontSizeArg;
	exports.formatBorderWidth = formatBorderWidth;
	exports.formatFontSize = formatFontSize;
	exports.formatHotkey = formatHotkey;
	exports.formatLineSpacing = formatLineSpacing;
	exports.galleryNeighbor = galleryNeighbor;
	exports.horizontalRuleOptions = horizontalRuleOptions;
	exports.hotkeyConflicts = hotkeyConflicts;
	exports.iconLabelProblem = iconLabelProblem;
	exports.iconMarkup = iconMarkup;
	exports.iconMarkupProblem = iconMarkupProblem;
	exports.icons = icons;
	exports.indexAtOffset = indexAtOffset;
	exports.initialsOf = initialsOf;
	exports.isAlignmentValue = isAlignmentValue;
	exports.isCssColor = isCssColor;
	exports.isDevEnv = isDevEnv;
	exports.isDirty = isDirty;
	exports.isFloating = isFloating;
	exports.isHeadingLevel = isHeadingLevel;
	exports.isHorizontalRuleInput = isHorizontalRuleInput;
	exports.isShareEnabled = isShareEnabled;
	exports.isTableSize = isTableSize;
	exports.isTextblockType = isTextblockType;
	exports.latestVersion = latestVersion;
	exports.lineSpacingArg = lineSpacingArg;
	exports.matchHotkey = matchHotkey;
	exports.matchNodeInput = matchNodeInput;
	exports.measureItem = measureItem;
	exports.menuAction = menuAction;
	exports.menuNeighbor = menuNeighbor;
	exports.menuSelectable = menuSelectable;
	exports.menuSelectableIndices = menuSelectableIndices;
	exports.mergeAttributes = mergeAttributes;
	exports.moveFloat = moveFloat;
	exports.nearestPreset = nearestPreset;
	exports.negotiateTransfer = negotiateTransfer;
	exports.neighbor = neighbor;
	exports.neighborSwatch = neighborSwatch;
	exports.nextChunk = nextChunk;
	exports.nextOpenThread = nextOpenThread;
	exports.nodeExtension = nodeExtension;
	exports.normalizeAlignment = normalizeAlignment;
	exports.normalizeBorder = normalizeBorder;
	exports.normalizeHex = normalizeHex;
	exports.normalizeKey = normalizeKey;
	exports.packRibbon = packRibbon;
	exports.pageWidth = pageWidth;
	exports.paletteScore = paletteScore;
	exports.paletteStep = paletteStep;
	exports.paneSplitter = paneSplitter;
	exports.parseAlignValue = parseAlignValue;
	exports.parseHorizontalRuleHTML = parseHorizontalRuleHTML;
	exports.parseHorizontalRuleMarkdown = parseHorizontalRuleMarkdown;
	exports.parseHotkey = parseHotkey;
	exports.parseNumberDraft = parseNumberDraft;
	exports.pauseUpload = pauseUpload;
	exports.placePopper = placePopper;
	exports.plainText = plainText;
	exports.platformFrom = platformFrom;
	exports.readTransfer = readTransfer;
	exports.redock = redock;
	exports.registerEditorCommands = registerEditorCommands;
	exports.registerIcon = registerIcon;
	exports.registerIcons = registerIcons;
	exports.registeredIconMarkup = registeredIconMarkup;
	exports.registeredIconNames = registeredIconNames;
	exports.renameFile = renameFile;
	exports.renameVersion = renameVersion;
	exports.renderHorizontalRule = renderHorizontalRule;
	exports.renderHorizontalRuleMarkdown = renderHorizontalRuleMarkdown;
	exports.replaceAll = replaceAll;
	exports.replaceOne = replaceOne;
	exports.requestRestore = requestRestore;
	exports.resetRegisteredIcons = resetRegisteredIcons;
	exports.resizeFloat = resizeFloat;
	exports.resizePane = resizePane;
	exports.resolveShare = resolveShare;
	exports.restoreEntryId = restoreEntryId;
	exports.resumeUpload = resumeUpload;
	exports.retryUpload = retryUpload;
	exports.reviewCounts = reviewCounts;
	exports.ribbonDismiss = ribbonDismiss;
	exports.ribbonHasKeyTips = ribbonHasKeyTips;
	exports.ribbonKeyTip = ribbonKeyTip;
	exports.ribbonPanelOpen = ribbonPanelOpen;
	exports.ribbonProbeSize = ribbonProbeSize;
	exports.ribbonSelect = ribbonSelect;
	exports.ribbonSmallerSize = ribbonSmallerSize;
	exports.ribbonToggleCollapsed = ribbonToggleCollapsed;
	exports.rolesForScope = rolesForScope;
	exports.roundTo = roundTo;
	exports.rulerTicks = rulerTicks;
	exports.scrollTopForAnchor = scrollTopForAnchor;
	exports.searchHits = searchHits;
	exports.selectByKey = selectByKey;
	exports.selectDropped = selectDropped;
	exports.setHardBreak = setHardBreak;
	exports.setHorizontalRule = setHorizontalRule;
	exports.setResolved = setResolved;
	exports.setShareExpiry = setShareExpiry;
	exports.setSharePeopleCount = setSharePeopleCount;
	exports.setShareRole = setShareRole;
	exports.setShareScope = setShareScope;
	exports.sortVersions = sortVersions;
	exports.stackPeople = stackPeople;
	exports.startStroke = startStroke;
	exports.startUpload = startUpload;
	exports.starterNodes = starterNodes;
	exports.stepFont = stepFont;
	exports.stepHorizontal = stepHorizontal;
	exports.stepNumber = stepNumber;
	exports.stepPane = stepPane;
	exports.stepPreset = stepPreset;
	exports.stepVertical = stepVertical;
	exports.stepZoom = stepZoom;
	exports.strokePath = strokePath;
	exports.styleLabel = styleLabel;
	exports.stylePresetCss = stylePresetCss;
	exports.textAlignCss = textAlignCss;
	exports.textColorArg = textColorArg;
	exports.textblock = textblock;
	exports.tiptapEditorHost = tiptapEditorHost;
	exports.toggleBlockquote = toggleBlockquote;
	exports.toggleBulletList = toggleBulletList;
	exports.toggleCodeBlock = toggleCodeBlock;
	exports.toggleCollapsed = toggleCollapsed;
	exports.toggleHeading = toggleHeading;
	exports.toggleId = toggleId;
	exports.toggleOrderedList = toggleOrderedList;
	exports.togglePane = togglePane;
	exports.undock = undock;
	exports.unregisterIcon = unregisterIcon;
	exports.uploadPercent = uploadPercent;
	exports.uploadSummary = uploadSummary;
	exports.verticalAlignCss = verticalAlignCss;
	exports.visibleRange = visibleRange;
	exports.withPlain = withPlain;
	exports.writeInternalDrag = writeInternalDrag;
});
