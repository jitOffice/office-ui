let vue = require("vue");
//#region src/vue/stamp.ts
var OjStamp = (0, vue.defineComponent)({
	name: "OjStamp",
	props: { text: {
		type: String,
		required: true
	} },
	setup(props) {
		return () => (0, vue.h)("span", {
			class: "oj-stamp",
			"aria-hidden": "true"
		}, props.text);
	}
});
//#endregion
exports.OjStamp = OjStamp;
