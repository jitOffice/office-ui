import { SYMBOL_GROUPS, filterSymbols, flattenSymbols } from "../shell/symbols.js";
import { galleryNeighbor } from "../shell/gallery.js";
import { defineComponent, h, ref } from "vue";
//#region src/vue/symbol-picker.ts
/**
* `OjSymbolPicker`（03 §3 / M2）：插入 Unicode 符号。
*
* 与其它 picker 的区别：它**没有 modelValue**。选符号是"插入动作"（`select`），
* 不是"选一个持久状态"——把插入做成受控值，会让连续插两个符号时第二个把第一个覆盖掉。
*
* 分组标题由使用方给（`groupLabels`）：组件库里写死中文标题，日文界面就永远翻不掉。
*/
var OjSymbolPicker = defineComponent({
	name: "OjSymbolPicker",
	props: {
		groups: {
			type: Array,
			default: () => SYMBOL_GROUPS
		},
		label: {
			type: String,
			required: true
		},
		/** 搜索框占位文案（语言相关）。 */
		placeholder: {
			type: String,
			default: ""
		},
		/** 分组 id → 显示名；缺省不渲染标题。 */
		groupLabels: {
			type: Object,
			default: () => ({})
		},
		/** 网格列数，键盘左右移动按它算。 */
		columns: {
			type: Number,
			default: 8
		}
	},
	emits: ["select"],
	setup(props, { emit }) {
		const query = ref("");
		const active = ref(0);
		const columns = () => Number.isFinite(props.columns) && props.columns >= 1 ? Math.floor(props.columns) : 1;
		return () => {
			const visible = filterSymbols(props.groups, query.value);
			const flat = flattenSymbols(visible);
			const current = Math.min(Math.max(active.value, 0), Math.max(flat.length - 1, 0));
			return h("div", {
				class: "oj-symbol-picker",
				role: "listbox",
				"aria-label": props.label,
				onKeydown: (event) => {
					if (event.key === "Enter") {
						const symbol = flat[current];
						if (symbol === void 0) return;
						event.preventDefault();
						emit("select", symbol.char);
						return;
					}
					const next = galleryNeighbor(columns(), flat.length, current, event.key);
					if (next === current) return;
					event.preventDefault();
					active.value = next;
				}
			}, [h("input", {
				class: "oj-symbol-picker__search",
				type: "search",
				"aria-label": props.label,
				placeholder: props.placeholder,
				onInput: (event) => {
					query.value = event.target.value;
					active.value = 0;
				}
			}), ...visible.map((group) => h("div", {
				class: "oj-symbol-picker__group",
				role: "group",
				"aria-label": props.groupLabels[group.id] ?? group.id
			}, [props.groupLabels[group.id] !== void 0 ? h("p", { class: "oj-symbol-picker__group-label" }, props.groupLabels[group.id]) : null, h("div", {
				class: "oj-symbol-picker__grid",
				style: { gridTemplateColumns: `repeat(${columns()}, 24px)` }
			}, group.symbols.map((symbol) => {
				const index = flat.indexOf(symbol);
				return h("button", {
					key: `${group.id}-${symbol.char}`,
					type: "button",
					class: "oj-symbol-picker__cell",
					role: "option",
					"aria-label": symbol.name,
					"aria-selected": index === current ? "true" : "false",
					"data-active": index === current ? "" : void 0,
					onClick: () => {
						active.value = index;
						emit("select", symbol.char);
					}
				}, symbol.char);
			}))]))]);
		};
	}
});
//#endregion
export { OjSymbolPicker };
