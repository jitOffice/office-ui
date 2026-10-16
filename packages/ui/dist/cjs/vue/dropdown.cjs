const require_popper = require("./popper.cjs");
let vue = require("vue");
//#region src/vue/dropdown.ts
var OjDropdown = (0, vue.defineComponent)({
	name: "OjDropdown",
	props: { open: {
		type: Boolean,
		default: false
	} },
	emits: ["update:open"],
	setup(props, { slots, emit }) {
		const root = (0, vue.ref)(null);
		const anchor = (0, vue.ref)(null);
		function setOpen(next) {
			emit("update:open", next);
		}
		function onPointerDown(event) {
			const el = root.value;
			if (!props.open || !el) return;
			if (event.target instanceof Node && el.contains(event.target)) return;
			setOpen(false);
		}
		function onKey(event) {
			if (event.key === "Escape" && props.open) {
				event.stopPropagation();
				setOpen(false);
				anchor.value?.focus();
			}
		}
		(0, vue.onMounted)(() => {
			document.addEventListener("pointerdown", onPointerDown);
		});
		(0, vue.onUnmounted)(() => {
			document.removeEventListener("pointerdown", onPointerDown);
		});
		return () => (0, vue.h)("div", {
			ref: root,
			class: "oj-dropdown",
			onKeydown: onKey
		}, [(0, vue.h)("span", {
			ref: anchor,
			class: "oj-dropdown__trigger",
			onClick: () => setOpen(!props.open)
		}, slots.trigger?.()), (0, vue.h)(require_popper.OjPopper, {
			open: props.open,
			anchor: anchor.value
		}, { default: () => slots.default?.() })]);
	}
});
//#endregion
exports.OjDropdown = OjDropdown;
