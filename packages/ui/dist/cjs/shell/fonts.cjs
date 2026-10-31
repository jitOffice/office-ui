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
	if (fonts.length === 0) return id;
	const index = fonts.findIndex((font) => font.id === id);
	if (index === -1) return fonts[0].id;
	return fonts[index + direction]?.id ?? id;
}
//#endregion
exports.FONT_OPTIONS = FONT_OPTIONS;
exports.filterFonts = filterFonts;
exports.findFont = findFont;
exports.stepFont = stepFont;
