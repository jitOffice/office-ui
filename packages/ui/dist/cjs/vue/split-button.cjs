const require_icon = require("./icon.cjs");
const require_popper = require("./popper.cjs");
let vue = require("vue");
//#region src/vue/split-button.ts
/**
* `OjSplitButton`（03 §3 B 组）：主操作与下拉箭头**分成两个可点区域**。
*
* 这条拆分是这类控件的全部价值：合成一个按钮的话，"粘贴"与"粘贴为纯文本"会变成
* 点两次才能选到，而用户想要的往往是默认那一下。所以点击主区只发 `run`，
* 箭头只负责开菜单；靠的是两个独立的 `<button>`，不是在一个按钮里判断坐标。
*
* 菜单条目读 `data-value`：有值就发 `select(value)`，没有就让插槽自己处理点击。
*/
var OjSplitButton = (0, vue.defineComponent)({
	name: "OjSplitButton",
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
		menuLabel: {
			type: String,
			default: "更多选项"
		},
		size: {
			type: String,
			default: "medium"
		}
	},
	emits: [
		"run",
		"update:open",
		"select"
	],
	setup(props, { slots, emit }) {
		const root = (0, vue.ref)(null);
		const arrow = (0, vue.ref)(null);
		const inner = (0, vue.ref)(false);
		const isOpen = (0, vue.computed)(() => props.open ?? inner.value);
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
			if (!isOpen.value) return;
			if (event.key !== "Escape") return;
			event.stopPropagation();
			setOpen(false);
			arrow.value?.focus();
		}
		(0, vue.onMounted)(() => {
			document.addEventListener("pointerdown", onPointerDown);
			document.addEventListener("keydown", onKeydown);
		});
		(0, vue.onUnmounted)(() => {
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
			return (0, vue.h)("div", {
				ref: root,
				class: "oj-split"
			}, [
				(0, vue.h)("button", {
					type: "button",
					class: "oj-split__main oj-button",
					"data-size": size,
					disabled: props.disabled || void 0,
					onClick: () => {
						if (props.disabled) return;
						emit("run");
					}
				}, [props.icon ? (0, vue.h)(require_icon.OjIcon, {
					name: props.icon,
					decorative: true
				}) : null, (0, vue.h)("span", { class: "oj-button__label" }, slots.label?.() ?? props.label)]),
				(0, vue.h)("button", {
					ref: arrow,
					type: "button",
					class: "oj-split__arrow oj-button",
					"data-size": size,
					disabled: props.disabled || void 0,
					"aria-haspopup": "menu",
					"aria-expanded": isOpen.value ? "true" : "false",
					"aria-label": props.menuLabel,
					title: props.menuLabel,
					onClick: () => {
						if (props.disabled) return;
						setOpen(!isOpen.value);
					},
					onKeydown: (event) => {
						if (props.disabled || event.key !== "ArrowDown") return;
						event.preventDefault();
						setOpen(true);
					}
				}, (0, vue.h)(require_icon.OjIcon, {
					name: "oj-chevron-down",
					decorative: true
				})),
				(0, vue.h)(require_popper.OjPopper, {
					open: isOpen.value,
					anchor: arrow.value,
					placement: "bottom-start"
				}, { default: () => (0, vue.h)("div", {
					class: "oj-split__menu",
					role: "menu",
					"aria-label": props.menuLabel,
					onClick: onClickMenu
				}, [slots.default?.()]) })
			]);
		};
	}
});
//#endregion
exports.OjSplitButton = OjSplitButton;
