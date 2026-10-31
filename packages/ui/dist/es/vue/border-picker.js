import { BORDER_COLORS, BORDER_STYLES, BORDER_WIDTHS, borderCss, formatBorderWidth, normalizeBorder } from "../shell/border.js";
import { defineComponent, h } from "vue";
//#region src/vue/border-picker.ts
/**
* `OjBorderPicker`（03 §3 / M2）：线型 + 线宽 + 颜色。
*
* 三个维度写在同一张卡片里、一次 `change` 出去，而不是三次独立的 `update:*`：
* 选线型时宽度会从 1 变成 0（`none` 的语义），如果拆成三个事件，
* 使用方会收到"线型变了但宽度还是 1"的中间态，写进文档后就是一条看不见的 1px 线。
*
* 预览块直接用 `borderCss()` 生成：与"应用到选区"走同一个函数，
* 两套字符串拼法迟早会不一致（预览是虚线、文档里是实线）。
*/
var OjBorderPicker = defineComponent({
	name: "OjBorderPicker",
	props: {
		modelValue: {
			type: Object,
			default: () => ({})
		},
		label: {
			type: String,
			required: true
		},
		widthLabel: {
			type: String,
			required: true
		},
		colorLabel: {
			type: String,
			required: true
		},
		/** 线型显示名（语言相关）。 */
		styleLabels: {
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
		const value = () => normalizeBorder(props.modelValue);
		const styleName = (style) => props.styleLabels[style] ?? style;
		function apply(patch) {
			const current = value();
			const next = normalizeBorder({
				...current,
				...patch
			});
			if (next.style === current.style && next.width === current.width && next.color === current.color) return;
			emit("update:modelValue", next);
		}
		return () => {
			const current = value();
			return h("div", {
				class: "oj-border-picker",
				role: "group",
				"aria-label": props.label
			}, [
				h("div", {
					class: "oj-border-picker__styles",
					role: "group",
					"aria-label": props.label
				}, BORDER_STYLES.map((style) => h("button", {
					key: style,
					type: "button",
					class: "oj-border-picker__style",
					"aria-label": styleName(style),
					"aria-pressed": current.style === style ? "true" : "false",
					"data-active": current.style === style ? "" : void 0,
					disabled: props.disabled,
					onClick: () => apply({ style })
				}, h("span", {
					class: "oj-border-picker__sample",
					"aria-hidden": "true",
					style: { borderBottom: borderCss({
						...current,
						style
					}) }
				})))),
				h("label", { class: "oj-border-picker__field" }, [h("span", { class: "oj-border-picker__field-label" }, props.widthLabel), h("select", {
					class: "oj-border-picker__width",
					"aria-label": props.widthLabel,
					disabled: props.disabled,
					value: String(current.width),
					onChange: (event) => apply({ width: Number(event.target.value) })
				}, BORDER_WIDTHS.map((width) => h("option", {
					value: String(width),
					selected: width === current.width
				}, formatBorderWidth(width))))]),
				h("div", {
					class: "oj-border-picker__colors",
					role: "group",
					"aria-label": props.colorLabel
				}, BORDER_COLORS.map((color) => h("button", {
					key: color,
					type: "button",
					class: "oj-border-picker__color",
					"aria-label": color,
					"aria-pressed": current.color === color ? "true" : "false",
					"data-active": current.color === color ? "" : void 0,
					style: { background: color },
					disabled: props.disabled,
					onClick: () => apply({ color })
				}))),
				h("span", {
					class: "oj-border-picker__preview",
					"aria-hidden": "true",
					style: { border: borderCss(current) }
				})
			]);
		};
	}
});
//#endregion
export { OjBorderPicker };
