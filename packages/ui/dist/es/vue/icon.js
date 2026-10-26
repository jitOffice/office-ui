import { iconLabelProblem, iconMarkup, isDevEnv } from "../icons.js";
import { defineComponent, h } from "vue";
//#region src/vue/icon.ts
function cssSize(size) {
	return typeof size === "number" ? `${size}px` : size;
}
/**
* dev 告警按图标名去重：一个 Ribbon 里同一枚图标会出现十几次，
* 每个实例刷一行只会让人把控制台关掉——那等于没有告警。
*/
var reported = /* @__PURE__ */ new Set();
var OjIcon = defineComponent({
	name: "OjIcon",
	props: {
		name: {
			type: String,
			required: true
		},
		size: {
			type: [Number, String],
			default: void 0
		},
		label: {
			type: String,
			default: void 0
		},
		/** 装饰性图标：显式声明「这枚图标没有语义」，渲染 `aria-hidden`（03 §2）。 */
		decorative: {
			type: Boolean,
			default: false
		}
	},
	setup(props) {
		const env = {
			"BASE_URL": "/",
			"DEV": false,
			"MODE": "production",
			"PROD": true,
			"SSR": false
		};
		const problem = iconLabelProblem(props.name, {
			label: props.label,
			decorative: props.decorative
		});
		if (problem !== void 0 && isDevEnv(env) && !reported.has(props.name)) {
			reported.add(props.name);
			console.warn(problem);
		}
		return () => {
			const markup = iconMarkup(props.name);
			const labelled = typeof props.label === "string" && props.label.length > 0;
			return h("span", {
				class: "oj-icon",
				role: labelled ? "img" : void 0,
				"aria-label": labelled ? props.label : void 0,
				"aria-hidden": labelled ? void 0 : "true",
				style: props.size === void 0 ? void 0 : {
					width: cssSize(props.size),
					height: cssSize(props.size)
				},
				innerHTML: markup ?? ""
			});
		};
	}
});
//#endregion
export { OjIcon };
