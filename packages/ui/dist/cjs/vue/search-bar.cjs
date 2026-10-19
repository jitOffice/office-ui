let vue = require("vue");
//#region src/vue/search-bar.ts
var OjSearchReplaceBar = (0, vue.defineComponent)({
	name: "OjSearchReplaceBar",
	props: {
		find: {
			type: String,
			default: ""
		},
		replace: {
			type: String,
			default: ""
		},
		matchCase: {
			type: Boolean,
			default: false
		},
		current: {
			type: Number,
			default: 0
		},
		total: {
			type: Number,
			default: 0
		},
		findLabel: {
			type: String,
			required: true
		},
		replaceLabel: {
			type: String,
			required: true
		},
		nextLabel: {
			type: String,
			required: true
		},
		previousLabel: {
			type: String,
			required: true
		},
		matchCaseLabel: {
			type: String,
			required: true
		},
		countLabel: {
			type: String,
			required: true
		},
		replaceActionLabel: {
			type: String,
			required: true
		},
		replaceAllLabel: {
			type: String,
			required: true
		}
	},
	emits: [
		"update:find",
		"update:replace",
		"update:matchCase",
		"next",
		"previous",
		"replace",
		"replace-all"
	],
	setup(props, { emit }) {
		return () => (0, vue.h)("form", {
			class: "oj-search",
			onSubmit: (event) => event.preventDefault()
		}, [
			(0, vue.h)("label", { class: "oj-search__field" }, [(0, vue.h)("span", props.findLabel), (0, vue.h)("input", {
				value: props.find,
				onInput: (event) => emit("update:find", event.target.value)
			})]),
			(0, vue.h)("label", { class: "oj-search__field" }, [(0, vue.h)("span", props.replaceLabel), (0, vue.h)("input", {
				value: props.replace,
				onInput: (event) => emit("update:replace", event.target.value)
			})]),
			(0, vue.h)("span", { class: "oj-search__count" }, props.countLabel),
			(0, vue.h)("button", {
				type: "button",
				class: "oj-button",
				"data-size": "mini",
				"data-active": props.matchCase ? "" : void 0,
				"aria-pressed": props.matchCase ? "true" : "false",
				onClick: () => emit("update:matchCase", !props.matchCase)
			}, props.matchCaseLabel),
			(0, vue.h)("button", {
				type: "button",
				class: "oj-button",
				"data-size": "mini",
				onClick: () => emit("previous")
			}, props.previousLabel),
			(0, vue.h)("button", {
				type: "button",
				class: "oj-button",
				"data-size": "mini",
				onClick: () => emit("next")
			}, props.nextLabel),
			(0, vue.h)("button", {
				type: "button",
				class: "oj-button",
				"data-size": "mini",
				onClick: () => emit("replace")
			}, props.replaceActionLabel),
			(0, vue.h)("button", {
				type: "button",
				class: "oj-button",
				"data-size": "mini",
				onClick: () => emit("replace-all")
			}, props.replaceAllLabel)
		]);
	}
});
//#endregion
exports.OjSearchReplaceBar = OjSearchReplaceBar;
