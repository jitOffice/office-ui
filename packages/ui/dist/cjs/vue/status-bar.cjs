let vue = require("vue");
//#region src/vue/status-bar.ts
/**
* `OjStatusBar`（03 §3 B 组）：底部状态栏。
*
* 这里只做布局，**文案一律由使用方格式化好再传**（`page: '第 1 页 / 共 3 页'`）。
* 状态栏是最容易被拼字符串拼坏的地方——「共 3 页」在日语里语序不同，
* 用 `${n} 页` 拼出来的东西没法翻译。唯一例外是缩放：`100%` 是跨语言通用的。
*
* 左区放"模式"（页面/大纲/Web），右区放"读数"（缩放、协作人数）——这是 Word/WPS 的固定分工，
* 换位置会让用户找不到东西，所以不做成可配置。
*/
var OjStatusBar = (0, vue.defineComponent)({
	name: "OjStatusBar",
	props: {
		/** 已格式化的页码文案 */
		page: {
			type: String,
			default: void 0
		},
		/** 已格式化的字数文案 */
		words: {
			type: String,
			default: void 0
		},
		/** 已格式化的语言文案 */
		language: {
			type: String,
			default: void 0
		},
		/** 缩放百分比，组件只补 `%` */
		zoom: {
			type: Number,
			default: void 0
		},
		/** 已格式化的协同状态文案 */
		collaborators: {
			type: String,
			default: void 0
		},
		label: {
			type: String,
			default: void 0
		}
	},
	setup(props, { slots }) {
		function item(part, text) {
			return (0, vue.h)("span", {
				class: "oj-status-bar__item",
				"data-part": part
			}, text);
		}
		return () => {
			const middle = [slots.default?.()];
			if (props.page !== void 0) middle.push(item("page", props.page));
			if (props.words !== void 0) middle.push(item("words", props.words));
			if (props.language !== void 0) middle.push(item("language", props.language));
			if (props.zoom !== void 0) middle.push(item("zoom", `${props.zoom}%`));
			if (props.collaborators !== void 0) middle.push(item("collaborators", props.collaborators));
			return (0, vue.h)("footer", {
				class: "oj-status-bar",
				"aria-label": props.label
			}, [
				(0, vue.h)("div", { class: "oj-status-bar__start" }, slots.start?.()),
				(0, vue.h)("div", { class: "oj-status-bar__center" }, middle),
				(0, vue.h)("div", { class: "oj-status-bar__end" }, slots.end?.())
			]);
		};
	}
});
//#endregion
exports.OjStatusBar = OjStatusBar;
