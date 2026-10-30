const require_a11y = require("./a11y.cjs");
let vue = require("vue");
//#region src/icon-component.ts
/**
* 生成器给每枚图标造组件时共用的形状。放在手写代码里而不是展开进 31 个生成文件：
* 可访问名与尺寸的规则只有一份，改一次全生效。
*
* 为什么是"每图一个组件"而不是"一个组件 + name prop"：`import { OjIconFormatBold }`
* 必须能被摇到只剩这一枚（05 C1 验收 ≤ 1 KB gzip）。带 name prop 的组件做不到，
* 它的模板里必然含整张查找表。
*/
var reported = /* @__PURE__ */ new Set();
function cssSize(size) {
	return typeof size === "number" ? `${size}px` : size;
}
/**
* `markup` 由生成器以字面量传入，**不要**改成在运行时查常量表：
* 那会让每枚图标都拖上整张表（实测从 ~0.4 kB 涨到 2.15 kB，直接顶穿 1 KB 阈值）。
*/
function createIconComponent(name, componentName, markup) {
	return (0, vue.defineComponent)({
		name: componentName,
		props: {
			size: {
				type: [Number, String],
				default: void 0
			},
			label: {
				type: String,
				default: void 0
			},
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
			return () => {
				if (!reported.has(name)) {
					const problem = require_a11y.iconLabelProblem(name, {
						label: props.label,
						decorative: props.decorative
					});
					if (problem !== void 0 && require_a11y.isDevEnv(env)) {
						reported.add(name);
						console.warn(problem);
					}
				}
				const labelled = typeof props.label === "string" && props.label.length > 0;
				return (0, vue.h)("span", {
					class: "oj-icon",
					role: labelled ? "img" : void 0,
					"aria-label": labelled ? props.label : void 0,
					"aria-hidden": labelled ? void 0 : "true",
					style: props.size === void 0 ? void 0 : {
						width: cssSize(props.size),
						height: cssSize(props.size)
					},
					innerHTML: markup
				});
			};
		}
	});
}
//#endregion
exports.createIconComponent = createIconComponent;
