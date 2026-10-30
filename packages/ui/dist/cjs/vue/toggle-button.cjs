const require_icon = require("./icon.cjs");
let vue = require("vue");
//#region src/vue/toggle-button.ts
/**
* `OjToggleButton`（03 §3 B 组）：自己记按下态，用于格式刷、修订模式这类**本地开关**。
*
* 和 `OjCommandButton` 的区别是状态从哪来：命令按钮的状态由注册表推给它（唯一事实来源），
* 开关按钮的状态属于使用方（`v-model`）。两者都用 `aria-pressed`——用 `data-active` 只做样式
* 而不给读屏一个说法，是这类控件最常见的无障碍缺口。
*/
var OjToggleButton = (0, vue.defineComponent)({
	name: "OjToggleButton",
	props: {
		modelValue: {
			type: Boolean,
			required: true
		},
		label: {
			type: String,
			required: true
		},
		icon: {
			type: String,
			default: void 0
		},
		disabled: {
			type: Boolean,
			default: false
		},
		size: {
			type: String,
			default: "medium"
		}
	},
	emits: ["update:modelValue"],
	setup(props, { slots, emit }) {
		return () => (0, vue.h)("button", {
			type: "button",
			class: "oj-button",
			"data-size": props.size === "mini" ? "mini" : void 0,
			"data-active": props.modelValue ? "" : void 0,
			"aria-pressed": props.modelValue ? "true" : "false",
			disabled: props.disabled || void 0,
			onClick: () => {
				if (props.disabled) return;
				emit("update:modelValue", !props.modelValue);
			}
		}, [props.icon ? (0, vue.h)(require_icon.OjIcon, {
			name: props.icon,
			decorative: true
		}) : null, (0, vue.h)("span", { class: "oj-button__label" }, slots.default?.() ?? props.label)]);
	}
});
//#endregion
exports.OjToggleButton = OjToggleButton;
