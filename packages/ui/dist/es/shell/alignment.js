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
	return HORIZONTAL_ALIGNS[HORIZONTAL_ALIGNS.indexOf(value) + direction] ?? value;
}
function stepVertical(value, direction) {
	return VERTICAL_ALIGNS[VERTICAL_ALIGNS.indexOf(value) + direction] ?? value;
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
export { DEFAULT_ALIGNMENT, HORIZONTAL_ALIGNS, VERTICAL_ALIGNS, isAlignmentValue, normalizeAlignment, stepHorizontal, stepVertical, textAlignCss, verticalAlignCss };
