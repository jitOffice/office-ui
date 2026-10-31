const require_style_gallery = require("../shell/style-gallery.cjs");
const require_gallery = require("../shell/gallery.cjs");
let vue = require("vue");
//#region src/vue/style-gallery.ts
/**
* `OjStyleGallery`（03 §3 / M2）：段落样式画廊。
*
* 每一项都用**预设自己的排版**渲染示例文本：只显示"标题 1/2/3"等于让用户背编号，
* 而样式画廊的价值恰恰是"一眼看出层级"。
*
* 示例文本由 `sample` 给（语言相关：日文界面应该看到かな，而不是 "Aa"）。
*/
var OjStyleGallery = (0, vue.defineComponent)({
	name: "OjStyleGallery",
	props: {
		modelValue: {
			type: String,
			required: true
		},
		presets: {
			type: Array,
			default: () => require_style_gallery.STYLE_PRESETS
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
		return () => (0, vue.h)("div", {
			class: "oj-style-gallery",
			role: "listbox",
			"aria-label": props.label,
			"data-disabled": props.disabled ? "" : void 0,
			style: { gridTemplateColumns: `repeat(${columns()}, minmax(0, 1fr))` },
			onKeydown: (event) => {
				const index = props.presets.findIndex((preset) => preset.id === props.modelValue);
				if (index === -1) return;
				const next = require_gallery.galleryNeighbor(columns(), props.presets.length, index, event.key);
				if (next === index) return;
				event.preventDefault();
				const preset = props.presets[next];
				if (preset !== void 0) emit("update:modelValue", preset.id);
			}
		}, props.presets.map((preset) => (0, vue.h)("button", {
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
		}, [(0, vue.h)("span", {
			class: "oj-style-gallery__sample",
			"aria-hidden": "true",
			style: require_style_gallery.stylePresetCss(preset)
		}, props.sample), (0, vue.h)("span", { class: "oj-style-gallery__label" }, require_style_gallery.styleLabel(props.labels, preset.id))])));
	}
});
//#endregion
exports.OjStyleGallery = OjStyleGallery;
