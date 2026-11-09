import { clampFloatRect, isFloating, redock, toggleCollapsed, undock } from "../shell/dock.js";
import { defineComponent, h, ref } from "vue";
//#region src/vue/dock-panel.ts
/**
* `OjDockPanel`（03 §3 D 组）：可停靠 / 浮动 / 收起的侧栏面板（属性面板、AI 任务面板）。
*
* 状态全在 `state` 里（受控）：组件只发 `update:state`，自己不记"停在哪、浮在哪"。
* 理由很实际——面板位置要随会话保存、要跟着预设切换（合同审阅用右栏、写作用左栏），
* 组件内部再存一份就一定会与宿主的真值分叉。
*
* 三条容易做错的：
*   - **收起后标题栏必须还在**。整个面板隐藏掉，用户就再也找不到展开入口；
*   - **浮动时按标题栏拖动，按钮不算拖动区**。不排除按钮，点"收起"会顺带把面板拖走几像素；
*   - **位置夹取在拖动时就做**（`clampFloatRect`），不是松手后。松手才修正等于允许用户把面板
*     拖出屏幕，然后眼睁睁看它跳回来。
*
* 停靠尺寸不归这里管：那是 `OjPaneGroup` 的栏位尺寸，由分隔条调。
*/
var OjDockPanel = defineComponent({
	name: "OjDockPanel",
	props: {
		state: {
			type: Object,
			required: true
		},
		/** 面板标题，同时作为 region 的可访问名。 */
		title: {
			type: String,
			required: true
		},
		collapseLabel: {
			type: String,
			required: true
		},
		expandLabel: {
			type: String,
			required: true
		},
		/** 浮出按钮的可访问名（"浮动"）。 */
		floatLabel: {
			type: String,
			required: true
		},
		/** 停靠按钮的可访问名（"停靠"）。 */
		dockLabel: {
			type: String,
			required: true
		}
	},
	emits: ["update:state"],
	setup(props, { emit, slots }) {
		const dragging = ref(false);
		let originX = 0;
		let originY = 0;
		let originRect;
		function viewport() {
			if (typeof window === "undefined") return {
				width: 0,
				height: 0
			};
			return {
				width: window.innerWidth,
				height: window.innerHeight
			};
		}
		function commit(next) {
			if (next !== props.state) emit("update:state", next);
		}
		function capture(element, pointerId) {
			try {
				element?.setPointerCapture(pointerId);
			} catch {}
		}
		function onPointerdown(event) {
			if (!isFloating(props.state) || event.button !== 0) return;
			if (event.target?.closest?.("button") !== null) return;
			event.preventDefault();
			capture(event.currentTarget, event.pointerId);
			dragging.value = true;
			originX = event.clientX;
			originY = event.clientY;
			originRect = props.state.float;
		}
		function onPointermove(event) {
			if (!dragging.value || originRect === void 0) return;
			const rect = clampFloatRect({
				...originRect,
				x: originRect.x + (event.clientX - originX),
				y: originRect.y + (event.clientY - originY)
			}, viewport());
			if (rect.x === props.state.float.x && rect.y === props.state.float.y) return;
			commit({
				...props.state,
				float: rect
			});
		}
		function finish(event) {
			if (!dragging.value) return;
			dragging.value = false;
			originRect = void 0;
			const target = event.currentTarget;
			try {
				if (target?.hasPointerCapture(event.pointerId) === true) target.releasePointerCapture(event.pointerId);
			} catch {}
		}
		return () => {
			const state = props.state;
			const floating = isFloating(state);
			return h("section", {
				class: "oj-dock",
				"data-side": state.side,
				"data-collapsed": state.collapsed ? "" : void 0,
				"data-dragging": dragging.value ? "" : void 0,
				"aria-label": props.title,
				style: floating ? {
					left: `${state.float.x}px`,
					top: `${state.float.y}px`,
					width: `${state.float.width}px`,
					height: state.collapsed ? void 0 : `${state.float.height}px`
				} : void 0
			}, [h("header", {
				class: "oj-dock__header",
				onPointerdown,
				onPointermove,
				onPointerup: finish,
				onPointercancel: finish
			}, [
				h("h2", { class: "oj-dock__title" }, props.title),
				h("button", {
					type: "button",
					class: "oj-dock__collapse",
					"aria-expanded": state.collapsed ? "false" : "true",
					"aria-label": state.collapsed ? props.expandLabel : props.collapseLabel,
					title: state.collapsed ? props.expandLabel : props.collapseLabel,
					onClick: () => commit(toggleCollapsed(state))
				}, state.collapsed ? "▸" : "▾"),
				h("button", {
					type: "button",
					class: "oj-dock__float",
					"aria-pressed": floating ? "true" : "false",
					"aria-label": floating ? props.dockLabel : props.floatLabel,
					title: floating ? props.dockLabel : props.floatLabel,
					onClick: () => commit(floating ? redock(state) : undock(state))
				}, floating ? "⇲" : "⇱")
			]), state.collapsed ? null : h("div", { class: "oj-dock__body" }, slots.default?.())]);
		};
	}
});
//#endregion
export { OjDockPanel };
