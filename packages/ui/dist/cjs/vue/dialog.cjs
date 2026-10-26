const require_icon = require("./icon.cjs");
let vue = require("vue");
//#region src/vue/dialog.ts
/**
* 03 §2「弹层归属」：`teleport: 'body' | '[selector]' | false`。
*
* Office 场景里弹窗不能一律挂 body：全屏放映要投进放映容器、iframe 内要投进 iframe 的
* document、打印区域同理。`false` 留在原地，给已经自己做了层级管理的宿主用。
*/
function teleportTarget(value) {
	if (value === false) return void 0;
	return typeof value === "string" && value.length > 0 ? value : "body";
}
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
		},
		teleport: {
			type: [String, Boolean],
			default: "body"
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
			const content = (0, vue.h)("div", {
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
				}, [(0, vue.h)(require_icon.OjIcon, {
					name: "oj-close",
					decorative: true
				})])]),
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
			const to = teleportTarget(props.teleport);
			return to === void 0 ? content : (0, vue.h)(vue.Teleport, { to }, [content]);
		};
	}
});
//#endregion
exports.OjDialog = OjDialog;
