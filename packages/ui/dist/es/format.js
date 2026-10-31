import { isAlignmentValue, textAlignCss, verticalAlignCss } from "./shell/alignment.js";
import { isCssColor } from "./shell/color.js";
import { borderCss } from "./shell/border.js";
import { FONT_SIZE_RANGE, LINE_SPACING_RANGE, formatFontSize, formatLineSpacing } from "./shell/presets.js";
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
export { alignArg, borderArg, fontFamilyArg, fontSizeArg, lineSpacingArg, parseAlignValue, textColorArg };
