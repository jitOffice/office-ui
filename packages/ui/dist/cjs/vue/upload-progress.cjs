const require_upload = require("../shell/upload.cjs");
let vue = require("vue");
//#region src/vue/upload-progress.ts
/**
* `OjUploadProgress`（03 §3 F 组）：分片上传的进度列表，带暂停 / 续传 / 失败重试。
*
* 三种动作按状态各只出一个按钮，**不做"能用不能用"的灰按钮**：上传中给"暂停"、
* 已暂停给"续传"、失败给"重试"。灰着的按钮点击无反应，用户只会反复点。
*
* 进度条用 `role="progressbar"` + `aria-valuenow`，失败项额外把原因写在下面：
* 只画一根红条不说明原因，用户唯一能做的就是再点一次重试。
*
* 状态文案由宿主给（`statusLabels`）：组件不拼"正在上传 3/5"这类句子。
*/
var OjUploadProgress = (0, vue.defineComponent)({
	name: "OjUploadProgress",
	props: {
		items: {
			type: Array,
			required: true
		},
		/** 整个列表的可访问名（"上传进度"）。 */
		label: {
			type: String,
			required: true
		},
		pauseLabel: {
			type: String,
			required: true
		},
		resumeLabel: {
			type: String,
			required: true
		},
		retryLabel: {
			type: String,
			required: true
		},
		/** 各状态的中文/译文由宿主给；缺的状态就不显示状态文字。 */
		statusLabels: {
			type: Object,
			default: () => ({})
		},
		emptyLabel: {
			type: String,
			default: ""
		}
	},
	emits: [
		"pause",
		"resume",
		"retry"
	],
	setup(props, { emit }) {
		function action(item) {
			if (item.state === "uploading") return {
				label: props.pauseLabel,
				event: "pause"
			};
			if (item.state === "paused") return {
				label: props.resumeLabel,
				event: "resume"
			};
			if (item.state === "failed") return {
				label: props.retryLabel,
				event: "retry"
			};
		}
		function track(percent, name) {
			const value = Math.round(percent * 100);
			return (0, vue.h)("div", {
				class: "oj-upload-progress__track",
				role: "progressbar",
				"aria-label": name,
				"aria-valuemin": 0,
				"aria-valuemax": 100,
				"aria-valuenow": value,
				"aria-valuetext": `${value}%`
			}, [(0, vue.h)("div", {
				class: "oj-upload-progress__bar",
				style: { width: `${value}%` }
			})]);
		}
		return () => {
			const summary = require_upload.uploadSummary(props.items);
			if (props.items.length === 0) return props.emptyLabel === "" ? null : (0, vue.h)("p", { class: "oj-upload-progress__empty" }, props.emptyLabel);
			const rows = props.items.map((item) => {
				const percent = require_upload.uploadPercent(item);
				const button = action(item);
				return (0, vue.h)("li", {
					class: "oj-upload-progress__item",
					"data-state": item.state,
					key: item.id
				}, [
					(0, vue.h)("div", { class: "oj-upload-progress__row" }, [
						(0, vue.h)("span", {
							class: "oj-upload-progress__name",
							title: item.name
						}, item.name),
						(0, vue.h)("span", {
							class: "oj-upload-progress__status",
							"aria-hidden": "true"
						}, props.statusLabels[item.state] ?? ""),
						button === void 0 ? null : (0, vue.h)("button", {
							type: "button",
							class: "oj-button oj-upload-progress__action",
							"data-size": "mini",
							"data-action": button.event,
							"aria-label": button.label,
							onClick: () => emit(button.event, item.id)
						}, button.label)
					]),
					track(percent, item.name),
					item.error === void 0 || item.error === "" ? null : (0, vue.h)("p", { class: "oj-upload-progress__error" }, item.error)
				]);
			});
			const summaryPercent = Math.round(summary.percent * 100);
			return (0, vue.h)("section", {
				class: "oj-upload-progress",
				"aria-label": props.label
			}, [(0, vue.h)("div", { class: "oj-upload-progress__summary" }, [(0, vue.h)("span", { class: "oj-upload-progress__count" }, `${summary.done} / ${summary.count}`), (0, vue.h)("span", { class: "oj-upload-progress__total" }, `${summaryPercent}%`)]), (0, vue.h)("ul", {
				class: "oj-upload-progress__list",
				role: "list"
			}, rows)]);
		};
	}
});
//#endregion
exports.OjUploadProgress = OjUploadProgress;
