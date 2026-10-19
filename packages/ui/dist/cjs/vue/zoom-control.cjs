const require_zoom = require("../shell/zoom.cjs");
const require_icon = require("./icon.cjs");
let vue = require("vue");
//#region src/vue/zoom-control.ts
var OjZoomControl = (0, vue.defineComponent)({
	name: "OjZoomControl",
	props: {
		modelValue: {
			type: Number,
			required: true
		},
		zoomOutLabel: {
			type: String,
			required: true
		},
		zoomInLabel: {
			type: String,
			required: true
		},
		resetLabel: {
			type: String,
			required: true
		}
	},
	emits: ["update:modelValue"],
	setup(props, { emit }) {
		return () => (0, vue.h)("div", {
			class: "oj-zoom",
			role: "group"
		}, [
			(0, vue.h)("button", {
				type: "button",
				class: "oj-button",
				"data-size": "mini",
				"aria-label": props.zoomOutLabel,
				onClick: () => emit("update:modelValue", require_zoom.stepZoom(props.modelValue, -1))
			}, [(0, vue.h)(require_icon.OjIcon, { name: "oj-zoom-out" })]),
			(0, vue.h)("span", { class: "oj-zoom__value" }, `${props.modelValue}%`),
			(0, vue.h)("button", {
				type: "button",
				class: "oj-button",
				"data-size": "mini",
				"aria-label": props.zoomInLabel,
				onClick: () => emit("update:modelValue", require_zoom.stepZoom(props.modelValue, 1))
			}, [(0, vue.h)(require_icon.OjIcon, { name: "oj-zoom-in" })]),
			(0, vue.h)("button", {
				type: "button",
				class: "oj-button",
				"data-size": "mini",
				onClick: () => emit("update:modelValue", 100)
			}, props.resetLabel)
		]);
	}
});
//#endregion
exports.OjZoomControl = OjZoomControl;
