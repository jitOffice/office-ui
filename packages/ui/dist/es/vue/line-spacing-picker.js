import { LINE_SPACING_PRESETS, LINE_SPACING_RANGE, formatLineSpacing, nearestPreset, stepPreset } from "../shell/presets.js";
import { clampNumber } from "../shell/number-field.js";
import { defineComponent, h } from "vue";
//#region src/vue/line-spacing-picker.ts
/**
* `OjLineSpacingPicker`（03 §3 / M2）：行距档位列表。
*
* 行距存的是**倍数**（1 / 1.15 / 1.5 / 2），不是 px：Word/WPS 的"多倍行距"就是这个语义，
* 存 px 会在换字号时失真（14px 文字配 21px 行高，换成 32px 就挤成一团）。
*
* 选中态用 `aria-selected` 而不是只加 class：`role="listbox"` 里读屏靠它播报"当前第几项"。
*/
var OjLineSpacingPicker = defineComponent({
	name: "OjLineSpacingPicker",
	props: {
		modelValue: {
			type: Number,
			required: true
		},
		presets: {
			type: Array,
			default: () => LINE_SPACING_PRESETS
		},
		label: {
			type: String,
			required: true
		},
		disabled: {
			type: Boolean,
			default: false
		}
	},
	emits: ["update:modelValue"],
	setup(props, { emit }) {
		const bounds = () => ({
			...LINE_SPACING_RANGE,
			precision: 2
		});
		const current = () => clampNumber(props.modelValue, bounds());
		function select(value) {
			const next = clampNumber(value, bounds());
			if (next === current()) return;
			emit("update:modelValue", next);
		}
		return () => h("div", {
			class: "oj-line-spacing",
			role: "listbox",
			"aria-label": props.label,
			"data-disabled": props.disabled ? "" : void 0,
			onKeydown: (event) => {
				if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
				event.preventDefault();
				select(stepPreset(props.presets, current(), event.key === "ArrowUp" ? 1 : -1));
			}
		}, [...props.presets].sort((a, b) => a - b).map((preset) => h("button", {
			type: "button",
			class: "oj-line-spacing__option",
			role: "option",
			"aria-selected": preset === nearestPreset(props.presets, current()) ? "true" : "false",
			"data-active": preset === nearestPreset(props.presets, current()) ? "" : void 0,
			disabled: props.disabled,
			onClick: () => select(preset)
		}, [h("span", {
			class: "oj-line-spacing__lines",
			"aria-hidden": "true",
			style: { gap: `${Math.max(2, (preset - 1) * 6 + 2)}px` }
		}, [h("i", { class: "oj-line-spacing__line" }), h("i", { class: "oj-line-spacing__line" })]), h("span", { class: "oj-line-spacing__value" }, formatLineSpacing(preset))])));
	}
});
//#endregion
export { OjLineSpacingPicker };
