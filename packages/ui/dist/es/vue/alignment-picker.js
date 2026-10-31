import { HORIZONTAL_ALIGNS, VERTICAL_ALIGNS, normalizeAlignment, stepHorizontal, stepVertical, textAlignCss, verticalAlignCss } from "../shell/alignment.js";
import { defineComponent, h } from "vue";
//#region src/vue/alignment-picker.ts
/**
* `OjAlignmentPicker`（03 §3 / M2）。
*
* 两组按钮而不是一个 3×3 网格：Office 的水平与垂直对齐是两个独立命令，
* 合成九宫格后"两端对齐 + 垂直居中"就没有位置可点了（9 格只表示"两端对齐除外"的组合）。
*
* 图标用内联 SVG 而不是字体图标（00 §4 红线 2）：线条全部 `currentColor`，
* 颜色跟着按钮状态走，不需要额外维护一套图标字体。
*/
var HORIZONTAL_GLYPHS = {
	left: "<svg viewBox=\"0 0 16 16\" fill=\"currentColor\"><rect x=\"2\" y=\"3\" width=\"12\" height=\"1.5\"/><rect x=\"2\" y=\"7.25\" width=\"8\" height=\"1.5\"/><rect x=\"2\" y=\"11.5\" width=\"12\" height=\"1.5\"/></svg>",
	center: "<svg viewBox=\"0 0 16 16\" fill=\"currentColor\"><rect x=\"2\" y=\"3\" width=\"12\" height=\"1.5\"/><rect x=\"4\" y=\"7.25\" width=\"8\" height=\"1.5\"/><rect x=\"2\" y=\"11.5\" width=\"12\" height=\"1.5\"/></svg>",
	right: "<svg viewBox=\"0 0 16 16\" fill=\"currentColor\"><rect x=\"2\" y=\"3\" width=\"12\" height=\"1.5\"/><rect x=\"6\" y=\"7.25\" width=\"8\" height=\"1.5\"/><rect x=\"2\" y=\"11.5\" width=\"12\" height=\"1.5\"/></svg>",
	justify: "<svg viewBox=\"0 0 16 16\" fill=\"currentColor\"><rect x=\"2\" y=\"3\" width=\"12\" height=\"1.5\"/><rect x=\"2\" y=\"7.25\" width=\"12\" height=\"1.5\"/><rect x=\"2\" y=\"11.5\" width=\"12\" height=\"1.5\"/></svg>"
};
var VERTICAL_GLYPHS = {
	top: "<svg viewBox=\"0 0 16 16\" fill=\"currentColor\"><rect x=\"2\" y=\"2\" width=\"12\" height=\"1.5\"/><rect x=\"5\" y=\"5\" width=\"6\" height=\"9\"/></svg>",
	middle: "<svg viewBox=\"0 0 16 16\" fill=\"currentColor\"><rect x=\"2\" y=\"7.25\" width=\"12\" height=\"1.5\"/><rect x=\"5\" y=\"4\" width=\"6\" height=\"8\"/></svg>",
	bottom: "<svg viewBox=\"0 0 16 16\" fill=\"currentColor\"><rect x=\"2\" y=\"12.5\" width=\"12\" height=\"1.5\"/><rect x=\"5\" y=\"2\" width=\"6\" height=\"9\"/></svg>"
};
var OjAlignmentPicker = defineComponent({
	name: "OjAlignmentPicker",
	props: {
		modelValue: {
			type: Object,
			default: () => ({})
		},
		label: {
			type: String,
			required: true
		},
		/** 每个按钮的可访问名（语言相关，由使用方给）；缺省时用 id。 */
		itemLabels: {
			type: Object,
			default: () => ({})
		},
		disabled: {
			type: Boolean,
			default: false
		}
	},
	emits: ["update:modelValue"],
	setup(props, { emit }) {
		const value = () => normalizeAlignment(props.modelValue);
		const nameOf = (key) => props.itemLabels[key] ?? key;
		function apply(next) {
			const current = value();
			if (next.horizontal === current.horizontal && next.vertical === current.vertical) return;
			emit("update:modelValue", next);
		}
		function button(key, glyph, pressed, onClick) {
			return h("button", {
				key,
				type: "button",
				class: "oj-alignment__button",
				"aria-label": nameOf(key),
				"aria-pressed": pressed ? "true" : "false",
				"data-active": pressed ? "" : void 0,
				disabled: props.disabled,
				onClick
			}, h("span", {
				class: "oj-alignment__glyph",
				"aria-hidden": "true",
				innerHTML: glyph
			}));
		}
		return () => {
			const current = value();
			return h("div", {
				class: "oj-alignment",
				role: "group",
				"aria-label": props.label,
				onKeydown: (event) => {
					const now = value();
					if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
						event.preventDefault();
						apply({
							horizontal: stepHorizontal(now.horizontal, event.key === "ArrowRight" ? 1 : -1),
							vertical: now.vertical
						});
					}
					if (event.key === "ArrowUp" || event.key === "ArrowDown") {
						event.preventDefault();
						apply({
							horizontal: now.horizontal,
							vertical: stepVertical(now.vertical, event.key === "ArrowDown" ? 1 : -1)
						});
					}
				}
			}, [h("div", {
				class: "oj-alignment__row",
				role: "group",
				"aria-label": nameOf("horizontal")
			}, [...HORIZONTAL_ALIGNS.map((align) => button(align, HORIZONTAL_GLYPHS[align], current.horizontal === align, () => apply({
				horizontal: align,
				vertical: current.vertical
			}))), h("span", {
				class: "oj-alignment__preview",
				"aria-hidden": "true",
				style: { textAlign: textAlignCss(current.horizontal) }
			}, "Abc")]), h("div", {
				class: "oj-alignment__row",
				role: "group",
				"aria-label": nameOf("vertical")
			}, [...VERTICAL_ALIGNS.map((align) => button(align, VERTICAL_GLYPHS[align], current.vertical === align, () => apply({
				horizontal: current.horizontal,
				vertical: align
			}))), h("span", {
				class: "oj-alignment__preview oj-alignment__preview--vertical",
				"aria-hidden": "true",
				style: { verticalAlign: verticalAlignCss(current.vertical) }
			}, "Abc")])]);
		};
	}
});
//#endregion
export { OjAlignmentPicker };
