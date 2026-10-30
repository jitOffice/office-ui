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
exports.filterPaletteItems = filterPaletteItems;
exports.paletteScore = paletteScore;
exports.paletteStep = paletteStep;
