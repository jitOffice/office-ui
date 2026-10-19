const require_tabs = require("../shell/tabs.cjs");
let vue = require("vue");
//#region src/vue/tabs.ts
var OjTabs = (0, vue.defineComponent)({
	name: "OjTabs",
	props: {
		items: {
			type: Array,
			required: true
		},
		modelValue: {
			type: String,
			required: true
		}
	},
	emits: ["update:modelValue"],
	setup(props, { emit }) {
		return () => (0, vue.h)("div", {
			class: "oj-tabs",
			role: "tablist",
			onKeydown: (event) => {
				const next = require_tabs.selectByKey(props.items.map((item) => item.id), props.modelValue, event.key);
				if (next === props.modelValue) return;
				event.preventDefault();
				emit("update:modelValue", next);
			}
		}, props.items.map((item) => {
			const selected = item.id === props.modelValue;
			return (0, vue.h)("button", {
				type: "button",
				class: "oj-tabs__tab",
				role: "tab",
				id: `oj-tab-${item.id}`,
				"aria-selected": selected ? "true" : "false",
				tabindex: selected ? 0 : -1,
				onClick: () => emit("update:modelValue", item.id)
			}, item.label);
		}));
	}
});
//#endregion
exports.OjTabs = OjTabs;
