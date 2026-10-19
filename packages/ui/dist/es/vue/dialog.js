import { OjIcon } from "./icon.js";
import { defineComponent, h, onMounted, onUnmounted, watch } from "vue";
//#region src/vue/dialog.ts
var OjDialog = defineComponent({
	name: "OjDialog",
	props: {
		open: {
			type: Boolean,
			required: true
		},
		title: {
			type: String,
			required: true
		},
		confirmLabel: {
			type: String,
			default: ""
		},
		cancelLabel: {
			type: String,
			default: ""
		}
	},
	emits: [
		"update:open",
		"confirm",
		"cancel"
	],
	setup(props, { slots, emit }) {
		function cancel() {
			emit("cancel");
			emit("update:open", false);
		}
		function confirm() {
			emit("confirm");
		}
		function onKey(event) {
			if (!props.open || event.key !== "Escape") return;
			event.preventDefault();
			cancel();
		}
		onMounted(() => document.addEventListener("keydown", onKey));
		onUnmounted(() => document.removeEventListener("keydown", onKey));
		watch(() => props.open, (open) => {
			if (!open) return;
			queueMicrotask(() => document.querySelector(".oj-dialog__confirm")?.focus());
		});
		return () => {
			if (!props.open) return null;
			return h("div", {
				class: "oj-dialog__mask",
				onClick: () => cancel()
			}, [h("div", {
				class: "oj-dialog",
				role: "dialog",
				"aria-modal": "true",
				"aria-label": props.title,
				onClick: (event) => event.stopPropagation()
			}, [
				h("header", { class: "oj-dialog__header" }, [h("h2", { class: "oj-dialog__title" }, props.title), h("button", {
					type: "button",
					class: "oj-button",
					"data-size": "mini",
					"aria-label": props.cancelLabel,
					onClick: () => cancel()
				}, [h(OjIcon, { name: "oj-close" })])]),
				h("div", { class: "oj-dialog__body" }, slots.default?.()),
				h("footer", { class: "oj-dialog__footer" }, [props.cancelLabel ? h("button", {
					type: "button",
					class: "oj-button",
					onClick: () => cancel()
				}, props.cancelLabel) : null, props.confirmLabel ? h("button", {
					type: "button",
					class: "oj-button oj-dialog__confirm",
					"data-active": "",
					onClick: () => confirm()
				}, props.confirmLabel) : null])
			])]);
		};
	}
});
//#endregion
export { OjDialog };
