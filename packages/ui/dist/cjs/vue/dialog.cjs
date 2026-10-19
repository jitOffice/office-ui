const require_icon = require("./icon.cjs");
let vue = require("vue");
//#region src/vue/dialog.ts
var OjDialog = (0, vue.defineComponent)({
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
		(0, vue.onMounted)(() => document.addEventListener("keydown", onKey));
		(0, vue.onUnmounted)(() => document.removeEventListener("keydown", onKey));
		(0, vue.watch)(() => props.open, (open) => {
			if (!open) return;
			queueMicrotask(() => document.querySelector(".oj-dialog__confirm")?.focus());
		});
		return () => {
			if (!props.open) return null;
			return (0, vue.h)("div", {
				class: "oj-dialog__mask",
				onClick: () => cancel()
			}, [(0, vue.h)("div", {
				class: "oj-dialog",
				role: "dialog",
				"aria-modal": "true",
				"aria-label": props.title,
				onClick: (event) => event.stopPropagation()
			}, [
				(0, vue.h)("header", { class: "oj-dialog__header" }, [(0, vue.h)("h2", { class: "oj-dialog__title" }, props.title), (0, vue.h)("button", {
					type: "button",
					class: "oj-button",
					"data-size": "mini",
					"aria-label": props.cancelLabel,
					onClick: () => cancel()
				}, [(0, vue.h)(require_icon.OjIcon, { name: "oj-close" })])]),
				(0, vue.h)("div", { class: "oj-dialog__body" }, slots.default?.()),
				(0, vue.h)("footer", { class: "oj-dialog__footer" }, [props.cancelLabel ? (0, vue.h)("button", {
					type: "button",
					class: "oj-button",
					onClick: () => cancel()
				}, props.cancelLabel) : null, props.confirmLabel ? (0, vue.h)("button", {
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
exports.OjDialog = OjDialog;
