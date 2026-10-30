import { Teleport, defineComponent, h, onMounted, onUnmounted, ref } from "vue";
//#region src/vue/portal.ts
/**
* 浮层挂载与层级（prd/03 §3 D 组）。
*
* 三件事必须一起做，缺一件都会在 Office 场景里出问题：
*   1. **teleport 目标可配**：全屏放映要投进放映容器、iframe 内要投进它自己的 document、打印区域同理，
*      一律挂 body 是不行的。`false` 表示留在原地（宿主已自己做层级管理）。
*   2. **层级取自 `--oj-z-*`**：写死 `z-index: 9999` 的库和宿主应用拼层级时必输，
*      而 token 里 `--oj-z-dropdown/modal/toast` 的相对顺序是设计过的。
*   3. **滚动锁 + 焦点陷阱**：模态浮层必须挡住背景滚动，且 Tab 不许跑出去。
*      焦点陷阱还要**归还焦点**——关闭后焦点若掉到 `body`，键盘用户就丢了自己的位置。
*/
var FOCUSABLE = "a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex=\"-1\"])";
/** 多个浮层同时开时不能互相踩：计数归零才恢复原来的 `overflow`。 */
var scrollLocks = 0;
var previousOverflow = "";
function lockScroll() {
	if (typeof document === "undefined") return;
	if (scrollLocks === 0) {
		previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
	}
	scrollLocks += 1;
}
function unlockScroll() {
	if (typeof document === "undefined") return;
	scrollLocks = Math.max(0, scrollLocks - 1);
	if (scrollLocks === 0) document.body.style.overflow = previousOverflow;
}
function teleportTarget(value) {
	if (value === false) return void 0;
	return typeof value === "string" && value.length > 0 ? value : "body";
}
var OjPortal = defineComponent({
	name: "OjPortal",
	props: {
		/** `'body' | '#selector' | false` */
		to: {
			type: [String, Boolean],
			default: "body"
		},
		/** 层级，默认取浮层档；要盖住模态就用 `var(--oj-z-modal)` */
		zIndex: {
			type: String,
			default: "var(--oj-z-popover)"
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
	setup(props, { slots }) {
		const root = ref(null);
		let restoreTo = null;
		function focusables() {
			const el = root.value;
			if (!el) return [];
			return [...el.querySelectorAll(FOCUSABLE)];
		}
		function onKeydown(event) {
			if (!props.trapFocus || event.key !== "Tab") return;
			const items = focusables();
			if (items.length === 0) {
				event.preventDefault();
				root.value?.focus();
				return;
			}
			const first = items[0];
			const last = items[items.length - 1];
			const active = document.activeElement;
			const leavingEnd = !event.shiftKey && active === last;
			const leavingStart = event.shiftKey && (active === first || active === root.value);
			if (leavingEnd) {
				event.preventDefault();
				first.focus();
			} else if (leavingStart) {
				event.preventDefault();
				last.focus();
			}
		}
		onMounted(() => {
			if (props.lockScroll) lockScroll();
			if (props.trapFocus) {
				restoreTo = document.activeElement instanceof HTMLElement ? document.activeElement : null;
				const [first] = focusables();
				(first ?? root.value)?.focus();
			}
		});
		onUnmounted(() => {
			if (props.lockScroll) unlockScroll();
			restoreTo?.focus();
			restoreTo = null;
		});
		return () => {
			const content = h("div", {
				ref: root,
				class: "oj-portal",
				tabindex: props.trapFocus ? -1 : void 0,
				style: { zIndex: props.zIndex },
				onKeydown
			}, slots.default?.());
			const to = teleportTarget(props.to);
			return to === void 0 ? content : h(Teleport, { to }, [content]);
		};
	}
});
//#endregion
export { OjPortal };
