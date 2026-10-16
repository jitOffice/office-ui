const require_icons = require("../icons.cjs");
let vue = require("vue");
//#region src/vue/icon.ts
function cssSize(size) {
	return typeof size === "number" ? `${size}px` : size;
}
var OjIcon = (0, vue.defineComponent)({
	name: "OjIcon",
	props: {
		name: {
			type: String,
			required: true
		},
		size: {
			type: [Number, String],
			default: void 0
		},
		label: {
			type: String,
			default: void 0
		}
	},
	setup(props) {
		return () => {
			const markup = require_icons.iconMarkup(props.name);
			const labelled = typeof props.label === "string" && props.label.length > 0;
			return (0, vue.h)("span", {
				class: "oj-icon",
				role: labelled ? "img" : void 0,
				"aria-label": labelled ? props.label : void 0,
				"aria-hidden": labelled ? void 0 : "true",
				style: props.size === void 0 ? void 0 : {
					width: cssSize(props.size),
					height: cssSize(props.size)
				},
				innerHTML: markup ?? ""
			});
		};
	}
});
//#endregion
exports.OjIcon = OjIcon;
