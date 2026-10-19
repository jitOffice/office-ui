import { extendStroke, startStroke, strokePath } from "../shell/signature.js";
import { defineComponent, h, ref } from "vue";
//#region src/vue/signature-pad.ts
var OjSignaturePad = defineComponent({
	name: "OjSignaturePad",
	props: { clearLabel: {
		type: String,
		required: true
	} },
	emits: ["change"],
	setup(props, { emit }) {
		const strokes = ref([]);
		const drawing = ref(false);
		function point(event) {
			const bounds = event.currentTarget.getBoundingClientRect();
			return {
				x: Math.round(event.clientX - bounds.left),
				y: Math.round(event.clientY - bounds.top)
			};
		}
		function publish(next) {
			strokes.value = next;
			emit("change", next);
		}
		return () => h("div", { class: "oj-signature" }, [h("svg", {
			class: "oj-signature__pad",
			viewBox: "0 0 360 140",
			onPointerdown: (event) => {
				drawing.value = true;
				event.currentTarget.setPointerCapture(event.pointerId);
				publish(startStroke(strokes.value, point(event)));
			},
			onPointermove: (event) => {
				if (!drawing.value) return;
				publish(extendStroke(strokes.value, point(event)));
			},
			onPointerup: () => {
				drawing.value = false;
			}
		}, strokes.value.map((stroke, index) => h("path", {
			key: index,
			d: strokePath(stroke),
			fill: "none",
			stroke: "currentColor",
			"stroke-width": "1.6"
		}))), h("button", {
			type: "button",
			class: "oj-button",
			"data-size": "mini",
			onClick: () => publish([])
		}, props.clearLabel)]);
	}
});
//#endregion
export { OjSignaturePad };
