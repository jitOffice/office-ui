import { defineComponent, h, ref } from "vue";
//#region src/vue/ai-panel.ts
var OjAiPanel = defineComponent({
	name: "OjAiPanel",
	props: {
		title: {
			type: String,
			required: true
		},
		placeholder: {
			type: String,
			required: true
		},
		sendLabel: {
			type: String,
			required: true
		},
		messages: {
			type: Array,
			default: () => []
		},
		notice: {
			type: String,
			default: ""
		}
	},
	emits: ["submit"],
	setup(props, { emit }) {
		const draft = ref("");
		return () => h("aside", {
			class: "oj-ai",
			"aria-label": props.title
		}, [
			h("header", { class: "oj-ai__title" }, props.title),
			props.notice ? h("p", { class: "oj-ai__notice" }, props.notice) : null,
			h("ol", { class: "oj-ai__log" }, props.messages.map((message, index) => h("li", {
				key: index,
				"data-role": message.role
			}, message.text))),
			h("form", {
				class: "oj-ai__form",
				onSubmit: (event) => {
					event.preventDefault();
					const text = draft.value.trim();
					if (!text) return;
					draft.value = "";
					emit("submit", text);
				}
			}, [h("input", {
				value: draft.value,
				placeholder: props.placeholder,
				onInput: (event) => {
					draft.value = event.target.value;
				}
			}), h("button", {
				type: "submit",
				class: "oj-button",
				"data-size": "mini"
			}, props.sendLabel)])
		]);
	}
});
//#endregion
export { OjAiPanel };
