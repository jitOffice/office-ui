const require_popper = require("../popper.cjs");
let vue = require("vue");
//#region src/vue/popper.ts
/** 元素 → 视口矩形。`anchorBox` 优先：canvas 右键坐标没有元素可量。 */
function anchorOf(el, box) {
	if (box !== null) return {
		x: box.x,
		y: box.y,
		width: box.width,
		height: box.height
	};
	if (el === null) return null;
	const rect = el.getBoundingClientRect();
	return {
		x: rect.left,
		y: rect.top,
		width: rect.width,
		height: rect.height
	};
}
var OjPopper = (0, vue.defineComponent)({
	name: "OjPopper",
	props: {
		open: {
			type: Boolean,
			required: true
		},
		anchor: {
			type: Object,
			default: null
		},
		/**
		* 锚**矩形**（视口坐标），优先级高于 `anchor`。
		*
		* 03 §3 D 组点名的两种场景都落在这里：canvas 上的右键坐标（没有 DOM 目标，
		* 矩形退化成零尺寸点）与文本选区的包围盒（锚点是一片区域，不是一个元素）。
		*/
		anchorBox: {
			type: Object,
			default: null
		},
		placement: {
			type: String,
			default: "bottom-start"
		}
	},
	setup(props, { slots }) {
		const panel = (0, vue.ref)(null);
		const x = (0, vue.ref)(0);
		const y = (0, vue.ref)(0);
		const placed = (0, vue.ref)(false);
		function update() {
			const el = panel.value;
			if (!props.open || !el) return;
			const box = anchorOf(props.anchor, props.anchorBox);
			if (box === null) return;
			const popup = el.getBoundingClientRect();
			const next = require_popper.placePopper({
				anchor: box,
				popup: {
					width: popup.width,
					height: popup.height
				},
				viewport: {
					width: window.innerWidth,
					height: window.innerHeight
				},
				placement: props.placement
			});
			x.value = next.x;
			y.value = next.y;
			placed.value = true;
		}
		(0, vue.onMounted)(() => {
			(0, vue.nextTick)(update);
		});
		(0, vue.watch)(() => props.open, (open) => {
			if (!open) placed.value = false;
			else (0, vue.nextTick)(update);
		});
		(0, vue.watch)(() => [
			props.anchorBox?.x,
			props.anchorBox?.y,
			props.anchorBox?.width,
			props.anchorBox?.height
		], () => {
			if (props.open) (0, vue.nextTick)(update);
		});
		return () => {
			if (!props.open) return null;
			return (0, vue.h)("div", {
				ref: panel,
				class: "oj-popper",
				style: {
					left: `${x.value}px`,
					top: `${y.value}px`,
					visibility: placed.value ? "visible" : "hidden"
				}
			}, slots.default?.());
		};
	}
});
//#endregion
exports.OjPopper = OjPopper;
