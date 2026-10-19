let vue = require("vue");
//#region src/vue/watermark.ts
var OjWatermark = (0, vue.defineComponent)({
	name: "OjWatermark",
	props: {
		text: {
			type: String,
			required: true
		},
		visible: {
			type: Boolean,
			default: true
		}
	},
	setup(props, { slots }) {
		return () => (0, vue.h)("div", { class: "oj-watermark" }, [slots.default?.(), props.visible ? (0, vue.h)("div", {
			class: "oj-watermark__layer",
			"aria-hidden": "true"
		}, props.text) : null]);
	}
});
//#endregion
exports.OjWatermark = OjWatermark;
