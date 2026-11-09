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
export { SPLITTER_STEP, clampPane, paneSplitter, resizePane, stepPane, togglePane };
