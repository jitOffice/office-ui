const require_format = require("./format.cjs");
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
		valueCommand(COMMAND_FONT_FAMILY, "oj.command.fontFamily", require_format.fontFamilyArg),
		valueCommand(COMMAND_FONT_SIZE, "oj.command.fontSize", require_format.fontSizeArg),
		valueCommand(COMMAND_TEXT_COLOR, "oj.command.textColor", require_format.textColorArg),
		valueCommand(COMMAND_BORDER, "oj.command.border", require_format.borderArg),
		valueCommand(COMMAND_LINE_SPACING, "oj.command.lineSpacing", require_format.lineSpacingArg),
		valueCommand(COMMAND_ALIGN, "oj.command.align", require_format.alignArg),
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
exports.editorCommands = editorCommands;
exports.isHeadingLevel = isHeadingLevel;
exports.isTableSize = isTableSize;
exports.registerEditorCommands = registerEditorCommands;
