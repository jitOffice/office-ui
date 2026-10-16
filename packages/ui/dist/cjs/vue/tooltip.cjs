const require_popper = require("../popper.cjs");
const require_tooltip = require("../tooltip.cjs");
let vue = require("vue");
//#region src/vue/tooltip.ts
var OjTooltip = (0, vue.defineComponent)({
	name: "OjTooltip",
	props: {
		label: {
			type: String,
			required: true
		},
		delay: {
			type: Number,
			default: 400
		}
	},
	setup(props, { slots }) {
		const root = (0, vue.ref)(null);
		const open = (0, vue.ref)(false);
		const x = (0, vue.ref)(0);
		const y = (0, vue.ref)(0);
		const machine = require_tooltip.createTooltipMachine({
			get delay() {
				return props.delay;
			},
			onChange: (next) => {
				open.value = next;
				if (!next || !root.value) return;
				const box = root.value.getBoundingClientRect();
				const pos = require_popper.placePopper({
					anchor: {
						x: box.left,
						y: box.top,
						width: box.width,
						height: box.height
					},
					popup: {
						width: Math.max(props.label.length * 12, 48),
						height: 28
					},
					viewport: {
						width: window.innerWidth,
						height: window.innerHeight
					},
					placement: "top-start"
				});
				x.value = pos.x;
				y.value = pos.y;
			}
		});
		(0, vue.onUnmounted)(() => machine.dispose());
		return () => (0, vue.h)("span", {
			ref: root,
			class: "oj-tooltip-anchor",
			onMouseenter: () => machine.enter(),
			onMouseleave: () => machine.leave(),
			onFocusin: () => machine.show(),
			onFocusout: () => machine.hide()
		}, [slots.default?.(), open.value ? (0, vue.h)("span", {
			class: "oj-tooltip",
			role: "tooltip",
			style: {
				left: `${x.value}px`,
				top: `${y.value}px`
			}
		}, props.label) : null]);
	}
});
//#endregion
exports.OjTooltip = OjTooltip;
