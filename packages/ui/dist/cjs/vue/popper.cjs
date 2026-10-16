const require_popper = require("../popper.cjs");
let vue = require("vue");
//#region src/vue/popper.ts
var OjPopper = (0, vue.defineComponent)({
	name: "OjPopper",
	props: {
		open: {
			type: Boolean,
			required: true
		},
		anchor: {
			type: Object,
			default: null
		},
		placement: {
			type: String,
			default: "bottom-start"
		}
	},
	setup(props, { slots }) {
		const panel = (0, vue.ref)(null);
		const x = (0, vue.ref)(0);
		const y = (0, vue.ref)(0);
		const placed = (0, vue.ref)(false);
		function update() {
			const anchor = props.anchor;
			const el = panel.value;
			if (!props.open || !anchor || !el) return;
			const box = anchor.getBoundingClientRect();
			const popup = el.getBoundingClientRect();
			const next = require_popper.placePopper({
				anchor: {
					x: box.left,
					y: box.top,
					width: box.width,
					height: box.height
				},
				popup: {
					width: popup.width,
					height: popup.height
				},
				viewport: {
					width: window.innerWidth,
					height: window.innerHeight
				},
				placement: props.placement
			});
			x.value = next.x;
			y.value = next.y;
			placed.value = true;
		}
		(0, vue.onMounted)(() => {
			(0, vue.nextTick)(update);
		});
		(0, vue.watch)(() => props.open, (open) => {
			if (!open) placed.value = false;
			else (0, vue.nextTick)(update);
		});
		return () => {
			if (!props.open) return null;
			return (0, vue.h)("div", {
				ref: panel,
				class: "oj-popper",
				style: {
					left: `${x.value}px`,
					top: `${y.value}px`,
					visibility: placed.value ? "visible" : "hidden"
				}
			}, slots.default?.());
		};
	}
});
//#endregion
exports.OjPopper = OjPopper;
