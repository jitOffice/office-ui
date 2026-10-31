import { STYLE_PRESETS, styleLabel, stylePresetCss } from "../shell/style-gallery.js";
import { galleryNeighbor } from "../shell/gallery.js";
import { defineComponent, h } from "vue";
//#region src/vue/style-gallery.ts
/**
* `OjStyleGallery`（03 §3 / M2）：段落样式画廊。
*
* 每一项都用**预设自己的排版**渲染示例文本：只显示"标题 1/2/3"等于让用户背编号，
* 而样式画廊的价值恰恰是"一眼看出层级"。
*
* 示例文本由 `sample` 给（语言相关：日文界面应该看到かな，而不是 "Aa"）。
*/
var OjStyleGallery = defineComponent({
	name: "OjStyleGallery",
	props: {
		modelValue: {
			type: String,
			required: true
		},
		presets: {
			type: Array,
			default: () => STYLE_PRESETS
		},
		label: {
			type: String,
			required: true
		},
		labels: {
			type: Object,
			default: () => ({})
		},
		sample: {
			type: String,
			default: "Aa"
		},
		columns: {
			type: Number,
			default: 3
		},
		disabled: {
			type: Boolean,
			default: false
		}
	},
	emits: ["update:modelValue"],
	setup(props, { emit }) {
		const columns = () => Number.isFinite(props.columns) && props.columns >= 1 ? Math.floor(props.columns) : 1;
		return () => h("div", {
			class: "oj-style-gallery",
			role: "listbox",
			"aria-label": props.label,
			"data-disabled": props.disabled ? "" : void 0,
			style: { gridTemplateColumns: `repeat(${columns()}, minmax(0, 1fr))` },
			onKeydown: (event) => {
				const index = props.presets.findIndex((preset) => preset.id === props.modelValue);
				if (index === -1) return;
				const next = galleryNeighbor(columns(), props.presets.length, index, event.key);
				if (next === index) return;
				event.preventDefault();
				const preset = props.presets[next];
				if (preset !== void 0) emit("update:modelValue", preset.id);
			}
		}, props.presets.map((preset) => h("button", {
			key: preset.id,
			type: "button",
			class: "oj-style-gallery__item",
			role: "option",
			"aria-selected": preset.id === props.modelValue ? "true" : "false",
			"data-active": preset.id === props.modelValue ? "" : void 0,
			disabled: props.disabled,
			onClick: () => {
				if (preset.id === props.modelValue) return;
				emit("update:modelValue", preset.id);
			}
		}, [h("span", {
			class: "oj-style-gallery__sample",
			"aria-hidden": "true",
			style: stylePresetCss(preset)
		}, props.sample), h("span", { class: "oj-style-gallery__label" }, styleLabel(props.labels, preset.id))])));
	}
});
//#endregion
export { OjStyleGallery };
