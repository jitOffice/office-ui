import { createTriggerMachine } from "../trigger.js";
import { OjPopper } from "./popper.js";
import { OjPortal } from "./portal.js";
import { defineComponent, h, onUnmounted, ref, watch } from "vue";
//#region src/vue/trigger.ts
/**
* 触发器 + 浮层（prd/03 §3 D 组）：`hover/click/focus/manual` 可组合，含离开延迟。
*
* 交互语义全在 `../trigger.ts` 的机器里（零依赖可测），这里只负责把 DOM 事件接上去、
* 以及把面板放进 `OjPortal` + `OjPopper`。
*
* 受控与非受控都给：传 `open` 就是受控（配 `@update:open`），不传就内部自己管。
* 03 §2 要求"所有可选面板组件同时支持 `v-model` 与 `defaultVisible`"——只给受控会把
* "我想临时弹一下"这种最常见的用法写复杂。
*/
var OjTrigger = defineComponent({
	name: "OjTrigger",
	props: {
		open: {
			type: Boolean,
			default: void 0
		},
		modes: {
			type: [Array, String],
			default: () => ["click"]
		},
		placement: {
			type: String,
			default: "bottom-start"
		},
		openDelay: {
			type: Number,
			default: 0
		},
		closeDelay: {
			type: Number,
			default: 120
		},
		/** 面板是否挂到 body（`false` 留在原地） */
		portal: {
			type: Boolean,
			default: true
		},
		/** 透传给 `OjPortal` 的挂载点 */
		teleport: {
			type: [String, Boolean],
			default: "body"
		},
		lockScroll: {
			type: Boolean,
			default: false
		},
		trapFocus: {
			type: Boolean,
			default: false
		}
	},
	emits: [
		"update:open",
		"open",
		"close"
	],
	setup(props, { slots, emit }) {
		const anchor = ref(null);
		const inner = ref(false);
		const isControlled = () => props.open !== void 0;
		const isOpen = () => isControlled() ? props.open === true : inner.value;
		const machine = createTriggerMachine({
			modes: typeof props.modes === "string" ? [props.modes] : props.modes,
			openDelay: props.openDelay,
			closeDelay: props.closeDelay,
			onOpen: () => {
				if (!isControlled()) inner.value = true;
				emit("update:open", true);
				emit("open");
			},
			onClose: (reason) => {
				if (!isControlled()) inner.value = false;
				emit("update:open", false);
				emit("close", reason);
			}
		});
		watch(() => props.open, (open) => {
			if (open !== void 0) machine.sync(open);
		}, { immediate: true });
		onUnmounted(() => machine.dispose());
		function onKeydown(event) {
			if (event.key === "Escape" && isOpen()) machine.escape();
		}
		return () => {
			const open = isOpen();
			return h("span", {
				ref: anchor,
				class: "oj-trigger",
				"data-open": open ? "" : void 0,
				onClick: () => machine.press(),
				onMouseenter: () => machine.enter(),
				onMouseleave: () => machine.leave(),
				onFocusin: () => machine.focusIn(),
				onFocusout: () => machine.focusOut(),
				onKeydown
			}, [slots.default?.(), open ? h(OjPortal, {
				to: props.portal ? props.teleport : false,
				lockScroll: props.lockScroll,
				trapFocus: props.trapFocus
			}, () => h(OjPopper, {
				open,
				anchor: anchor.value,
				placement: props.placement
			}, () => h("div", {
				class: "oj-trigger__panel",
				role: "dialog",
				onMouseenter: () => machine.panelEnter(),
				onMouseleave: () => machine.panelLeave(),
				onKeydown
			}, slots.panel?.()))) : null]);
		};
	}
});
//#endregion
export { OjTrigger };
