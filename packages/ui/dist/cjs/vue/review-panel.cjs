const require_people = require("../shell/people.cjs");
const require_review = require("../shell/review.cjs");
let vue = require("vue");
//#region src/vue/review-panel.ts
/**
* `OjReviewPanel`（03 §3 E 组）：修订列表 + 逐条/批量接受拒绝。
*
* 三件事按 Word 的语义钉住，改之前先读 03 §8：
*
*   1. **"全部接受"只作用于当前筛选结果**（`decideAll(changes, filter)` 同一条规则）。
*      在"只看张三"的筛选下连李四的修订一起接受，是数据事故而不是效率提升。
*   2. **决策后条目从列表消失**，不留"已接受"灰条：留灰条会让人以为还能再点一次。
*   3. **筛选是本地 UI 状态**，不往上报。筛选器一变就通知宿主，会逼着宿主也存一份筛选状态，
*      于是两个面板的筛选各走各的。
*
* 文案全部由使用方给：种类名要做成 `kindLabels` 映射，是因为"插入/删除/格式"在四种语言里
* 都不是能靠拼接得到的。
*/
var OjReviewPanel = (0, vue.defineComponent)({
	name: "OjReviewPanel",
	props: {
		changes: {
			type: Array,
			required: true
		},
		label: {
			type: String,
			required: true
		},
		acceptLabel: {
			type: String,
			required: true
		},
		rejectLabel: {
			type: String,
			required: true
		},
		acceptAllLabel: {
			type: String,
			required: true
		},
		rejectAllLabel: {
			type: String,
			required: true
		},
		/** 空态文案（"没有待处理的修订"）。 */
		emptyLabel: {
			type: String,
			required: true
		},
		/** "全部种类"这一档的名字。 */
		allKindsLabel: {
			type: String,
			required: true
		},
		kindLabels: {
			type: Object,
			default: () => ({
				insert: "insert",
				delete: "delete",
				format: "format"
			})
		},
		formatTime: {
			type: Function,
			required: true
		}
	},
	emits: ["decide", "decide-all"],
	setup(props, { emit }) {
		const kind = (0, vue.ref)("all");
		const visible = () => require_review.filterChanges(props.changes, { kind: kind.value });
		function decide(id, decision) {
			emit("decide", id, decision);
		}
		function decideAll(decision) {
			emit("decide-all", decision, kind.value);
		}
		function chip(id, text) {
			const active = kind.value === id;
			return (0, vue.h)("button", {
				key: id,
				type: "button",
				class: "oj-review__chip",
				"data-active": active ? "" : void 0,
				"aria-pressed": active ? "true" : "false",
				onClick: () => {
					kind.value = id;
				}
			}, text);
		}
		return () => {
			const rows = visible();
			return (0, vue.h)("section", {
				class: "oj-review",
				"aria-label": props.label
			}, [
				(0, vue.h)("div", {
					class: "oj-review__filters",
					role: "group",
					"aria-label": props.label
				}, [chip("all", props.allKindsLabel), ...require_review.REVIEW_KINDS.map((entry) => chip(entry, props.kindLabels[entry]))]),
				(0, vue.h)("div", { class: "oj-review__actions" }, [(0, vue.h)("button", {
					type: "button",
					class: "oj-button",
					"data-size": "mini",
					disabled: rows.length === 0 ? true : void 0,
					onClick: () => decideAll("accept")
				}, props.acceptAllLabel), (0, vue.h)("button", {
					type: "button",
					class: "oj-button",
					"data-size": "mini",
					disabled: rows.length === 0 ? true : void 0,
					onClick: () => decideAll("reject")
				}, props.rejectAllLabel)]),
				rows.length === 0 ? (0, vue.h)("p", { class: "oj-review__empty" }, props.emptyLabel) : (0, vue.h)("ol", { class: "oj-review__list" }, rows.map((change) => (0, vue.h)("li", {
					key: change.id,
					class: "oj-review__item",
					"data-kind": change.kind
				}, [
					(0, vue.h)("span", {
						class: "oj-review__avatar oj-avatar",
						"data-tone": String(require_people.avatarTone(change.author)),
						"aria-hidden": "true"
					}, require_people.initialsOf(change.author.name)),
					(0, vue.h)("div", { class: "oj-review__body" }, [(0, vue.h)("div", { class: "oj-review__meta" }, [
						(0, vue.h)("span", { class: "oj-review__kind" }, props.kindLabels[change.kind]),
						(0, vue.h)("span", { class: "oj-review__author" }, change.author.name),
						(0, vue.h)("time", {
							class: "oj-review__time",
							datetime: new Date(change.at).toISOString()
						}, props.formatTime(change.at))
					]), (0, vue.h)("p", { class: "oj-review__summary" }, change.summary)]),
					(0, vue.h)("div", { class: "oj-review__decide" }, [(0, vue.h)("button", {
						type: "button",
						class: "oj-button",
						"data-size": "mini",
						"aria-label": props.acceptLabel,
						onClick: () => decide(change.id, "accept")
					}, props.acceptLabel), (0, vue.h)("button", {
						type: "button",
						class: "oj-button",
						"data-size": "mini",
						"aria-label": props.rejectLabel,
						onClick: () => decide(change.id, "reject")
					}, props.rejectLabel)])
				])))
			]);
		};
	}
});
//#endregion
exports.OjReviewPanel = OjReviewPanel;
