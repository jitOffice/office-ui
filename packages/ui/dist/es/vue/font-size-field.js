import { FONT_SIZE_PRESETS, FONT_SIZE_RANGE, formatFontSize, nearestPreset, stepPreset } from "../shell/presets.js";
import { clampNumber, parseNumberDraft } from "../shell/number-field.js";
import { defineComponent, h } from "vue";
//#region src/vue/font-size-field.ts
/**
* `OjFontSizeField`（03 §3 / M2）：字号输入 + 档位选择。
*
* 三件事必须同时成立，否则在实际使用里会互相打架：
*   1. **可以手输**：Word 用户会直接打 17px（虽然 token 里没有这一档）；
*   2. **上下键走档位**：不是 ±1，而是 12 → 13 → 14 → 16…（Office 的行为）；
*   3. **档位与 token 对齐**：`FONT_SIZE_PRESETS` 就是 `--oj-fs-*` 那八档，
*      所以选中什么字号，`ja` / `compact` 档位降字号时它才会跟着降。
*/
var OjFontSizeField = defineComponent({
	name: "OjFontSizeField",
	props: {
		modelValue: {
			type: Number,
			required: true
		},
		presets: {
			type: Array,
			default: () => FONT_SIZE_PRESETS
		},
		label: {
			type: String,
			required: true
		},
		decreaseLabel: {
			type: String,
			required: true
		},
		increaseLabel: {
			type: String,
			required: true
		},
		/** 单位后缀（`px` / `pt`），只影响显示。 */
		unit: {
			type: String,
			default: "px"
		},
		disabled: {
			type: Boolean,
			default: false
		}
	},
	emits: ["update:modelValue"],
	setup(props, { emit }) {
		let draft = null;
		const bounds = () => ({ ...FONT_SIZE_RANGE });
		const current = () => clampNumber(props.modelValue, bounds());
		const selectedPreset = () => nearestPreset(props.presets, current());
		function commit() {
			if (draft === null) return;
			const parsed = parseNumberDraft(draft);
			draft = null;
			if (parsed === void 0) return;
			emit("update:modelValue", clampNumber(parsed, bounds()));
		}
		function bump(direction) {
			draft = null;
			const next = clampNumber(stepPreset(props.presets, current(), direction), bounds());
			if (next === current()) return;
			emit("update:modelValue", next);
		}
		function select(value) {
			const next = clampNumber(value, bounds());
			if (next === current()) return;
			emit("update:modelValue", next);
		}
		return () => h("div", {
			class: "oj-font-size",
			"data-disabled": props.disabled ? "" : void 0
		}, [
			h("button", {
				type: "button",
				class: "oj-button",
				"data-size": "mini",
				"aria-label": props.decreaseLabel,
				disabled: props.disabled,
				onClick: () => bump(-1)
			}, "−"),
			h("input", {
				class: "oj-font-size__input",
				type: "text",
				role: "spinbutton",
				inputmode: "decimal",
				"aria-label": props.label,
				"aria-valuenow": current(),
				"aria-valuemin": FONT_SIZE_RANGE.min,
				"aria-valuemax": FONT_SIZE_RANGE.max,
				disabled: props.disabled,
				value: draft ?? formatFontSize(current()),
				onInput: (event) => {
					draft = event.target.value;
				},
				onBlur: () => commit(),
				onKeydown: (event) => {
					if (event.key === "Enter") {
						event.preventDefault();
						commit();
						return;
					}
					if (event.key === "ArrowUp") {
						event.preventDefault();
						bump(1);
						return;
					}
					if (event.key === "ArrowDown") {
						event.preventDefault();
						bump(-1);
					}
				}
			}),
			h("span", {
				class: "oj-font-size__unit",
				"aria-hidden": "true"
			}, props.unit),
			h("button", {
				type: "button",
				class: "oj-button",
				"data-size": "mini",
				"aria-label": props.increaseLabel,
				disabled: props.disabled,
				onClick: () => bump(1)
			}, "+"),
			h("select", {
				class: "oj-font-size__presets",
				"aria-label": props.label,
				disabled: props.disabled,
				value: String(selectedPreset()),
				onChange: (event) => {
					const next = Number(event.target.value);
					if (Number.isFinite(next)) select(next);
				}
			}, props.presets.map((preset) => h("option", {
				value: String(preset),
				selected: preset === selectedPreset()
			}, String(preset))))
		]);
	}
});
//#endregion
export { OjFontSizeField };
