import { renameFile } from "../shell/file-name.js";
import { defineComponent, h, ref } from "vue";
//#region src/vue/file-name-header.ts
/**
* `OjFileNameHeader`（03 §3 F 组）：标题栏文件名 + 收藏 + 保存态。
*
* 编辑态的三个细节，缺一个都会在实际使用里被吐槽：
*   - **回车提交、Esc 取消、失焦取消**。失焦即提交是很常见的实现，但它让"点别处"变成一次改名；
*   - **非法名不退出编辑态**，只在下方给一行原因。退出等于把用户打的名字吞了；
*   - **未改动视为成功**（`renameFile` 的约定），否则"回车确认一个没改的名字"会报错。
*
* 保存态只画三档圆点/文案，文案由使用方给（`stateLabel`）："已保存到云端"这种句子没法由组件拼。
*/
var OjFileNameHeader = defineComponent({
	name: "OjFileNameHeader",
	props: {
		name: {
			type: String,
			required: true
		},
		state: {
			type: String,
			default: "saved"
		},
		/** 已格式化的保存态文案。 */
		stateLabel: {
			type: String,
			default: ""
		},
		/** 重命名入口的可访问名（"重命名文件"）。 */
		renameLabel: {
			type: String,
			required: true
		},
		/** 收藏按钮的可访问名（"收藏"）。 */
		favoriteLabel: {
			type: String,
			required: true
		},
		favored: {
			type: Boolean,
			default: false
		},
		editable: {
			type: Boolean,
			default: true
		},
		/** 非法名的原因文案，按种类给（组件不拼句子）。 */
		problemLabels: {
			type: Object,
			default: () => ({})
		}
	},
	emits: ["rename", "update:favored"],
	setup(props, { emit }) {
		const editing = ref(false);
		const draft = ref("");
		const problem = ref(void 0);
		function start() {
			if (!props.editable) return;
			draft.value = props.name;
			problem.value = void 0;
			editing.value = true;
		}
		function cancel() {
			editing.value = false;
			problem.value = void 0;
		}
		function commit() {
			const result = renameFile(props.name, draft.value);
			if (!result.ok) {
				problem.value = result.problem;
				return;
			}
			editing.value = false;
			problem.value = void 0;
			if (result.name !== props.name) emit("rename", result.name);
		}
		function onKeydown(event) {
			if (event.key === "Enter") {
				event.preventDefault();
				commit();
				return;
			}
			if (event.key === "Escape") {
				event.preventDefault();
				cancel();
			}
		}
		function input() {
			return h("input", {
				class: "oj-file-name__input",
				value: draft.value,
				"aria-label": props.renameLabel,
				"aria-invalid": problem.value === void 0 ? void 0 : "true",
				onInput: (event) => {
					draft.value = event.target.value;
					problem.value = void 0;
				},
				onKeydown,
				onBlur: cancel,
				onVnodeMounted: (vnode) => {
					const element = vnode.el;
					element?.focus();
					element?.select();
				}
			});
		}
		return () => {
			const message = problem.value === void 0 ? "" : props.problemLabels[problem.value] ?? "";
			return h("div", {
				class: "oj-file-name",
				"data-state": props.state
			}, [
				h("button", {
					type: "button",
					class: "oj-file-name__favorite",
					"data-active": props.favored ? "" : void 0,
					"aria-pressed": props.favored ? "true" : "false",
					"aria-label": props.favoriteLabel,
					title: props.favoriteLabel,
					onClick: () => emit("update:favored", !props.favored)
				}, "★"),
				editing.value ? input() : h("button", {
					type: "button",
					class: "oj-file-name__title",
					title: props.renameLabel,
					"aria-label": props.renameLabel,
					onClick: start
				}, props.name),
				props.stateLabel === "" ? null : h("span", {
					class: "oj-file-name__state",
					"data-state": props.state
				}, [h("i", {
					class: "oj-file-name__dot",
					"aria-hidden": "true"
				}), props.stateLabel]),
				message === "" ? null : h("span", {
					class: "oj-file-name__problem",
					role: "alert"
				}, message)
			]);
		};
	}
});
//#endregion
export { OjFileNameHeader };
