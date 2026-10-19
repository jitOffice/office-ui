import { selectByKey } from "../shell/tabs.js";
import { defineComponent, h } from "vue";
//#region src/vue/tabs.ts
var OjTabs = defineComponent({
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
		return () => h("div", {
			class: "oj-tabs",
			role: "tablist",
			onKeydown: (event) => {
				const next = selectByKey(props.items.map((item) => item.id), props.modelValue, event.key);
				if (next === props.modelValue) return;
				event.preventDefault();
				emit("update:modelValue", next);
			}
		}, props.items.map((item) => {
			const selected = item.id === props.modelValue;
			return h("button", {
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
export { OjTabs };
