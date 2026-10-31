const require_gallery = require("../shell/gallery.cjs");
let vue = require("vue");
//#region src/vue/gallery.ts
/**
* `OjGallery`（03 §3 / M2）：通用网格选择。
*
* 与 `OjRibbonGallery` 的分工：那个是 Ribbon 里的**溢出条目**（一行放不下就滚动），
* 这个是**独立面板里的网格**（列数固定、方向键按行列走）。两者共用 `galleryNeighbor`，
* 因为"上下键跳一整行"的边界算法只该有一份。
*
* 选中项用 `aria-selected`；网格外壳是 `role="listbox"`，每项 `role="option"`。
*/
var OjGallery = (0, vue.defineComponent)({
	name: "OjGallery",
	props: {
		items: {
			type: Array,
			required: true
		},
		modelValue: {
			type: String,
			required: true
		},
		label: {
			type: String,
			required: true
		},
		columns: {
			type: Number,
			default: 4
		},
		disabled: {
			type: Boolean,
			default: false
		}
	},
	emits: ["update:modelValue"],
	setup(props, { emit }) {
		const columns = () => Number.isFinite(props.columns) && props.columns >= 1 ? Math.floor(props.columns) : 1;
		return () => (0, vue.h)("div", {
			class: "oj-gallery",
			role: "listbox",
			"aria-label": props.label,
			"data-disabled": props.disabled ? "" : void 0,
			style: { gridTemplateColumns: `repeat(${columns()}, minmax(0, 1fr))` },
			onKeydown: (event) => {
				const index = props.items.findIndex((item) => item.id === props.modelValue);
				if (index === -1) return;
				const next = require_gallery.galleryNeighbor(columns(), props.items.length, index, event.key);
				if (next === index) return;
				event.preventDefault();
				const item = props.items[next];
				if (item !== void 0) emit("update:modelValue", item.id);
			}
		}, props.items.map((item) => (0, vue.h)("button", {
			key: item.id,
			type: "button",
			class: "oj-gallery__item",
			role: "option",
			"aria-selected": item.id === props.modelValue ? "true" : "false",
			"data-active": item.id === props.modelValue ? "" : void 0,
			disabled: props.disabled,
			onClick: () => {
				if (item.id === props.modelValue) return;
				emit("update:modelValue", item.id);
			}
		}, [(0, vue.h)("span", { class: "oj-gallery__label" }, item.label), item.description === void 0 ? null : (0, vue.h)("span", { class: "oj-gallery__description" }, item.description)])));
	}
});
//#endregion
exports.OjGallery = OjGallery;
