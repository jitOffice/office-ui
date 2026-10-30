import { detectPlatform, formatHotkey } from "../hotkey.js";
import { filterPaletteItems, paletteStep } from "../palette.js";
import { OjPortal } from "./portal.js";
import { computed, defineComponent, h, ref, watch } from "vue";
//#region src/vue/command-palette.ts
/**
* `OjCommandPalette`（03 §3 B 组）：`Ctrl+/` 或 `Ctrl+P` 唤起的命令搜索。
*
* 搜索排序在 `palette.ts`（零依赖、有单测），这里只管浮层与键盘：
*   - `role="dialog"` + 焦点陷阱 + 关闭归还焦点，全部复用 `OjPortal`；
*   - 输入框是 `combobox`，高亮项通过 `aria-activedescendant` 报给读屏；
*   - **IME 合成期间不抢 `Enter`**（03 §5 第 7 条）：中日文用户正在选词时回车，
*     意图是"确认这个词"，不是"执行第一条命令"。
*/
var OjCommandPalette = defineComponent({
	name: "OjCommandPalette",
	props: {
		open: {
			type: Boolean,
			required: true
		},
		items: {
			type: Array,
			required: true
		},
		/** 受控查询词；不给则组件自己记（仍会发 `update:query`） */
		query: {
			type: String,
			default: void 0
		},
		label: {
			type: String,
			default: "命令面板"
		},
		placeholder: {
			type: String,
			default: "搜索命令"
		},
		emptyLabel: {
			type: String,
			default: "没有匹配的命令"
		}
	},
	emits: [
		"update:open",
		"update:query",
		"select"
	],
	setup(props, { emit }) {
		const inner = ref("");
		const active = ref(0);
		const platform = detectPlatform();
		const text = computed(() => props.query ?? inner.value);
		const results = computed(() => filterPaletteItems(props.items, text.value));
		const current = computed(() => results.value[active.value]);
		watch(() => props.open, (open) => {
			if (open) active.value = 0;
		});
		watch(() => results.value.length, (length) => {
			if (active.value > length - 1) active.value = Math.max(0, length - 1);
		});
		function close() {
			emit("update:open", false);
		}
		function choose(index) {
			const item = results.value[index];
			if (item === void 0 || item.disabled) return;
			emit("select", item.id);
			close();
		}
		function onKeydown(event) {
			if (event.key === "ArrowDown" || event.key === "ArrowUp") {
				event.preventDefault();
				active.value = paletteStep(results.value.length, active.value, event.key === "ArrowDown" ? 1 : -1);
				return;
			}
			if (event.key === "Home" || event.key === "End") {
				event.preventDefault();
				active.value = event.key === "Home" ? 0 : Math.max(0, results.value.length - 1);
				return;
			}
			if (event.key === "Enter") {
				if (event.isComposing) return;
				event.preventDefault();
				choose(active.value);
				return;
			}
			if (event.key === "Escape") {
				event.stopPropagation();
				close();
			}
		}
		function onInput(event) {
			const value = event.target.value;
			inner.value = value;
			active.value = 0;
			emit("update:query", value);
		}
		function keyLabel(item) {
			if (item.keys === void 0) return void 0;
			const first = typeof item.keys === "string" ? item.keys : item.keys[0];
			return first === void 0 ? void 0 : formatHotkey(first, platform);
		}
		return () => {
			if (!props.open) return null;
			return h(OjPortal, {
				trapFocus: true,
				lockScroll: true,
				zIndex: "var(--oj-z-modal)"
			}, { default: () => h("div", {
				class: "oj-palette__mask",
				onClick: (event) => {
					if (event.target === event.currentTarget) close();
				}
			}, [h("div", {
				class: "oj-palette",
				role: "dialog",
				"aria-modal": "true",
				"aria-label": props.label,
				onKeydown
			}, [
				h("input", {
					class: "oj-palette__input",
					type: "search",
					value: text.value,
					placeholder: props.placeholder,
					"aria-label": props.placeholder,
					role: "combobox",
					"aria-expanded": "true",
					"aria-controls": "oj-palette-list",
					"aria-autocomplete": "list",
					"aria-activedescendant": current.value === void 0 ? void 0 : `oj-palette-${current.value.id}`,
					onInput
				}),
				h("ul", {
					class: "oj-palette__list",
					id: "oj-palette-list",
					role: "listbox",
					"aria-label": props.label
				}, results.value.map((item, index) => h("li", {
					id: `oj-palette-${item.id}`,
					class: "oj-palette__item",
					role: "option",
					"data-item": item.id,
					"data-active": index === active.value ? "" : void 0,
					"aria-selected": index === active.value ? "true" : "false",
					"aria-disabled": item.disabled ? "true" : void 0,
					onClick: () => choose(index)
				}, [
					h("span", { class: "oj-palette__label" }, item.label),
					item.group === void 0 ? null : h("span", { class: "oj-palette__group" }, item.group),
					keyLabel(item) === void 0 ? null : h("kbd", { class: "oj-palette__keys" }, keyLabel(item))
				]))),
				results.value.length === 0 ? h("p", { class: "oj-palette__empty" }, props.emptyLabel) : null
			])]) });
		};
	}
});
//#endregion
export { OjCommandPalette };
