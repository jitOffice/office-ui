let vue = require("vue");
//#region src/vue/code-block.ts
var OjCodeBlock = (0, vue.defineComponent)({
	name: "OjCodeBlock",
	props: {
		code: {
			type: String,
			required: true
		},
		language: {
			type: String,
			default: ""
		}
	},
	setup(props) {
		return () => (0, vue.h)("pre", { class: "oj-code" }, [props.language ? (0, vue.h)("span", { class: "oj-code__lang" }, props.language) : null, props.code]);
	}
});
//#endregion
exports.OjCodeBlock = OjCodeBlock;
