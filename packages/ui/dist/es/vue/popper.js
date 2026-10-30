import { placePopper } from "../popper.js";
import { defineComponent, h, nextTick, onMounted, ref, watch } from "vue";
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
var OjPopper = defineComponent({
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
		const panel = ref(null);
		const x = ref(0);
		const y = ref(0);
		const placed = ref(false);
		function update() {
			const el = panel.value;
			if (!props.open || !el) return;
			const box = anchorOf(props.anchor, props.anchorBox);
			if (box === null) return;
			const popup = el.getBoundingClientRect();
			const next = placePopper({
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
		onMounted(() => {
			nextTick(update);
		});
		watch(() => props.open, (open) => {
			if (!open) placed.value = false;
			else nextTick(update);
		});
		watch(() => [
			props.anchorBox?.x,
			props.anchorBox?.y,
			props.anchorBox?.width,
			props.anchorBox?.height
		], () => {
			if (props.open) nextTick(update);
		});
		return () => {
			if (!props.open) return null;
			return h("div", {
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
export { OjPopper };
