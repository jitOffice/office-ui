import { clampNumber, parseNumberDraft, stepNumber } from "../shell/number-field.js";
import { defineComponent, h } from "vue";
//#region src/vue/number-field.ts
/**
* `OjNumberField`（03 §3）：无单位/带单位的数值输入。
*
* 输入过程**不重渲染**：`draft` 刻意是普通变量而不是 `ref`。绑成 `ref` 后每敲一个字符就会
* 用 `props.modelValue` 重算 value，光标跳到末尾——这是受控输入最经典的那个坑。
* 提交时机只有三个：失焦、回车、步进按钮。
*
* 步进按钮与方向键都走 `stepNumber`（夹取 + 精度），所以"在 1 上按减号"不会变成 0。
*/
var OjNumberField = defineComponent({
	name: "OjNumberField",
	props: {
		modelValue: {
			type: Number,
			required: true
		},
		min: {
			type: Number,
			default: void 0
		},
		max: {
			type: Number,
			default: void 0
		},
		step: {
			type: Number,
			default: 1
		},
		precision: {
			type: Number,
			default: 0
		},
		/** 输入框的可访问名。按钮另有自己的标签，不共用。 */
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
		suffix: {
			type: String,
			default: ""
		},
		disabled: {
			type: Boolean,
			default: false
		}
	},
	emits: ["update:modelValue"],
	setup(props, { emit }) {
		let draft = null;
		const bounds = () => ({
			min: props.min,
			max: props.max,
			step: props.step,
			precision: props.precision
		});
		const current = () => clampNumber(props.modelValue, bounds());
		const text = () => draft === null ? `${current()}${props.suffix}` : draft;
		function commit() {
			if (draft === null) return;
			const parsed = parseNumberDraft(draft);
			draft = null;
			if (parsed === void 0) return;
			emit("update:modelValue", clampNumber(parsed, bounds()));
		}
		function bump(direction) {
			draft = null;
			const next = stepNumber(props.modelValue, direction, bounds());
			if (next === current()) return;
			emit("update:modelValue", next);
		}
		return () => h("div", {
			class: "oj-number-field",
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
				class: "oj-number-field__input",
				type: "text",
				role: "spinbutton",
				inputmode: "decimal",
				"aria-label": props.label,
				"aria-valuenow": current(),
				"aria-valuemin": props.min,
				"aria-valuemax": props.max,
				"aria-disabled": props.disabled ? "true" : void 0,
				disabled: props.disabled,
				value: text(),
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
						return;
					}
					if (event.key === "Escape") {
						draft = null;
						event.target.value = text();
					}
				}
			}),
			h("button", {
				type: "button",
				class: "oj-button",
				"data-size": "mini",
				"aria-label": props.increaseLabel,
				disabled: props.disabled,
				onClick: () => bump(1)
			}, "+")
		]);
	}
});
//#endregion
export { OjNumberField };
