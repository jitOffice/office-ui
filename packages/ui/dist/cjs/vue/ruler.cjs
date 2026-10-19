const require_ruler = require("../shell/ruler.cjs");
let vue = require("vue");
//#region src/vue/ruler.ts
var OjRuler = (0, vue.defineComponent)({
	name: "OjRuler",
	props: {
		length: {
			type: Number,
			required: true
		},
		zoom: {
			type: Number,
			required: true
		},
		orientation: {
			type: String,
			default: "horizontal"
		}
	},
	setup(props) {
		return () => {
			const ticks = require_ruler.rulerTicks(props.length, props.zoom);
			const horizontal = props.orientation !== "vertical";
			return (0, vue.h)("div", {
				class: horizontal ? "oj-ruler oj-ruler--h" : "oj-ruler oj-ruler--v",
				style: horizontal ? { width: `${props.length}px` } : { height: `${props.length}px` },
				"aria-hidden": "true"
			}, ticks.map((tick) => (0, vue.h)("span", {
				class: "oj-ruler__tick",
				style: horizontal ? { left: `${tick.offset}px` } : { top: `${tick.offset}px` }
			}, tick.label)));
		};
	}
});
//#endregion
exports.OjRuler = OjRuler;
