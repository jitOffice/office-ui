import { OjIcon } from "./icon.js";
import { Teleport, defineComponent, h, onMounted, onUnmounted, watch } from "vue";
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
		onMounted(() => document.addEventListener("keydown", onKey));
		onUnmounted(() => document.removeEventListener("keydown", onKey));
		watch(() => props.open, (open) => {
			if (!open) return;
			queueMicrotask(() => document.querySelector(".oj-dialog__confirm")?.focus());
		});
		return () => {
			if (!props.open) return null;
			const content = h("div", {
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
				}, [h(OjIcon, {
					name: "oj-close",
					decorative: true
				})])]),
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
			const to = teleportTarget(props.teleport);
			return to === void 0 ? content : h(Teleport, { to }, [content]);
		};
	}
});
//#endregion
export { OjDialog };
