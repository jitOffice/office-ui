let vue = require("vue");
//#region src/vue/ai-panel.ts
var OjAiPanel = (0, vue.defineComponent)({
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
		const draft = (0, vue.ref)("");
		return () => (0, vue.h)("aside", {
			class: "oj-ai",
			"aria-label": props.title
		}, [
			(0, vue.h)("header", { class: "oj-ai__title" }, props.title),
			props.notice ? (0, vue.h)("p", { class: "oj-ai__notice" }, props.notice) : null,
			(0, vue.h)("ol", { class: "oj-ai__log" }, props.messages.map((message, index) => (0, vue.h)("li", {
				key: index,
				"data-role": message.role
			}, message.text))),
			(0, vue.h)("form", {
				class: "oj-ai__form",
				onSubmit: (event) => {
					event.preventDefault();
					const text = draft.value.trim();
					if (!text) return;
					draft.value = "";
					emit("submit", text);
				}
			}, [(0, vue.h)("input", {
				value: draft.value,
				placeholder: props.placeholder,
				onInput: (event) => {
					draft.value = event.target.value;
				}
			}), (0, vue.h)("button", {
				type: "submit",
				class: "oj-button",
				"data-size": "mini"
			}, props.sendLabel)])
		]);
	}
});
//#endregion
exports.OjAiPanel = OjAiPanel;
