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
export { anchorAt, clampScrollOffset, createMetrics, indexAtOffset, measureItem, scrollTopForAnchor, visibleRange };
