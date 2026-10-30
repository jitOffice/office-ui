import { galleryNeighbor } from "../shell/gallery.js";
import { OjIcon } from "./icon.js";
import { defineComponent, h, ref, watch } from "vue";
//#region src/vue/ribbon-gallery.ts
/**
* `OjRibbonGallery`（03 §3 B 组 🟡）：命令的网格陈列（样式库、符号）。
*
* 网格的键盘模型和普通列表不一样：上下要按**整行**跳、左右按格跳，且最后一行不满
* 也不能走出边界。这段规则放在 `galleryNeighbor`（零依赖、有单测），组件只负责
* roving tabindex 与把焦点真的挪过去。
*/
var OjRibbonGallery = defineComponent({
	name: "OjRibbonGallery",
	props: {
		items: {
			type: Array,
			required: true
		},
		columns: {
			type: Number,
			default: 4
		},
		label: {
			type: String,
			default: void 0
		}
	},
	emits: ["select"],
	setup(props, { slots, emit }) {
		const root = ref(null);
		const focused = ref(0);
		watch(() => props.items.length, (length) => {
			if (focused.value > length - 1) focused.value = Math.max(0, length - 1);
		});
		function cells() {
			return [...root.value?.querySelectorAll("[data-gallery-item]") ?? []];
		}
		function focusItem(index) {
			cells()[index]?.focus();
		}
		/**
		* 从 `from` 出发沿 `direction` 找第一个能聚焦的格子。
		* 禁用的 `<button>` 收不到焦点——直接 `focus()` 会静默失败，焦点留在原地，
		* 用户按了方向键却什么都没发生。
		*/
		function nearestEnabled(from, direction) {
			const nodes = cells();
			for (let i = from; i >= 0 && i < nodes.length; i += direction) if (!nodes[i].disabled) return i;
		}
		function onKeydown(event) {
			const target = galleryNeighbor(props.columns, props.items.length, focused.value, event.key);
			if (target === focused.value) return;
			event.preventDefault();
			const direction = target > focused.value ? 1 : -1;
			let index = nearestEnabled(target, direction);
			if (index === void 0) index = nearestEnabled(target, direction === 1 ? -1 : 1);
			if (index === void 0) return;
			focused.value = index;
			focusItem(index);
		}
		return () => {
			const columns = Number.isFinite(props.columns) && props.columns >= 1 ? Math.floor(props.columns) : 1;
			return h("div", {
				ref: root,
				class: "oj-ribbon-gallery",
				role: "group",
				"aria-label": props.label,
				style: { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` },
				onKeydown
			}, props.items.map((item, index) => h("button", {
				type: "button",
				class: "oj-ribbon-gallery__item",
				"data-gallery-item": "",
				"data-item": item.id,
				"data-active": item.active ? "" : void 0,
				disabled: item.disabled || void 0,
				tabindex: index === focused.value ? 0 : -1,
				onClick: () => {
					if (item.disabled) return;
					focused.value = index;
					emit("select", item.id);
				}
			}, slots.item?.({
				item,
				index
			}) ?? [item.icon ? h(OjIcon, {
				name: item.icon,
				decorative: true
			}) : null, h("span", { class: "oj-ribbon-gallery__label" }, item.label)])));
		};
	}
});
//#endregion
export { OjRibbonGallery };
