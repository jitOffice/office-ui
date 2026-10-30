const require_icons = require("../icons.cjs");
let vue = require("vue");
//#region src/vue/icon.ts
function cssSize(size) {
	return typeof size === "number" ? `${size}px` : size;
}
/**
* dev 告警按图标名去重：一个 Ribbon 里同一枚图标会出现十几次，
* 每个实例刷一行只会让人把控制台关掉——那等于没有告警。
*/
var reported = /* @__PURE__ */ new Set();
var OjIcon = (0, vue.defineComponent)({
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
		},
		/**
		* 加载态旋转。只挂一个类名，动画写在样式表里：
		* 内联 `animation` 会绕开 `prefers-reduced-motion` 的媒体查询，
		* 而持续旋转的图标对前庭功能障碍用户是实打实的不适。
		*/
		spin: {
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
		const problem = require_icons.iconLabelProblem(props.name, {
			label: props.label,
			decorative: props.decorative
		});
		if (problem !== void 0 && require_icons.isDevEnv(env) && !reported.has(props.name)) {
			reported.add(props.name);
			console.warn(problem);
		}
		return () => {
			const markup = require_icons.iconMarkup(props.name);
			const labelled = typeof props.label === "string" && props.label.length > 0;
			return (0, vue.h)("span", {
				class: props.spin ? "oj-icon oj-icon--spin" : "oj-icon",
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
exports.OjIcon = OjIcon;
