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
	const css = { fontSize: `${preset.fontSize}px` };
	if (preset.bold === true) css.fontWeight = "600";
	if (preset.italic === true) css.fontStyle = "italic";
	css.fontFamily = `var(--oj-font-${preset.family ?? "sans"})`;
	return css;
}
/**
* 显示名缺省时回退到 id。
* 不在这里编中文名：`title-1` 在日文界面应该是"見出し1"，写死中文就永远翻不掉。
*/
function styleLabel(labels, id) {
	return labels?.[id] ?? id;
}
//#endregion
export { STYLE_PRESETS, styleLabel, stylePresetCss };
