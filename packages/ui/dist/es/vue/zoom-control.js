import { stepZoom } from "../shell/zoom.js";
import { OjIcon } from "./icon.js";
import { defineComponent, h } from "vue";
//#region src/vue/zoom-control.ts
var OjZoomControl = defineComponent({
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
		return () => h("div", {
			class: "oj-zoom",
			role: "group"
		}, [
			h("button", {
				type: "button",
				class: "oj-button",
				"data-size": "mini",
				"aria-label": props.zoomOutLabel,
				onClick: () => emit("update:modelValue", stepZoom(props.modelValue, -1))
			}, [h(OjIcon, {
				name: "oj-zoom-out",
				decorative: true
			})]),
			h("span", { class: "oj-zoom__value" }, `${props.modelValue}%`),
			h("button", {
				type: "button",
				class: "oj-button",
				"data-size": "mini",
				"aria-label": props.zoomInLabel,
				onClick: () => emit("update:modelValue", stepZoom(props.modelValue, 1))
			}, [h(OjIcon, {
				name: "oj-zoom-in",
				decorative: true
			})]),
			h("button", {
				type: "button",
				class: "oj-button",
				"data-size": "mini",
				onClick: () => emit("update:modelValue", 100)
			}, props.resetLabel)
		]);
	}
});
//#endregion
export { OjZoomControl };
