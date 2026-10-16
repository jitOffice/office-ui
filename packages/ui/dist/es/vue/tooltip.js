import { placePopper } from "../popper.js";
import { createTooltipMachine } from "../tooltip.js";
import { defineComponent, h, onUnmounted, ref } from "vue";
//#region src/vue/tooltip.ts
var OjTooltip = defineComponent({
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
		const root = ref(null);
		const open = ref(false);
		const x = ref(0);
		const y = ref(0);
		const machine = createTooltipMachine({
			get delay() {
				return props.delay;
			},
			onChange: (next) => {
				open.value = next;
				if (!next || !root.value) return;
				const box = root.value.getBoundingClientRect();
				const pos = placePopper({
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
		onUnmounted(() => machine.dispose());
		return () => h("span", {
			ref: root,
			class: "oj-tooltip-anchor",
			onMouseenter: () => machine.enter(),
			onMouseleave: () => machine.leave(),
			onFocusin: () => machine.show(),
			onFocusout: () => machine.hide()
		}, [slots.default?.(), open.value ? h("span", {
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
export { OjTooltip };
