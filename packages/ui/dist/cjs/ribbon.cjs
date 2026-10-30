//#region src/ribbon.ts
var DEGRADE = {
	large: "medium",
	medium: "small",
	small: void 0
};
var SIZE_RANK = {
	large: 2,
	medium: 1,
	small: 0
};
/** 取更小的那一档。探测时用它保证只会往下压，不会把命令反向放大。 */
function ribbonSmallerSize(a, b) {
	return SIZE_RANK[a] <= SIZE_RANK[b] ? a : b;
}
/**
* 还差哪一档的宽度没量到。
*
* 没给 `width` 的命令，第一版只能按"设计尺寸"渲染出来才量得到宽度；比它更小的档位
* 则要**真的按那一档渲染一次**才能量。所以组件按 `medium` → `small` 的顺序整组探一次，
* 量到就记进表里、立刻按真实宽度重算——不靠比例猜，也不事先克隆一份插槽内容去量。
*
* 返回 `undefined` 表示已经量全，或者所有缺失都被使用方用 `widths` 显式给出了。
*/
function ribbonProbeSize(items, measured) {
	for (const target of ["medium", "small"]) if (items.some((item) => {
		if (SIZE_RANK[item.size] < SIZE_RANK[target]) return false;
		if (target === item.size) return false;
		if (item.widths?.[target] !== void 0) return false;
		return measured[item.id]?.[target] === void 0;
	})) return target;
}
function widthOf(item) {
	return item.widths?.[item.display] ?? item.width;
}
function span(items, gap) {
	if (items.length === 0) return 0;
	return items.reduce((sum, item) => sum + widthOf(item), 0) + gap * (items.length - 1);
}
/**
* 把命令铺进有限宽度：
*   1. 放得下就原样放；
*   2. 放不下先**降级**（large→medium→small）：先整组降一档，还不够再整组降第二档，
*      每降一个就复查一次——顺序不能乱，Ribbon 的肌肉记忆全靠位置；
*   3. 还装不下就从**末尾**往 `»` 里塞，塞到连"最后一个可见项 + `»`"都放不下为止。
*/
function packRibbon(items, availableWidth, options = {}) {
	const gap = options.gap ?? 2;
	const overflowWidth = options.overflowWidth ?? 20;
	const packed = items.map((item) => ({
		...item,
		display: item.size
	}));
	if (packed.length === 0) return {
		visible: [],
		overflow: [],
		used: 0
	};
	if (span(packed, gap) <= availableWidth) return {
		visible: packed,
		overflow: [],
		used: span(packed, gap)
	};
	for (const target of ["medium", "small"]) for (const item of packed) {
		if (DEGRADE[item.display] !== target) continue;
		item.display = target;
		if (span(packed, gap) <= availableWidth) return {
			visible: packed,
			overflow: [],
			used: span(packed, gap)
		};
	}
	const visible = [...packed];
	const overflow = [];
	while (visible.length > 0) {
		if (span(visible, gap) + gap + overflowWidth <= availableWidth) break;
		overflow.unshift(visible.pop());
	}
	return {
		visible,
		overflow,
		used: span(visible, gap) + (overflow.length > 0 ? (visible.length > 0 ? gap : 0) + overflowWidth : 0)
	};
}
function createRibbonChrome(tab, collapsed = false) {
	return {
		tab,
		collapsed,
		peek: false
	};
}
/** 面板此刻是否可见。收起 + 没临时展开 = 不可见。 */
function ribbonPanelOpen(state) {
	return !state.collapsed || state.peek;
}
/**
* 单击选项卡。展开态只切标签；收起态先临时展开，
* 再点同一个标签则收回（Word/WPS 都是这个手感）。
*/
function ribbonSelect(state, id) {
	if (!state.collapsed) return state.tab === id ? state : {
		...state,
		tab: id,
		peek: false
	};
	if (state.peek && state.tab === id) return {
		...state,
		peek: false
	};
	return {
		tab: id,
		collapsed: true,
		peek: true
	};
}
/** 双击选项卡（或点收起箭头）：在"固定展开"与"固定收起"之间切，顺手清掉临时展开。 */
function ribbonToggleCollapsed(state) {
	return {
		tab: state.tab,
		collapsed: !state.collapsed,
		peek: false
	};
}
/** Esc / 点到面板外面：只收回临时展开，不动固定状态。 */
function ribbonDismiss(state) {
	return state.peek ? {
		...state,
		peek: false
	} : state;
}
/**
* 把一次按键映射到选项卡 id。只认单字符、大小写不敏感、先到先得。
* 多字符（`Enter`、`ArrowLeft`）一律不认：那些键在 Ribbon 里另有语义。
*/
function ribbonKeyTip(items, key) {
	if (key.length !== 1) return void 0;
	const wanted = key.toLowerCase();
	for (const item of items) if (item.keyTip !== void 0 && item.keyTip.length > 0 && item.keyTip.toLowerCase() === wanted) return item.id;
}
/** 有没有任何标签配了 Key Tip——没配就别在按 `Alt` 时弹一排空提示。 */
function ribbonHasKeyTips(items) {
	return items.some((item) => item.keyTip !== void 0 && item.keyTip.length > 0);
}
//#endregion
exports.createRibbonChrome = createRibbonChrome;
exports.packRibbon = packRibbon;
exports.ribbonDismiss = ribbonDismiss;
exports.ribbonHasKeyTips = ribbonHasKeyTips;
exports.ribbonKeyTip = ribbonKeyTip;
exports.ribbonPanelOpen = ribbonPanelOpen;
exports.ribbonProbeSize = ribbonProbeSize;
exports.ribbonSelect = ribbonSelect;
exports.ribbonSmallerSize = ribbonSmallerSize;
exports.ribbonToggleCollapsed = ribbonToggleCollapsed;
