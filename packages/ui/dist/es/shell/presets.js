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
	if (presets.length === 0) return value;
	const sorted = [...presets].sort((a, b) => a - b);
	const exact = sorted.indexOf(value);
	if (exact !== -1) return sorted[exact + direction] ?? value;
	const nearest = nearestPreset(sorted, value);
	if (nearest === value) return value;
	const nearestIndex = sorted.indexOf(nearest);
	return sorted[(direction === 1 ? nearest < value : nearest > value) ? nearestIndex + direction : nearestIndex] ?? nearest;
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
export { FONT_SIZE_PRESETS, FONT_SIZE_RANGE, LINE_SPACING_PRESETS, LINE_SPACING_RANGE, formatFontSize, formatLineSpacing, nearestPreset, stepPreset };
