import { useLocale } from "./locale.js";
import { computed, defineComponent, h } from "vue";
//#region src/vue/locale-switcher.ts
/**
* `OjLocaleSwitcher`（04 §6.1、03 §6 M1「语言切换器」）。
*
* 用原生 `<select>` 而不是自绘下拉：它自带 IME、读屏的角色语义、移动端的原生选择器，
* 自绘在这里换不到任何东西。样式只负责把它压到状态栏 / 工具条那一行的高度与配色。
*
* 受控与非受控的区别只在"谁去改运行时"：
*   - 没给 `modelValue`：组件自己 `useLocale().use(name)`，一个字都不用配就能切语言；
*   - 给了 `modelValue`：只发事件，由宿主决定何时 `i18n.use()`——宿主可能在切换前先存一次偏好设置。
* 两种都发 `update:modelValue` 与 `change`（`change` 只由用户操作触发，03 §2）。
*/
var OjLocaleSwitcher = defineComponent({
	name: "OjLocaleSwitcher",
	props: {
		/** 显式语言表。不给就用 Provider 注册表里的（按 `name` 字典序，由运行时排好） */
		locales: {
			type: Array,
			default: void 0
		},
		/** 受控值：当前语言 `name` */
		modelValue: {
			type: String,
			default: void 0
		},
		/** 可访问名。不给则取 `oj.common.language`（切语言后跟着变） */
		label: {
			type: String,
			default: void 0
		},
		disabled: {
			type: Boolean,
			default: false
		}
	},
	emits: ["update:modelValue", "change"],
	setup(props, { emit }) {
		const locale = useLocale();
		const options = computed(() => props.locales ?? locale.list());
		const current = computed(() => props.modelValue ?? locale.lang.value);
		const name = computed(() => {
			locale.lang.value;
			return props.label ?? locale.t("oj.common.language", "语言");
		});
		function select(event) {
			const target = event.target;
			const next = target.value;
			emit("update:modelValue", next);
			emit("change", next);
			if (props.modelValue === void 0) {
				locale.use(next);
				return;
			}
			target.value = props.modelValue;
		}
		return () => {
			const items = options.value;
			if (items.length === 0) return null;
			const value = current.value;
			return h("span", {
				class: "oj-locale-switcher",
				"data-disabled": props.disabled ? "" : void 0
			}, [h("select", {
				class: "oj-locale-switcher__select",
				"aria-label": name.value,
				disabled: props.disabled || void 0,
				value,
				onChange: select
			}, items.map((item) => h("option", {
				value: item.name,
				selected: item.name === value
			}, item.label ?? item.name)))]);
		};
	}
});
//#endregion
export { OjLocaleSwitcher };
