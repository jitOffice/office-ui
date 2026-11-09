const require_versions = require("../shell/versions.cjs");
let vue = require("vue");
//#region src/vue/version-history.ts
/**
* `OjVersionHistory`（03 §3 E 组）：版本时间线，支持预览、命名、恢复（带确认）。
*
* 恢复**必须二次确认**，而且确认条就贴在那一条下面：弹窗确认里用户看不到自己要覆盖的是哪个版本，
* 只能凭记忆点"确定"。确认条用 `role="alertdialog"`，读屏也会先念"覆盖当前内容？"。
*
* 命名用行内输入：改完按 Enter 或失焦提交、Esc 取消、清空等于退回自动版本
* （`renameVersion` 把空名字处理成"去掉名字"）。命名不改顺序——排序只看时间，
* 否则用户刚改完名字，那一条就跳到别处去了。
*
* 时间格式化交给宿主（`formatTime`），组件不猜地区格式。
*/
var OjVersionHistory = (0, vue.defineComponent)({
	name: "OjVersionHistory",
	props: {
		entries: {
			type: Array,
			required: true
		},
		/** 列表的可访问名（"版本历史"）。 */
		label: {
			type: String,
			required: true
		},
		previewLabel: {
			type: String,
			required: true
		},
		restoreLabel: {
			type: String,
			required: true
		},
		renameLabel: {
			type: String,
			required: true
		},
		/** 确认条上的提示（"恢复后当前内容会被覆盖"）。 */
		restorePrompt: {
			type: String,
			required: true
		},
		confirmRestoreLabel: {
			type: String,
			required: true
		},
		cancelRestoreLabel: {
			type: String,
			required: true
		},
		emptyLabel: {
			type: String,
			default: ""
		},
		/** 时间格式化；默认用系统地区格式，宿主可换成固定格式。 */
		formatTime: {
			type: Function,
			default: (at) => new Date(at).toLocaleString()
		}
	},
	emits: [
		"preview",
		"restore",
		"rename"
	],
	setup(props, { emit }) {
		const renamingId = (0, vue.ref)(null);
		const draft = (0, vue.ref)("");
		const restore = (0, vue.ref)(require_versions.IDLE_RESTORE);
		function startRename(entry) {
			renamingId.value = entry.id;
			draft.value = entry.name ?? "";
		}
		function cancelRename() {
			renamingId.value = null;
		}
		function commitRename() {
			const id = renamingId.value;
			if (id === null) return;
			renamingId.value = null;
			const original = props.entries.find((entry) => entry.id === id)?.name ?? "";
			const name = draft.value.trim();
			if (name === original) return;
			emit("rename", id, name);
		}
		function askRestore(id) {
			restore.value = require_versions.requestRestore(restore.value, id);
		}
		function cancel() {
			restore.value = require_versions.cancelRestore(restore.value);
		}
		function confirm() {
			const id = require_versions.restoreEntryId(require_versions.confirmRestore(restore.value));
			restore.value = require_versions.IDLE_RESTORE;
			if (id !== void 0) emit("restore", id);
		}
		return () => {
			const entries = require_versions.sortVersions(props.entries);
			if (entries.length === 0) return props.emptyLabel === "" ? null : (0, vue.h)("p", { class: "oj-version-history__empty" }, props.emptyLabel);
			return (0, vue.h)("section", {
				class: "oj-version-history",
				"aria-label": props.label
			}, [(0, vue.h)("ol", { class: "oj-version-history__list" }, entries.map((entry) => {
				const renaming = renamingId.value === entry.id;
				const confirming = restore.value.status === "confirming" && restore.value.entryId === entry.id;
				return (0, vue.h)("li", {
					class: "oj-version-history__item",
					"data-version": entry.id,
					key: entry.id
				}, [
					(0, vue.h)("div", { class: "oj-version-history__head" }, [
						entry.name === void 0 ? null : (0, vue.h)("span", { class: "oj-version-history__name" }, entry.name),
						(0, vue.h)("span", { class: "oj-version-history__time" }, props.formatTime(entry.at)),
						(0, vue.h)("span", { class: "oj-version-history__author" }, entry.author)
					]),
					entry.summary === void 0 ? null : (0, vue.h)("p", { class: "oj-version-history__summary" }, entry.summary),
					renaming ? (0, vue.h)("div", { class: "oj-version-history__rename" }, [(0, vue.h)("input", {
						class: "oj-version-history__input",
						value: draft.value,
						"aria-label": props.renameLabel,
						onInput: (event) => {
							draft.value = event.target.value;
						},
						onKeydown: (event) => {
							if (event.key === "Enter") {
								event.preventDefault();
								commitRename();
							} else if (event.key === "Escape") {
								event.preventDefault();
								cancelRename();
							}
						},
						onBlur: () => commitRename(),
						ref: (element) => {
							const input = element;
							if (input !== null && typeof input.focus === "function" && document.activeElement !== input) input.focus();
						}
					})]) : null,
					confirming ? (0, vue.h)("div", {
						class: "oj-version-history__confirm",
						role: "alertdialog",
						"aria-label": props.restorePrompt
					}, [
						(0, vue.h)("span", { class: "oj-version-history__prompt" }, props.restorePrompt),
						(0, vue.h)("button", {
							type: "button",
							class: "oj-button",
							"data-size": "mini",
							onClick: cancel
						}, props.cancelRestoreLabel),
						(0, vue.h)("button", {
							type: "button",
							class: "oj-button oj-version-history__confirm-restore",
							"data-size": "mini",
							"data-active": "",
							onClick: confirm
						}, props.confirmRestoreLabel)
					]) : null,
					(0, vue.h)("div", { class: "oj-version-history__actions" }, [
						(0, vue.h)("button", {
							type: "button",
							class: "oj-button",
							"data-size": "mini",
							onClick: () => emit("preview", entry.id)
						}, props.previewLabel),
						(0, vue.h)("button", {
							type: "button",
							class: "oj-button",
							"data-size": "mini",
							onClick: () => askRestore(entry.id)
						}, props.restoreLabel),
						(0, vue.h)("button", {
							type: "button",
							class: "oj-button",
							"data-size": "mini",
							onClick: () => startRename(entry)
						}, props.renameLabel)
					])
				]);
			}))]);
		};
	}
});
//#endregion
exports.OjVersionHistory = OjVersionHistory;
