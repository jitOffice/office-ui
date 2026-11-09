import { SHARE_SCOPES, resolveShare, rolesForScope, setShareExpiry, setSharePeopleCount, setShareRole, setShareScope } from "../shell/share.js";
import { OjDialog } from "./dialog.js";
import { defineComponent, h } from "vue";
//#region src/vue/share-dialog.ts
/**
* `OjShareDialog`（03 §3 E 组）：共享范围 + 角色 + 链接有效期。
*
* 只负责把选择变成 `update:state`，确认时上抛 **归一化后的** `resolveShare(state)`——
* 也就是真正该发给后端的权限。界面显示"可评论"而请求里发"可编辑"这类事故，
* 根因就是两处各算一遍；这里只算一次。
*
* 范围切换时角色会降级（链接范围不给"可编辑"，见 `shell/share.ts`）：
* 降级发生在 `update:state` 里，不是渲染时偷偷改，宿主存下来的状态与界面永远一致。
*/
var OjShareDialog = defineComponent({
	name: "OjShareDialog",
	props: {
		open: {
			type: Boolean,
			required: true
		},
		title: {
			type: String,
			required: true
		},
		state: {
			type: Object,
			required: true
		},
		/** "谁可以访问"分组名。 */
		scopeLabel: {
			type: String,
			required: true
		},
		/** "权限"分组名。 */
		roleLabel: {
			type: String,
			required: true
		},
		scopeLabels: {
			type: Object,
			required: true
		},
		roleLabels: {
			type: Object,
			required: true
		},
		expiryLabel: {
			type: String,
			default: ""
		},
		expiryOptions: {
			type: Array,
			default: () => []
		},
		peopleLabel: {
			type: String,
			default: ""
		},
		confirmLabel: {
			type: String,
			default: ""
		},
		cancelLabel: {
			type: String,
			default: ""
		},
		teleport: {
			type: [String, Boolean],
			default: "body"
		}
	},
	emits: [
		"update:open",
		"update:state",
		"confirm",
		"cancel"
	],
	setup(props, { emit }) {
		function option(scope) {
			const active = props.state.scope === scope;
			return h("label", {
				class: "oj-share__option",
				"data-active": active ? "" : void 0
			}, [h("input", {
				class: "oj-share__radio",
				type: "radio",
				name: "oj-share-scope",
				value: scope,
				checked: active,
				onChange: () => emit("update:state", setShareScope(props.state, scope))
			}), h("span", { class: "oj-share__option-text" }, props.scopeLabels[scope])]);
		}
		function role(role) {
			const active = props.state.role === role;
			return h("label", {
				class: "oj-share__option",
				"data-active": active ? "" : void 0
			}, [h("input", {
				class: "oj-share__radio",
				type: "radio",
				name: "oj-share-role",
				value: role,
				checked: active,
				onChange: () => emit("update:state", setShareRole(props.state, role))
			}), h("span", { class: "oj-share__option-text" }, props.roleLabels[role])]);
		}
		return () => {
			const roles = rolesForScope(props.state.scope);
			const body = [h("fieldset", { class: "oj-share__group" }, [h("legend", { class: "oj-share__legend" }, props.scopeLabel), ...SHARE_SCOPES.map(option)])];
			if (roles.length > 0) body.push(h("fieldset", { class: "oj-share__group" }, [h("legend", { class: "oj-share__legend" }, props.roleLabel), ...roles.map(role)]));
			if (props.state.scope === "link" && props.expiryOptions.length > 0) body.push(h("label", { class: "oj-share__field" }, [h("span", { class: "oj-share__field-label" }, props.expiryLabel), h("select", {
				class: "oj-share__select",
				value: String(props.state.expiryDays),
				onChange: (event) => emit("update:state", setShareExpiry(props.state, Number(event.target.value)))
			}, props.expiryOptions.map((choice) => h("option", {
				value: String(choice.days),
				selected: choice.days === props.state.expiryDays
			}, choice.label)))]));
			if (props.state.scope === "people" && props.peopleLabel !== "") body.push(h("label", { class: "oj-share__field" }, [h("span", { class: "oj-share__field-label" }, props.peopleLabel), h("input", {
				class: "oj-share__count",
				type: "number",
				min: 0,
				value: String(props.state.peopleCount),
				onChange: (event) => emit("update:state", setSharePeopleCount(props.state, Number(event.target.value)))
			})]));
			return h(OjDialog, {
				open: props.open,
				title: props.title,
				confirmLabel: props.confirmLabel,
				cancelLabel: props.cancelLabel,
				teleport: props.teleport,
				onConfirm: () => emit("confirm", resolveShare(props.state)),
				onCancel: () => emit("cancel"),
				"onUpdate:open": (open) => emit("update:open", open)
			}, { default: () => h("div", { class: "oj-share" }, body) });
		};
	}
});
//#endregion
export { OjShareDialog };
