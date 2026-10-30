let vue = require("vue");
//#region src/vue/ribbon-tab.ts
/**
* `OjRibbonTab`（03 §3 B 组）：一个选项卡按钮。
*
* 刻意不做键盘：方向键与 `Home`/`End` 是 **tablist** 的语义（roving tabindex），
* 逻辑在 `OjRibbon` 上；Key Tip 的**显示时机**也归 `OjRibbon`（Alt 的 keyup 事件在文档层）。
* 这里只负责 `role="tab"`、`aria-selected`、点击，以及那枚提示键的渲染。
*/
var OjRibbonTab = (0, vue.defineComponent)({
	name: "OjRibbonTab",
	props: {
		id: {
			type: String,
			required: true
		},
		label: {
			type: String,
			required: true
		},
		selected: {
			type: Boolean,
			default: false
		},
		keyTip: {
			type: String,
			default: void 0
		},
		/** 按 `Alt` 期间才显示提示键 */
		showKeyTip: {
			type: Boolean,
			default: false
		}
	},
	emits: ["select"],
	setup(props, { slots, emit }) {
		return () => {
			const tip = props.keyTip !== void 0 && props.keyTip.length > 0 ? props.keyTip.toUpperCase() : void 0;
			return (0, vue.h)("button", {
				type: "button",
				class: "oj-ribbon__tab",
				role: "tab",
				id: `oj-ribbon-tab-${props.id}`,
				"data-tab": props.id,
				"aria-selected": props.selected ? "true" : "false",
				"aria-controls": `oj-ribbon-panel-${props.id}`,
				"aria-keyshortcuts": tip === void 0 ? void 0 : `Alt+${tip}`,
				tabindex: props.selected ? 0 : -1,
				onClick: () => emit("select", props.id)
			}, [slots.default?.() ?? props.label, props.showKeyTip && tip !== void 0 ? (0, vue.h)("span", {
				class: "oj-ribbon__keytip",
				"aria-hidden": "true"
			}, tip) : null]);
		};
	}
});
//#endregion
exports.OjRibbonTab = OjRibbonTab;
