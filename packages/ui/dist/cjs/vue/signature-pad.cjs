const require_signature = require("../shell/signature.cjs");
let vue = require("vue");
//#region src/vue/signature-pad.ts
var OjSignaturePad = (0, vue.defineComponent)({
	name: "OjSignaturePad",
	props: { clearLabel: {
		type: String,
		required: true
	} },
	emits: ["change"],
	setup(props, { emit }) {
		const strokes = (0, vue.ref)([]);
		const drawing = (0, vue.ref)(false);
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
		return () => (0, vue.h)("div", { class: "oj-signature" }, [(0, vue.h)("svg", {
			class: "oj-signature__pad",
			viewBox: "0 0 360 140",
			onPointerdown: (event) => {
				drawing.value = true;
				event.currentTarget.setPointerCapture(event.pointerId);
				publish(require_signature.startStroke(strokes.value, point(event)));
			},
			onPointermove: (event) => {
				if (!drawing.value) return;
				publish(require_signature.extendStroke(strokes.value, point(event)));
			},
			onPointerup: () => {
				drawing.value = false;
			}
		}, strokes.value.map((stroke, index) => (0, vue.h)("path", {
			key: index,
			d: require_signature.strokePath(stroke),
			fill: "none",
			stroke: "currentColor",
			"stroke-width": "1.6"
		}))), (0, vue.h)("button", {
			type: "button",
			class: "oj-button",
			"data-size": "mini",
			onClick: () => publish([])
		}, props.clearLabel)]);
	}
});
//#endregion
exports.OjSignaturePad = OjSignaturePad;
