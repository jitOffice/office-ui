import { clampPane, resizePane, stepPane, togglePane } from "../shell/splitter.js";
import { defineComponent, h, ref } from "vue";
//#region src/vue/splitter.ts
/**
* `OjSplitter`（03 §3 D 组）：两栏之间的可拖拽分隔条。
*
* 只画一根条子，不画两侧的栏——`size` 描述的是**被调那一栏**的宽度/高度，
* 由 `pane` 决定是分隔条之前还是之后那一栏（默认 `'after'`，即右侧批注栏 / 下方控制台）。
* 方向必须显式声明：同一根条子既能表示"左栏收起"也能表示"右栏展开"，
* 两种语义都不说清等于永远搞不懂往哪拖。往右拖是**把右栏压窄、把左栏放宽**。
*
* 受控：拖拽只上抛 `update:size`，本地不留尺寸副本。拖拽期间宿主可能同时在钳制
* （窗口缩小、另一栏被折叠），本地存一份就会出现松开后"跳一下"。
*
* 键盘走 WAI-ARIA window splitter 的语义：方向键移动的是**分隔条本身**，
* 不是"把数值调大"——否则右栏的右键与左栏的右键行为相反，谁都用不对。
*/
var OjSplitter = defineComponent({
	name: "OjSplitter",
	props: {
		/** 被调那一栏的尺寸（px）。 */
		size: {
			type: Number,
			required: true
		},
		min: {
			type: Number,
			default: 0
		},
		max: {
			type: Number,
			default: Number.POSITIVE_INFINITY
		},
		collapsible: {
			type: Boolean,
			default: false
		},
		/** 被调的是分隔条**之前**还是**之后**那一栏。 */
		pane: {
			type: String,
			default: "after"
		},
		orientation: {
			type: String,
			default: "vertical"
		},
		/** 分隔条的可访问名（"调整批注栏宽度"）。 */
		label: {
			type: String,
			required: true
		},
		step: {
			type: Number,
			default: 16
		},
		disabled: {
			type: Boolean,
			default: false
		}
	},
	emits: [
		"update:size",
		"drag-start",
		"drag-end"
	],
	setup(props, { emit }) {
		const dragging = ref(false);
		let origin = 0;
		let originSize = 0;
		let last = props.size;
		function bounds() {
			return {
				min: props.min,
				max: props.max,
				collapsible: props.collapsible
			};
		}
		/** 只在值真的变了才上抛：拖拽一次会收到几十个 pointermove，重复值会打断宿主的渲染合帧。 */
		function commit(next) {
			if (next === last) return;
			last = next;
			emit("update:size", next);
		}
		/**
		* 指针捕获让光标划出条子之外仍能继续拖。测试环境（happy-dom）不一定实现，
		* 捕获失败只影响"拖出条子就断"，不该让拖拽本身抛错。
		*/
		function capture(element, pointerId) {
			try {
				element?.setPointerCapture(pointerId);
			} catch {}
		}
		function onPointerdown(event) {
			if (props.disabled || event.button !== 0) return;
			event.preventDefault();
			capture(event.currentTarget, event.pointerId);
			dragging.value = true;
			origin = props.orientation === "vertical" ? event.clientX : event.clientY;
			originSize = props.size;
			last = props.size;
			emit("drag-start");
		}
		function onPointermove(event) {
			if (!dragging.value) return;
			const pointer = props.orientation === "vertical" ? event.clientX : event.clientY;
			const delta = props.pane === "before" ? pointer - origin : origin - pointer;
			commit(resizePane(originSize, delta, bounds()));
		}
		function finish(event) {
			if (!dragging.value) return;
			dragging.value = false;
			const target = event.currentTarget;
			try {
				if (target?.hasPointerCapture(event.pointerId) === true) target.releasePointerCapture(event.pointerId);
			} catch {}
			emit("drag-end", last);
		}
		function onKeydown(event) {
			if (props.disabled) return;
			const vertical = props.orientation === "vertical";
			const backward = vertical ? "ArrowLeft" : "ArrowUp";
			const forward = vertical ? "ArrowRight" : "ArrowDown";
			const grow = props.pane === "before" ? forward : backward;
			const shrink = props.pane === "before" ? backward : forward;
			if (event.key === grow) {
				event.preventDefault();
				commit(stepPane(props.size, 1, bounds(), props.step));
				return;
			}
			if (event.key === shrink) {
				event.preventDefault();
				commit(stepPane(props.size, -1, bounds(), props.step));
				return;
			}
			if (event.key === "Home") {
				event.preventDefault();
				commit(props.collapsible ? 0 : clampPane(props.min, bounds()));
				return;
			}
			if (event.key === "End") {
				event.preventDefault();
				if (Number.isFinite(props.max)) commit(clampPane(props.max, bounds()));
				return;
			}
			if (event.key === "Enter" || event.key === " ") {
				event.preventDefault();
				commit(togglePane(props.size, bounds()));
			}
		}
		return () => {
			const collapsed = props.size === 0;
			return h("div", {
				class: "oj-splitter",
				role: "separator",
				tabindex: props.disabled ? -1 : 0,
				"aria-label": props.label,
				"aria-orientation": props.orientation,
				"aria-valuenow": Math.round(props.size),
				"aria-valuemin": Math.round(props.min),
				"aria-valuemax": Number.isFinite(props.max) ? Math.round(props.max) : void 0,
				"aria-disabled": props.disabled ? "true" : void 0,
				"data-orientation": props.orientation,
				"data-pane": props.pane,
				"data-dragging": dragging.value ? "" : void 0,
				"data-collapsed": collapsed ? "" : void 0,
				"data-disabled": props.disabled ? "" : void 0,
				onPointerdown,
				onPointermove,
				onPointerup: finish,
				onPointercancel: finish,
				onKeydown,
				onDblclick: () => {
					if (props.disabled) return;
					commit(togglePane(props.size, bounds()));
				}
			});
		};
	}
});
//#endregion
export { OjSplitter };
