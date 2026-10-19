import { rulerTicks } from "../shell/ruler.js";
import { defineComponent, h } from "vue";
//#region src/vue/ruler.ts
var OjRuler = defineComponent({
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
			const ticks = rulerTicks(props.length, props.zoom);
			const horizontal = props.orientation !== "vertical";
			return h("div", {
				class: horizontal ? "oj-ruler oj-ruler--h" : "oj-ruler oj-ruler--v",
				style: horizontal ? { width: `${props.length}px` } : { height: `${props.length}px` },
				"aria-hidden": "true"
			}, ticks.map((tick) => h("span", {
				class: "oj-ruler__tick",
				style: horizontal ? { left: `${tick.offset}px` } : { top: `${tick.offset}px` }
			}, tick.label)));
		};
	}
});
//#endregion
export { OjRuler };
