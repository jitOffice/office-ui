const require_people = require("../shell/people.cjs");
let vue = require("vue");
//#region src/vue/comment-thread.ts
/**
* `OjCommentThread`（03 §3 E 组）：单条批注 + 回复 + 解决/重开。
*
* 组件**自己不改传进来的线程**：回复走 `reply` 事件、解决态走 `toggle-resolved`，
* 由宿主拿 `addReply()` / `setResolved()` 算完再传回来。受控是刻意的——
* 批注列表要落盘、要协同同步，组件内部藏一份状态就会与真实数据分叉。
*
* 时间由 `formatTime` 传入而不是组件内 `toLocaleString()`：时间格式跟着语言包走，
* 组件里自己格式化会让同一页面出现两种日期写法。
*/
var OjCommentThread = (0, vue.defineComponent)({
	name: "OjCommentThread",
	props: {
		thread: {
			type: Object,
			required: true
		},
		/** 时间格式化（由使用方按语言给）。 */
		formatTime: {
			type: Function,
			required: true
		},
		resolveLabel: {
			type: String,
			required: true
		},
		reopenLabel: {
			type: String,
			required: true
		},
		replyLabel: {
			type: String,
			required: true
		},
		replyPlaceholder: {
			type: String,
			default: ""
		},
		disabled: {
			type: Boolean,
			default: false
		}
	},
	emits: ["reply", "toggle-resolved"],
	setup(props, { emit }) {
		const draft = (0, vue.ref)("");
		function submit() {
			const text = draft.value.trim();
			if (text.length === 0 || props.disabled) return;
			emit("reply", text);
			draft.value = "";
		}
		function onKeydown(event) {
			if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
				event.preventDefault();
				submit();
			}
		}
		function person(person, className) {
			return (0, vue.h)("span", {
				class: className,
				"data-tone": String(require_people.avatarTone(person)),
				"aria-hidden": "true"
			}, require_people.initialsOf(person.name));
		}
		return () => {
			const thread = props.thread;
			const canSend = draft.value.trim().length > 0 && !props.disabled;
			return (0, vue.h)("article", {
				class: "oj-comment",
				"data-resolved": thread.resolved ? "" : void 0,
				"data-thread": thread.id
			}, [
				(0, vue.h)("header", { class: "oj-comment__head" }, [
					person(thread.author, "oj-comment__avatar oj-avatar"),
					(0, vue.h)("span", { class: "oj-comment__author" }, thread.author.name),
					(0, vue.h)("time", {
						class: "oj-comment__time",
						datetime: new Date(thread.at).toISOString()
					}, props.formatTime(thread.at)),
					(0, vue.h)("button", {
						type: "button",
						class: "oj-comment__resolve",
						"data-active": thread.resolved ? "" : void 0,
						"aria-pressed": thread.resolved ? "true" : "false",
						onClick: () => emit("toggle-resolved", !thread.resolved)
					}, thread.resolved ? props.reopenLabel : props.resolveLabel)
				]),
				(0, vue.h)("p", { class: "oj-comment__text" }, thread.text),
				thread.replies.length === 0 ? null : (0, vue.h)("ol", { class: "oj-comment__replies" }, thread.replies.map((reply) => (0, vue.h)("li", {
					key: reply.id,
					class: "oj-comment__reply"
				}, [person(reply.author, "oj-comment__avatar oj-avatar oj-avatar--small"), (0, vue.h)("div", { class: "oj-comment__reply-body" }, [(0, vue.h)("div", { class: "oj-comment__reply-meta" }, [(0, vue.h)("span", { class: "oj-comment__author" }, reply.author.name), (0, vue.h)("time", {
					class: "oj-comment__time",
					datetime: new Date(reply.at).toISOString()
				}, props.formatTime(reply.at))]), (0, vue.h)("p", { class: "oj-comment__text" }, reply.text)])]))),
				(0, vue.h)("div", { class: "oj-comment__compose" }, [(0, vue.h)("textarea", {
					class: "oj-comment__input",
					rows: 2,
					value: draft.value,
					placeholder: props.replyPlaceholder,
					"aria-label": props.replyLabel,
					disabled: props.disabled,
					onInput: (event) => {
						draft.value = event.target.value;
					},
					onKeydown
				}), (0, vue.h)("button", {
					type: "button",
					class: "oj-button oj-comment__send",
					"data-size": "mini",
					disabled: canSend ? void 0 : true,
					onClick: submit
				}, props.replyLabel)])
			]);
		};
	}
});
//#endregion
exports.OjCommentThread = OjCommentThread;
