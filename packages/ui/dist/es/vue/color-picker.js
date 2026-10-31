import { COLOR_SWATCH_GROUPS, isCssColor, normalizeHex } from "../shell/color.js";
import { defineComponent, h } from "vue";
//#region src/vue/color-picker.ts
/**
* `OjColorPicker`（03 §3 / M2）。
*
* 两个刻意的取舍：
*   1. 色板样本是 **token 引用**（`var(--oj-brand-6)`），不是十六进制——选完写进文档的是
*      token，暗色档位与主题切换才会跟着变；
*   2. 自定义色**只在提交时归一**（`#abc` → `#aabbcc`），输入过程中不重写输入框，
*      否则用户打到第三个字符就被"补全"掉了。
*
* a11y：整体是 `listbox`，每块色是 `option`；色块本身没有文字，所以必须有 `swatchLabel`
* 提供可访问名（默认回退到颜色值本身，读屏会念 `#3366FF`——不优雅但可辨认）。
*/
var OjColorPicker = defineComponent({
	name: "OjColorPicker",
	props: {
		modelValue: {
			type: String,
			required: true
		},
		groups: {
			type: Array,
			default: () => COLOR_SWATCH_GROUPS
		},
		label: {
			type: String,
			required: true
		},
		/** 自定义色的输入框标签；不给就不渲染自定义栏。 */
		customLabel: {
			type: String,
			default: ""
		},
		swatchLabel: {
			type: Function,
			default: void 0
		},
		disabled: {
			type: Boolean,
			default: false
		}
	},
	emits: ["update:modelValue"],
	setup(props, { emit }) {
		let draft = null;
		const nameOf = (value) => props.swatchLabel?.(value) ?? value;
		function commitCustom() {
			if (draft === null) return;
			const raw = draft;
			draft = null;
			const hex = normalizeHex(raw);
			if (hex !== void 0) {
				emit("update:modelValue", hex);
				return;
			}
			if (isCssColor(raw)) emit("update:modelValue", raw.trim());
		}
		return () => h("div", {
			class: "oj-color-picker",
			role: "listbox",
			"aria-label": props.label
		}, [...props.groups.flatMap((group) => [h("div", {
			class: "oj-color-picker__group",
			role: "group",
			"aria-label": group.id
		}, group.values.map((value) => h("button", {
			type: "button",
			class: "oj-color-picker__swatch",
			role: "option",
			"aria-label": nameOf(value),
			"aria-selected": value === props.modelValue ? "true" : "false",
			"data-active": value === props.modelValue ? "" : void 0,
			"data-transparent": value === "transparent" ? "" : void 0,
			style: { background: value },
			disabled: props.disabled,
			onClick: () => {
				if (value === props.modelValue) return;
				emit("update:modelValue", value);
			}
		})))]), props.customLabel ? h("div", { class: "oj-color-picker__custom" }, [h("span", { class: "oj-color-picker__custom-label" }, props.customLabel), h("input", {
			class: "oj-color-picker__hex",
			type: "text",
			"aria-label": props.customLabel,
			value: draft ?? props.modelValue,
			disabled: props.disabled,
			onInput: (event) => {
				draft = event.target.value;
			},
			onBlur: () => commitCustom(),
			onKeydown: (event) => {
				if (event.key !== "Enter") return;
				event.preventDefault();
				commitCustom();
			}
		})]) : null]);
	}
});
//#endregion
export { OjColorPicker };
