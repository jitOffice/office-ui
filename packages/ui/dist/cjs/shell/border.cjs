const require_color = require("./color.cjs");
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
	const style = isStyle(value?.style) ? value.style : DEFAULT_BORDER.style;
	const rawWidth = typeof value?.width === "number" && Number.isFinite(value.width) ? value.width : DEFAULT_BORDER.width;
	const clamped = Math.min(Math.max(rawWidth, BORDER_WIDTH_RANGE.min), BORDER_WIDTH_RANGE.max);
	const color = typeof value?.color === "string" && require_color.isCssColor(value.color) ? value.color : DEFAULT_BORDER.color;
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
exports.BORDER_COLORS = BORDER_COLORS;
exports.BORDER_STYLES = BORDER_STYLES;
exports.BORDER_WIDTHS = BORDER_WIDTHS;
exports.BORDER_WIDTH_RANGE = BORDER_WIDTH_RANGE;
exports.DEFAULT_BORDER = DEFAULT_BORDER;
exports.borderCss = borderCss;
exports.formatBorderWidth = formatBorderWidth;
exports.normalizeBorder = normalizeBorder;
