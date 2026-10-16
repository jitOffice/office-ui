import { OjPopper } from "./popper.js";
import { defineComponent, h, onMounted, onUnmounted, ref } from "vue";
//#region src/vue/dropdown.ts
var OjDropdown = defineComponent({
	name: "OjDropdown",
	props: { open: {
		type: Boolean,
		default: false
	} },
	emits: ["update:open"],
	setup(props, { slots, emit }) {
		const root = ref(null);
		const anchor = ref(null);
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
		onMounted(() => {
			document.addEventListener("pointerdown", onPointerDown);
		});
		onUnmounted(() => {
			document.removeEventListener("pointerdown", onPointerDown);
		});
		return () => h("div", {
			ref: root,
			class: "oj-dropdown",
			onKeydown: onKey
		}, [h("span", {
			ref: anchor,
			class: "oj-dropdown__trigger",
			onClick: () => setOpen(!props.open)
		}, slots.trigger?.()), h(OjPopper, {
			open: props.open,
			anchor: anchor.value
		}, { default: () => slots.default?.() })]);
	}
});
//#endregion
export { OjDropdown };
