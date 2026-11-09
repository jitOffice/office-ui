const require_drag_context = require("../shell/drag-context.cjs");
let vue = require("vue");
//#region src/vue/drag-context.ts
var OJ_DRAG_CONTEXT = Symbol("oj-drag-context");
/** 子组件读取上下文。没有 `OjDragContext` 包裹时返回 `undefined`，调用方按"不在拖拽"处理。 */
function useOjDragContext() {
	return (0, vue.inject)(OJ_DRAG_CONTEXT);
}
/**
* `OjDragContext`（03 §3 D 组）：拖放协议的统一入口，区分内部拖拽与外部拖入。
*
* 与 `OjDropZone` 的分工：`OjDropZone` 是"整页遮罩 + 文件受理"的成品；
* 这里是"协议层"——不画遮罩，只判断这次拖拽归谁、是什么载荷，然后上抛。
* 需要"拖拽高亮 + 内部排序 + 外部文件导入"同屏共存时用这个。
*
* 组件本身不产生盒子（`display: contents`）：它套在布局外面，但布局仍由内部的
* 分栏/网格决定。`data-kind` / `data-dragging` 落在包裹元素上，宿主用属性选择器做高亮。
*/
var OjDragContext = (0, vue.defineComponent)({
	name: "OjDragContext",
	props: {
		accept: {
			type: Object,
			default: () => ({})
		},
		disabled: {
			type: Boolean,
			default: false
		}
	},
	emits: [
		"enter",
		"leave",
		"drop"
	],
	setup(props, { emit, slots }) {
		const dragging = (0, vue.ref)(false);
		const kind = (0, vue.ref)("none");
		const data = (0, vue.ref)("");
		let depth = 0;
		(0, vue.provide)(OJ_DRAG_CONTEXT, {
			dragging,
			kind,
			data
		});
		function payloadOf(transfer) {
			return require_drag_context.readTransfer({
				types: [...transfer.types],
				files: Array.from(transfer.files),
				getData: (format) => transfer.getData(format)
			});
		}
		function reset() {
			depth = 0;
			dragging.value = false;
			kind.value = "none";
			data.value = "";
		}
		function onDragEnter(event) {
			if (props.disabled) return;
			const types = event.dataTransfer?.types ?? [];
			if (!require_drag_context.negotiateTransfer(types, props.accept)) return;
			depth += 1;
			dragging.value = true;
			const preview = require_drag_context.readTransfer({
				types,
				files: [],
				getData: () => ""
			});
			kind.value = preview.kind;
			data.value = preview.data;
			emit("enter", preview.kind);
		}
		function onDragOver(event) {
			if (props.disabled || !dragging.value) return;
			event.preventDefault();
			if (event.dataTransfer !== null) event.dataTransfer.dropEffect = kind.value === "internal" ? "move" : "copy";
		}
		function onDragLeave(event) {
			if (event.relatedTarget === null) {
				reset();
				emit("leave");
				return;
			}
			depth = Math.max(0, depth - 1);
			if (depth > 0) return;
			dragging.value = false;
			kind.value = "none";
			data.value = "";
			emit("leave");
		}
		function onDrop(event) {
			if (props.disabled) return;
			const transfer = event.dataTransfer;
			if (transfer === null) {
				reset();
				return;
			}
			if (!require_drag_context.negotiateTransfer([...transfer.types], props.accept)) {
				reset();
				return;
			}
			event.preventDefault();
			const payload = payloadOf(transfer);
			reset();
			if ((payload.kind === "html" || payload.kind === "text") && props.accept.text !== true) return;
			emit("drop", payload);
		}
		(0, vue.onMounted)(() => {
			if (typeof window === "undefined") return;
			window.addEventListener("dragenter", onDragEnter);
			window.addEventListener("dragover", onDragOver);
			window.addEventListener("dragleave", onDragLeave);
			window.addEventListener("drop", onDrop);
			window.addEventListener("dragend", reset);
		});
		(0, vue.onBeforeUnmount)(() => {
			if (typeof window === "undefined") return;
			window.removeEventListener("dragenter", onDragEnter);
			window.removeEventListener("dragover", onDragOver);
			window.removeEventListener("dragleave", onDragLeave);
			window.removeEventListener("drop", onDrop);
			window.removeEventListener("dragend", reset);
		});
		return () => (0, vue.h)("div", {
			class: "oj-drag-context",
			"data-dragging": dragging.value ? "" : void 0,
			"data-kind": kind.value === "none" ? void 0 : kind.value
		}, slots.default?.());
	}
});
//#endregion
exports.OJ_DRAG_CONTEXT = OJ_DRAG_CONTEXT;
exports.OjDragContext = OjDragContext;
exports.useOjDragContext = useOjDragContext;
