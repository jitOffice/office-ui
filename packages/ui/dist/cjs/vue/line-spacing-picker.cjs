const require_presets = require("../shell/presets.cjs");
const require_number_field = require("../shell/number-field.cjs");
let vue = require("vue");
//#region src/vue/line-spacing-picker.ts
/**
* `OjLineSpacingPicker`（03 §3 / M2）：行距档位列表。
*
* 行距存的是**倍数**（1 / 1.15 / 1.5 / 2），不是 px：Word/WPS 的"多倍行距"就是这个语义，
* 存 px 会在换字号时失真（14px 文字配 21px 行高，换成 32px 就挤成一团）。
*
* 选中态用 `aria-selected` 而不是只加 class：`role="listbox"` 里读屏靠它播报"当前第几项"。
*/
var OjLineSpacingPicker = (0, vue.defineComponent)({
	name: "OjLineSpacingPicker",
	props: {
		modelValue: {
			type: Number,
			required: true
		},
		presets: {
			type: Array,
			default: () => require_presets.LINE_SPACING_PRESETS
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
			...require_presets.LINE_SPACING_RANGE,
			precision: 2
		});
		const current = () => require_number_field.clampNumber(props.modelValue, bounds());
		function select(value) {
			const next = require_number_field.clampNumber(value, bounds());
			if (next === current()) return;
			emit("update:modelValue", next);
		}
		return () => (0, vue.h)("div", {
			class: "oj-line-spacing",
			role: "listbox",
			"aria-label": props.label,
			"data-disabled": props.disabled ? "" : void 0,
			onKeydown: (event) => {
				if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
				event.preventDefault();
				select(require_presets.stepPreset(props.presets, current(), event.key === "ArrowUp" ? 1 : -1));
			}
		}, [...props.presets].sort((a, b) => a - b).map((preset) => (0, vue.h)("button", {
			type: "button",
			class: "oj-line-spacing__option",
			role: "option",
			"aria-selected": preset === require_presets.nearestPreset(props.presets, current()) ? "true" : "false",
			"data-active": preset === require_presets.nearestPreset(props.presets, current()) ? "" : void 0,
			disabled: props.disabled,
			onClick: () => select(preset)
		}, [(0, vue.h)("span", {
			class: "oj-line-spacing__lines",
			"aria-hidden": "true",
			style: { gap: `${Math.max(2, (preset - 1) * 6 + 2)}px` }
		}, [(0, vue.h)("i", { class: "oj-line-spacing__line" }), (0, vue.h)("i", { class: "oj-line-spacing__line" })]), (0, vue.h)("span", { class: "oj-line-spacing__value" }, require_presets.formatLineSpacing(preset))])));
	}
});
//#endregion
exports.OjLineSpacingPicker = OjLineSpacingPicker;
