//#region src/menu.ts
/** 这一项能不能被选中/聚焦。分隔线与禁用项都不行。 */
function menuSelectable(item) {
	return item.kind !== "separator" && item.disabled !== true;
}
/** 可选项的下标表，按原顺序。组件用它做 tabindex 轮换，导航用它算邻居。 */
function menuSelectableIndices(items) {
	const out = [];
	items.forEach((item, index) => {
		if (menuSelectable(item)) out.push(index);
	});
	return out;
}
/**
* 方向键/Home/End 之后该聚焦哪一项。返回**项下标**，没有可选项时返回 `-1`。
*
* `index` 传 `-1` 表示"当前没有任何项被聚焦"：`ArrowDown` 落到第一个可选项，
* `ArrowUp` 落到最后一个——这是菜单刚打开时的两种进入方向。
* 未知按键原样返回 `index`，调用方据此判断"这个键不归我管"。
*/
function menuNeighbor(items, index, key) {
	const enabled = menuSelectableIndices(items);
	if (enabled.length === 0) return -1;
	const at = enabled.indexOf(index);
	const first = enabled[0];
	const last = enabled[enabled.length - 1];
	if (key === "Home") return first;
	if (key === "End") return last;
	if (key === "ArrowDown") return enabled[(at + 1) % enabled.length];
	if (key === "ArrowUp") return enabled[(at <= 0 ? enabled.length : at) - 1];
	return index;
}
/** 回车/空格该触发哪一项。`-1`（无聚焦）或落在禁用项上时返回 `undefined`。 */
function menuAction(items, index) {
	const item = items[index];
	if (item === void 0 || !menuSelectable(item)) return void 0;
	return item;
}
//#endregion
export { menuAction, menuNeighbor, menuSelectable, menuSelectableIndices };
