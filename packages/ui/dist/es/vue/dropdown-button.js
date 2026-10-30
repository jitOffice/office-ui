import { OjIcon } from "./icon.js";
import { OjPopper } from "./popper.js";
import { computed, defineComponent, h, onMounted, onUnmounted, ref } from "vue";
//#region src/vue/dropdown-button.ts
/**
* `OjDropdownButton`（03 §3 B 组）：整颗按钮是触发器，点开是一组命令。
*
* 与 `OjSplitButton` 的差别只有一点：**这里没有主操作**。"边框"这类命令本身没有默认值，
* 硬给它一个"应用上次选择"的主区，反而会让用户在不该改格式的时候改了格式。
*
* 键盘：`↓` 打开、`Esc` 关闭并把焦点还给触发器（03 §5 第 3 条），
* 菜单条目的点击语义与拆分按钮一致——读 `data-value`。
*/
var OjDropdownButton = defineComponent({
	name: "OjDropdownButton",
	props: {
		label: {
			type: String,
			required: true
		},
		icon: {
			type: String,
			default: void 0
		},
		disabled: {
			type: Boolean,
			default: false
		},
		/** 受控展开；不给则组件自己记（仍会发 `update:open`） */
		open: {
			type: Boolean,
			default: void 0
		},
		size: {
			type: String,
			default: "medium"
		},
		menuLabel: {
			type: String,
			default: void 0
		}
	},
	emits: ["update:open", "select"],
	setup(props, { slots, emit }) {
		const root = ref(null);
		const trigger = ref(null);
		const inner = ref(false);
		const isOpen = computed(() => props.open ?? inner.value);
		const menuLabel = computed(() => props.menuLabel ?? props.label);
		function setOpen(next) {
			inner.value = next;
			emit("update:open", next);
		}
		function onPointerDown(event) {
			const el = root.value;
			if (!isOpen.value || !el || !(event.target instanceof Node)) return;
			if (el.contains(event.target)) return;
			setOpen(false);
		}
		function onKeydown(event) {
			if (!isOpen.value || event.key !== "Escape") return;
			event.stopPropagation();
			setOpen(false);
			trigger.value?.focus();
		}
		onMounted(() => {
			document.addEventListener("pointerdown", onPointerDown);
			document.addEventListener("keydown", onKeydown);
		});
		onUnmounted(() => {
			document.removeEventListener("pointerdown", onPointerDown);
			document.removeEventListener("keydown", onKeydown);
		});
		function onClickMenu(event) {
			const target = event.target;
			const value = target instanceof Element ? target.closest("[data-value]")?.getAttribute("data-value") : null;
			if (value != null) emit("select", value);
			setOpen(false);
		}
		return () => {
			const size = props.size === "mini" ? "mini" : void 0;
			return h("div", {
				ref: root,
				class: "oj-dropdown-button"
			}, [h("button", {
				ref: trigger,
				type: "button",
				class: "oj-dropdown-button__trigger oj-button",
				"data-size": size,
				disabled: props.disabled || void 0,
				"aria-haspopup": "menu",
				"aria-expanded": isOpen.value ? "true" : "false",
				onClick: () => {
					if (props.disabled) return;
					setOpen(!isOpen.value);
				},
				onKeydown: (event) => {
					if (props.disabled || event.key !== "ArrowDown") return;
					event.preventDefault();
					setOpen(true);
				}
			}, [
				props.icon ? h(OjIcon, {
					name: props.icon,
					decorative: true
				}) : null,
				h("span", { class: "oj-button__label" }, slots.label?.() ?? props.label),
				h(OjIcon, {
					name: "oj-chevron-down",
					decorative: true
				})
			]), h(OjPopper, {
				open: isOpen.value,
				anchor: trigger.value,
				placement: "bottom-start"
			}, { default: () => h("div", {
				class: "oj-dropdown-button__menu",
				role: "menu",
				"aria-label": menuLabel.value,
				onClick: onClickMenu
			}, [slots.default?.()]) })]);
		};
	}
});
//#endregion
export { OjDropdownButton };
