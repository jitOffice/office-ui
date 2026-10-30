const require_trigger = require("../trigger.cjs");
const require_popper = require("./popper.cjs");
const require_portal = require("./portal.cjs");
let vue = require("vue");
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
var OjTrigger = (0, vue.defineComponent)({
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
		const anchor = (0, vue.ref)(null);
		const inner = (0, vue.ref)(false);
		const isControlled = () => props.open !== void 0;
		const isOpen = () => isControlled() ? props.open === true : inner.value;
		const machine = require_trigger.createTriggerMachine({
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
		(0, vue.watch)(() => props.open, (open) => {
			if (open !== void 0) machine.sync(open);
		}, { immediate: true });
		(0, vue.onUnmounted)(() => machine.dispose());
		function onKeydown(event) {
			if (event.key === "Escape" && isOpen()) machine.escape();
		}
		return () => {
			const open = isOpen();
			return (0, vue.h)("span", {
				ref: anchor,
				class: "oj-trigger",
				"data-open": open ? "" : void 0,
				onClick: () => machine.press(),
				onMouseenter: () => machine.enter(),
				onMouseleave: () => machine.leave(),
				onFocusin: () => machine.focusIn(),
				onFocusout: () => machine.focusOut(),
				onKeydown
			}, [slots.default?.(), open ? (0, vue.h)(require_portal.OjPortal, {
				to: props.portal ? props.teleport : false,
				lockScroll: props.lockScroll,
				trapFocus: props.trapFocus
			}, () => (0, vue.h)(require_popper.OjPopper, {
				open,
				anchor: anchor.value,
				placement: props.placement
			}, () => (0, vue.h)("div", {
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
exports.OjTrigger = OjTrigger;
