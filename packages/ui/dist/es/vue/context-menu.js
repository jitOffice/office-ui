import { menuAction, menuNeighbor, menuSelectable } from "../menu.js";
import { OjPopper } from "./popper.js";
import { OjPortal } from "./portal.js";
import { computed, defineComponent, h, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
//#region src/vue/context-menu.ts
/**
* `OjContextMenu`（03 §3 B 组）。
*
* 关键差异在**没有 DOM 锚点**：文档里选中文字、表格里点了右键、canvas 上按了 `contextmenu`，
* 锚点只是一个坐标。所以定位走 `OjPopper` 的 `anchorBox`（零尺寸矩形），
* 不依赖任何元素，也就不需要"先找一个元素再量"的那套。
*
* 键盘模型（03 §5）：菜单一开就把焦点放到第一个可选项，上下键**环绕**、Home/End 跳首尾、
* Enter/空格执行、Esc/Tab 关闭。焦点是真的落在 `<button role="menuitem">` 上（roving tabindex），
* 不是靠 `aria-activedescendant`——后者在 Office 这种"菜单里还嵌选择器"的场景里更容易漏更新。
*
* 关闭时把焦点**还给打开前的位置**：canvas 场景下它可能只是 body（那就别抢），
* 但在输入框上右键的菜单，关掉之后用户还得接着打字。
*/
var OjContextMenu = defineComponent({
	name: "OjContextMenu",
	props: {
		open: {
			type: Boolean,
			required: true
		},
		items: {
			type: Array,
			required: true
		},
		/** 视口坐标（`clientX` / `clientY` 直接给，不要减滚动量） */
		x: {
			type: Number,
			default: 0
		},
		y: {
			type: Number,
			default: 0
		},
		/** `'body' | '#selector' | false`（03 §2「弹层归属」） */
		teleport: {
			type: [String, Boolean],
			default: "body"
		},
		label: {
			type: String,
			default: void 0
		}
	},
	emits: [
		"update:open",
		"select",
		"close"
	],
	setup(props, { emit }) {
		const list = ref(null);
		const active = ref(-1);
		let restoreTo = null;
		/** 零尺寸锚点：菜单左上角落在右键位置，越界由 `placePopper` 翻转/夹取。 */
		const anchorBox = computed(() => ({
			x: props.x,
			y: props.y,
			width: 0,
			height: 0
		}));
		function close(reason) {
			emit("update:open", false);
			emit("close", reason);
		}
		function focusIndex(index) {
			active.value = index;
			if (index < 0) return;
			list.value?.querySelector(`[data-menu-index="${index}"]`)?.focus();
		}
		function move(key) {
			const next = menuNeighbor(props.items, active.value, key);
			if (next === active.value) return false;
			focusIndex(next);
			return true;
		}
		function choose(item) {
			emit("select", item.id);
			close("select");
		}
		function onPointerDown(event) {
			const el = list.value;
			if (el !== null && event.target instanceof Node && el.contains(event.target)) return;
			close("outside");
		}
		function onKeydown(event) {
			if (event.key === "Escape") {
				event.preventDefault();
				event.stopPropagation();
				close("escape");
				return;
			}
			if (event.key === "Tab") {
				event.preventDefault();
				close("tab");
				return;
			}
			if (event.key === "Enter" || event.key === " ") {
				const item = menuAction(props.items, active.value);
				if (item === void 0) return;
				event.preventDefault();
				choose(item);
				return;
			}
			if (move(event.key)) event.preventDefault();
		}
		function bindDocument() {
			if (typeof document === "undefined") return;
			document.addEventListener("pointerdown", onPointerDown, true);
		}
		function unbindDocument() {
			if (typeof document === "undefined") return;
			document.removeEventListener("pointerdown", onPointerDown, true);
		}
		function activate() {
			if (typeof document === "undefined") return;
			restoreTo = document.activeElement instanceof HTMLElement ? document.activeElement : null;
			bindDocument();
			nextTick(() => focusIndex(menuNeighbor(props.items, -1, "ArrowDown")));
		}
		function deactivate() {
			if (typeof document === "undefined") return;
			unbindDocument();
			active.value = -1;
			if (restoreTo !== null && restoreTo !== document.body && restoreTo.isConnected) restoreTo.focus();
			restoreTo = null;
		}
		onMounted(() => {
			if (props.open) activate();
		});
		watch(() => props.open, (open) => {
			if (open) activate();
			else deactivate();
		});
		onUnmounted(unbindDocument);
		function renderItem(item, index) {
			if (item.kind === "separator") return h("div", {
				class: "oj-context-menu__separator",
				role: "separator"
			});
			return h("button", {
				type: "button",
				class: "oj-context-menu__item",
				role: "menuitem",
				"data-menu-index": index,
				"data-danger": item.danger ? "" : void 0,
				"data-active": index === active.value ? "" : void 0,
				"aria-disabled": item.disabled ? "true" : void 0,
				tabindex: "-1",
				disabled: item.disabled || void 0,
				onMouseenter: () => {
					if (menuSelectable(item)) active.value = index;
				},
				onClick: () => {
					if (!menuSelectable(item)) return;
					choose(item);
				}
			}, [h("span", { class: "oj-context-menu__label" }, item.label ?? item.id), item.shortcut === void 0 ? null : h("kbd", { class: "oj-context-menu__shortcut" }, item.shortcut)]);
		}
		return () => {
			if (!props.open) return null;
			const nodes = [];
			props.items.forEach((item, index) => {
				if (item.separatorBefore) nodes.push(h("div", {
					class: "oj-context-menu__separator",
					role: "separator"
				}));
				nodes.push(renderItem(item, index));
			});
			return h(OjPortal, {
				to: props.teleport,
				zIndex: "var(--oj-z-dropdown)"
			}, () => h(OjPopper, {
				open: props.open,
				anchorBox: anchorBox.value
			}, () => h("div", {
				ref: list,
				class: "oj-context-menu",
				role: "menu",
				"aria-label": props.label,
				tabindex: "-1",
				onKeydown
			}, nodes)));
		};
	}
});
//#endregion
export { OjContextMenu };
