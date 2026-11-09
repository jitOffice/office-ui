(function(global, factory) {
	typeof exports === "object" && typeof module !== "undefined" ? factory(exports, require("vue")) : typeof define === "function" && define.amd ? define(["exports", "vue"], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, factory(global.OfficeUI = {}, global.Vue));
})(this, function(exports, vue) {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	//#region src/icon-registry.ts
	var registry = /* @__PURE__ */ new Map();
	function registeredIconMarkup(name) {
		return registry.get(name);
	}
	//#endregion
	//#region src/icons.ts
	/**
	* 自绘图标。只发 SVG 字符串，不发图标字体（prd/00 许可红线）。
	* 完整图标管线仍是后续的 `@jitoffice/icons`，这里先覆盖外壳会用到的三十枚。
	* 业务侧要加图标不要改这张表——用 `registerIcon`（见 `icon-registry.ts`），
	* 否则每次升级都会把改动冲掉。
	*/
	var SVG_OPEN = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\" fill=\"currentColor\">";
	var icons = {
		"oj-format-bold": SVG_OPEN + "<path d=\"M4 2h4.1A2.55 2.55 0 0 1 8.1 7.1H4V2zm0 5.1h4.7A2.65 2.65 0 0 1 8.7 14H4V7.1z\"/></svg>",
		"oj-insert-table": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.2\"><rect x=\"2.2\" y=\"2.2\" width=\"11.6\" height=\"11.6\" rx=\"1\"/><path d=\"M2.2 6.4h11.6M2.2 10.2h11.6M6.4 2.2v11.6M10.2 2.2v11.6\"/></svg>",
		"oj-horizontal-rule": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.4\"><path d=\"M2 8h12\"/></svg>",
		"oj-format-italic": SVG_OPEN + "<path d=\"M6.2 2h6l-.4 1.6H9.7L7.4 12.4h2.1L9.1 14H3.2l.4-1.6h2.1L8 3.6H5.8L6.2 2z\"/></svg>",
		"oj-format-underline": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.3\"><path d=\"M4 2.5v5.2a4 4 0 0 0 8 0V2.5M3 13.5h10\"/></svg>",
		"oj-align-left": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\" fill=\"currentColor\"><path d=\"M2 3h12v1.4H2zm0 3.2h8v1.4H2zm0 3.2h12v1.4H2zm0 3.2h8v1.4H2z\"/></svg>",
		"oj-align-center": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\" fill=\"currentColor\"><path d=\"M2 3h12v1.4H2zm2 3.2h8v1.4H4zm-2 3.2h12v1.4H2zm2 3.2h8v1.4H4z\"/></svg>",
		"oj-align-right": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\" fill=\"currentColor\"><path d=\"M2 3h12v1.4H2zm4 3.2h8v1.4H6zm-4 3.2h12v1.4H2zm4 3.2h8v1.4H6z\"/></svg>",
		"oj-list-bullet": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\" fill=\"currentColor\"><circle cx=\"3\" cy=\"4\" r=\"1.1\"/><circle cx=\"3\" cy=\"8\" r=\"1.1\"/><circle cx=\"3\" cy=\"12\" r=\"1.1\"/><path d=\"M6 3.3h8v1.4H6zm0 4h8v1.4H6zm0 4h8v1.4H6z\"/></svg>",
		"oj-list-number": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\" fill=\"currentColor\"><path d=\"M2.2 3.2h1.2V6H2.2zm0 3.6h2.2v.9H3.2v.5h1.2V9.6H2.2v-.9h1.2v-.4H2.2zm.2 3.2h1.6c.4 0 .7.2.7.6s-.3.6-.7.6H2.4v.9h2.2v.9H2.2v-2.1h.2zM6 3.3h8v1.4H6zm0 4h8v1.4H6zm0 4h8v1.4H6z\"/></svg>",
		"oj-search": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.4\"><circle cx=\"7\" cy=\"7\" r=\"4.2\"/><path d=\"M10.2 10.2 13.5 13.5\"/></svg>",
		"oj-zoom-in": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.4\"><circle cx=\"7\" cy=\"7\" r=\"4.2\"/><path d=\"M10.2 10.2 13.5 13.5M7 5v4M5 7h4\"/></svg>",
		"oj-zoom-out": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.4\"><circle cx=\"7\" cy=\"7\" r=\"4.2\"/><path d=\"M10.2 10.2 13.5 13.5M5 7h4\"/></svg>",
		"oj-folder": SVG_OPEN + "<path d=\"M2 4.2A1.2 1.2 0 0 1 3.2 3h3l1.2 1.4H13a1 1 0 0 1 1 1V12a1 1 0 0 1-1 1H3.2A1.2 1.2 0 0 1 2 11.8z\"/></svg>",
		"oj-file": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.2\"><path d=\"M4 2.2h5.2L12.5 5.5V13.8H4z\"/><path d=\"M9.2 2.2V5.5H12.5\"/></svg>",
		"oj-chevron-right": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.4\"><path d=\"M6 3.5 10.5 8 6 12.5\"/></svg>",
		"oj-chevron-down": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.4\"><path d=\"M3.5 6 8 10.5 12.5 6\"/></svg>",
		"oj-close": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.4\"><path d=\"M4 4l8 8M12 4l-8 8\"/></svg>",
		"oj-undo": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.3\"><path d=\"M4 7.5 1.8 5.2 4 3\"/><path d=\"M2.2 5.2h6.2a4.2 4.2 0 1 1 0 8.4H6\"/></svg>",
		"oj-image": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.2\"><rect x=\"2.2\" y=\"3\" width=\"11.6\" height=\"10\" rx=\"1\"/><circle cx=\"5.5\" cy=\"6.2\" r=\"1\"/><path d=\"M3 11.5 6.2 8.2l2 2 1.6-1.4L13 11.5\"/></svg>",
		"oj-link": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.3\"><path d=\"M6.8 9.2a2.6 2.6 0 0 0 3.7 0l1.8-1.8a2.6 2.6 0 0 0-3.7-3.7L7.6 4.7\"/><path d=\"M9.2 6.8a2.6 2.6 0 0 0-3.7 0L3.7 8.6a2.6 2.6 0 0 0 3.7 3.7l1-1\"/></svg>",
		"oj-comment": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.2\"><path d=\"M3 3.2h10v7.2H6.2L3 12.8z\"/></svg>",
		"oj-print": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.2\"><path d=\"M4.5 6V2.8h7V6\"/><path d=\"M4 11.2H2.8V6.5h10.4v4.7H12\"/><rect x=\"4.5\" y=\"9\" width=\"7\" height=\"4.2\"/></svg>",
		"oj-page": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.2\"><rect x=\"3.5\" y=\"2\" width=\"9\" height=\"12\" rx=\"0.6\"/></svg>",
		"oj-signature": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.3\"><path d=\"M2 11.5c1.6-2.4 2.4-2.2 3.2-.4.6 1.4 1.2 1.6 2-.2 1-2.2 1.6-2 2.6.2.6 1.4 1.4 1.6 2.4-.2\"/><path d=\"M2 13.6h12\"/></svg>",
		"oj-stamp": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.2\"><circle cx=\"8\" cy=\"7\" r=\"4.2\"/><path d=\"M5.2 13.2h5.6M6.4 11.2h3.2\"/></svg>",
		"oj-watermark": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.2\"><rect x=\"2.2\" y=\"2.2\" width=\"11.6\" height=\"11.6\" rx=\"1\"/><path d=\"M4 11.2 12 4.8\"/></svg>",
		"oj-ai": SVG_OPEN + "<path d=\"M8 1.8 9.2 6h4.3L10.3 8.6l1.1 4.2L8 10.4 4.6 12.8 5.7 8.6 2.5 6h4.3z\"/></svg>",
		"oj-indent": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\" fill=\"currentColor\"><path d=\"M2 3h12v1.4H2zm4 3.2h8v1.4H6zm-4 3.2h12v1.4H2zm4 3.2h8v1.4H6z\"/></svg>",
		"oj-outdent": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\" fill=\"currentColor\"><path d=\"M2 3h12v1.4H2zm0 3.2h8v1.4H2zm0 3.2h12v1.4H2zm0 3.2h8v1.4H2z\"/></svg>",
		"oj-code": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.4\"><path d=\"M6 4.5 3 8l3 3.5M10 4.5 13 8l-3 3.5\"/></svg>"
	};
	function iconMarkup(name) {
		const registered = registeredIconMarkup(name);
		if (registered !== void 0) return registered;
		if (Object.prototype.hasOwnProperty.call(icons, name)) return icons[name];
	}
	function iconLabelProblem(name, options = {}) {
		if (typeof options.label === "string" && options.label.length > 0 || options.decorative === true) return void 0;
		return `[OjIcon] "${name}" 既没有 label 也没有标 decorative：纯图标元素不进无障碍树，读屏用户读到的是一片空白（prd/03 §2）。给 label（有语义）或 decorative（装饰性，渲染 aria-hidden）二选一。`;
	}
	/**
	* 只有构建器**明确**说是 dev 才告警。宁可线上漏报，也不要在产物里刷控制台——
	* 这个判定读的是 `import.meta.env.DEV`，Vite 在 dev server 下注入 true，产物里没有它。
	*/
	function isDevEnv(env) {
		return (env === null || env === void 0 ? void 0 : env.DEV) === true;
	}
	//#endregion
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
				return (0, vue.h)("span", {
					class: props.spin ? "oj-icon oj-icon--spin" : "oj-icon",
					role: labelled ? "img" : void 0,
					"aria-label": labelled ? props.label : void 0,
					"aria-hidden": labelled ? void 0 : "true",
					style: props.size === void 0 ? void 0 : {
						width: cssSize(props.size),
						height: cssSize(props.size)
					},
					innerHTML: markup !== null && markup !== void 0 ? markup : ""
				});
			};
		}
	});
	//#endregion
	//#region src/vue/locale.ts
	var LOCALE_KEY = Symbol("oj-locale");
	/** `import.meta.env` 只在函数里读：CJS/UMD 产物里模块顶层碰 `import.meta` 会直接抛。 */
	function devEnv() {
		return isDevEnv({
			"BASE_URL": "/",
			"DEV": false,
			"MODE": "production",
			"PROD": true,
			"SSR": false
		});
	}
	function withoutProvider() {
		return {
			provided: false,
			locale: (0, vue.computed)(() => void 0),
			lang: (0, vue.computed)(() => ""),
			t(key, fallback) {
				return fallback !== null && fallback !== void 0 ? fallback : key;
			},
			use(next) {
				if (devEnv()) {
					const name = typeof next === "string" ? next : next.name;
					console.warn(`[locale] 没有 OjLocaleProvider，切换到「${name}」被忽略`);
				}
			},
			/** 没有 Provider 就没有注册表：切换器据此渲染成空，而不是猜一份语言表出来。 */
			list() {
				return [];
			}
		};
	}
	var NO_PROVIDER = withoutProvider();
	/**
	* 取当前语言上下文。必须在 `setup()` 里调用。
	*
	* 返回值是**快照 + 订阅**的结果：语言切换时 `lang` / `locale` 这两个 computed 会变，
	* 于是用到它们的渲染函数自然重渲染。刻意不用 `reactive(runtime)` 包一层——
	* 那会把一个框架无关的外部对象整体代理掉（身份变了、内部 Map/闭包也不可代理）。
	*/
	function useLocale() {
		return (0, vue.inject)(LOCALE_KEY, NO_PROVIDER);
	}
	var OjLocaleProvider = (0, vue.defineComponent)({
		name: "OjLocaleProvider",
		props: {
			i18n: {
				type: Object,
				required: true
			},
			/**
			* 是否同步 `html[lang]` / `html[dir]`。默认同步；给 `false` 是给"一个页面里嵌两个语言区"的场景
			* （此时语言只影响组件文案，页面的 `lang` 由宿主自己决定）。
			*/
			syncDocument: {
				type: Boolean,
				default: true
			}
		},
		setup(props, { slots }) {
			const current = (0, vue.shallowRef)(props.i18n.locale);
			let stop;
			/** 挂载前页面上的值。`null` 表示"我们还没动过"，卸载时据此决定要不要归还 */
			let previous = null;
			function bind() {
				stop === null || stop === void 0 || stop();
				current.value = props.i18n.locale;
				stop = props.i18n.subscribe((locale) => {
					current.value = locale;
				});
			}
			function apply() {
				if (!props.syncDocument || typeof document === "undefined") return;
				const root = document.documentElement;
				if (previous === null) previous = {
					lang: root.lang,
					dir: root.getAttribute("dir")
				};
				root.lang = current.value.name;
				const dir = current.value.direction;
				if (dir !== void 0) root.setAttribute("dir", dir);
			}
			function restore() {
				const saved = previous;
				previous = null;
				if (saved === null || !props.syncDocument || typeof document === "undefined") return;
				const root = document.documentElement;
				if (root.lang !== current.value.name) return;
				if (saved.lang !== "") root.lang = saved.lang;
				else root.removeAttribute("lang");
				if (saved.dir === null) root.removeAttribute("dir");
				else root.setAttribute("dir", saved.dir);
			}
			bind();
			(0, vue.onMounted)(apply);
			(0, vue.onUnmounted)(() => {
				stop === null || stop === void 0 || stop();
				stop = void 0;
				restore();
			});
			(0, vue.watch)(() => current.value.name, apply);
			(0, vue.watch)(() => props.i18n, () => {
				bind();
				apply();
			});
			const context = {
				provided: true,
				locale: (0, vue.computed)(() => current.value),
				lang: (0, vue.computed)(() => current.value.name),
				t(key, fallback, values) {
					const text = props.i18n.translate(key, values);
					return text === key ? fallback !== null && fallback !== void 0 ? fallback : key : text;
				},
				use(next) {
					props.i18n.use(next);
				},
				list() {
					return props.i18n.list();
				}
			};
			(0, vue.provide)(LOCALE_KEY, context);
			return () => {
				var _slots$default;
				return (_slots$default = slots.default) === null || _slots$default === void 0 ? void 0 : _slots$default.call(slots);
			};
		}
	});
	//#endregion
	//#region src/vue/locale-switcher.ts
	/**
	* `OjLocaleSwitcher`（04 §6.1、03 §6 M1「语言切换器」）。
	*
	* 用原生 `<select>` 而不是自绘下拉：它自带 IME、读屏的角色语义、移动端的原生选择器，
	* 自绘在这里换不到任何东西。样式只负责把它压到状态栏 / 工具条那一行的高度与配色。
	*
	* 受控与非受控的区别只在"谁去改运行时"：
	*   - 没给 `modelValue`：组件自己 `useLocale().use(name)`，一个字都不用配就能切语言；
	*   - 给了 `modelValue`：只发事件，由宿主决定何时 `i18n.use()`——宿主可能在切换前先存一次偏好设置。
	* 两种都发 `update:modelValue` 与 `change`（`change` 只由用户操作触发，03 §2）。
	*/
	var OjLocaleSwitcher = (0, vue.defineComponent)({
		name: "OjLocaleSwitcher",
		props: {
			/** 显式语言表。不给就用 Provider 注册表里的（按 `name` 字典序，由运行时排好） */
			locales: {
				type: Array,
				default: void 0
			},
			/** 受控值：当前语言 `name` */
			modelValue: {
				type: String,
				default: void 0
			},
			/** 可访问名。不给则取 `oj.common.language`（切语言后跟着变） */
			label: {
				type: String,
				default: void 0
			},
			disabled: {
				type: Boolean,
				default: false
			}
		},
		emits: ["update:modelValue", "change"],
		setup(props, { emit }) {
			const locale = useLocale();
			const options = (0, vue.computed)(() => {
				var _props$locales;
				return (_props$locales = props.locales) !== null && _props$locales !== void 0 ? _props$locales : locale.list();
			});
			const current = (0, vue.computed)(() => {
				var _props$modelValue;
				return (_props$modelValue = props.modelValue) !== null && _props$modelValue !== void 0 ? _props$modelValue : locale.lang.value;
			});
			const name = (0, vue.computed)(() => {
				var _props$label;
				locale.lang.value;
				return (_props$label = props.label) !== null && _props$label !== void 0 ? _props$label : locale.t("oj.common.language", "语言");
			});
			function select(event) {
				const target = event.target;
				const next = target.value;
				emit("update:modelValue", next);
				emit("change", next);
				if (props.modelValue === void 0) {
					locale.use(next);
					return;
				}
				target.value = props.modelValue;
			}
			return () => {
				const items = options.value;
				if (items.length === 0) return null;
				const value = current.value;
				return (0, vue.h)("span", {
					class: "oj-locale-switcher",
					"data-disabled": props.disabled ? "" : void 0
				}, [(0, vue.h)("select", {
					class: "oj-locale-switcher__select",
					"aria-label": name.value,
					disabled: props.disabled || void 0,
					value,
					onChange: select
				}, items.map((item) => {
					var _item$label;
					return (0, vue.h)("option", {
						value: item.name,
						selected: item.name === value
					}, (_item$label = item.label) !== null && _item$label !== void 0 ? _item$label : item.name);
				}))]);
			};
		}
	});
	//#endregion
	//#region src/vue/command-button.ts
	var OjCommandButton = (0, vue.defineComponent)({
		name: "OjCommandButton",
		props: {
			source: {
				type: Object,
				required: true
			},
			id: {
				type: String,
				required: true
			},
			size: {
				type: String,
				default: "medium"
			}
		},
		setup(props) {
			const view = (0, vue.shallowRef)({ enabled: true });
			let stop = () => {};
			function bind() {
				var _props$source$state;
				stop();
				view.value = (_props$source$state = props.source.state(props.id)) !== null && _props$source$state !== void 0 ? _props$source$state : { enabled: true };
				stop = props.source.subscribe(props.id, (next) => {
					view.value = next;
				});
			}
			(0, vue.onMounted)(bind);
			(0, vue.watch)(() => props.id, bind);
			(0, vue.onUnmounted)(() => stop());
			return () => {
				const command = props.source.get(props.id);
				const state = view.value;
				const enabled = state.enabled !== false;
				const label = command ? props.source.resolve(command.label) : props.id;
				const pressed = typeof state.active === "boolean" ? String(state.active) : void 0;
				return (0, vue.h)("button", {
					type: "button",
					class: "oj-button",
					"data-size": props.size === "mini" ? "mini" : void 0,
					"data-active": state.active === true ? "" : void 0,
					"data-command": props.id,
					"aria-pressed": pressed,
					"aria-disabled": enabled ? void 0 : "true",
					onClick: () => {
						if (enabled) props.source.run(props.id);
					}
				}, [(command === null || command === void 0 ? void 0 : command.icon) ? (0, vue.h)(OjIcon, {
					name: command.icon,
					decorative: true
				}) : null, (0, vue.h)("span", { class: "oj-button__label" }, label)]);
			};
		}
	});
	//#endregion
	//#region src/vue/command-launcher.ts
	/**
	* `OjCommandLauncher`（03 §3 B 组）：Ribbon **组右下角的小箭头**，点开的是"段落"那类对话框。
	*
	* 它和命令按钮的区别是"打开的是一整块面板而不是执行一条命令"，所以语义上用
	* `aria-haspopup="dialog"`，而不是 `aria-expanded`——后者是给"就地展开/收起"的。
	*
	* 箭头用 CSS 画（一条 `border-right` + `border-bottom` 的直角），不引图标：
	* 它不是办公图标集里的一枚业务图标，放进 `@jitoffice/icons` 会让每个用到 Ribbon 的
	* 宿主都为这 7×7 的像素付一份图标注册表的体积。
	*
	* `label` 是必填而不是带默认值：这类纯图形按钮没有文字，可访问名只能由使用方给
	* （03 §2「可访问名」）。给个中文默认值等于把一个几乎不会被改的文案埋进库里。
	*/
	var OjCommandLauncher = (0, vue.defineComponent)({
		name: "OjCommandLauncher",
		props: {
			label: {
				type: String,
				required: true
			},
			disabled: {
				type: Boolean,
				default: false
			}
		},
		emits: ["click"],
		setup(props, { emit }) {
			return () => (0, vue.h)("button", {
				type: "button",
				class: "oj-command-launcher",
				"aria-label": props.label,
				"aria-haspopup": "dialog",
				title: props.label,
				disabled: props.disabled || void 0,
				onClick: () => {
					if (props.disabled) return;
					emit("click");
				}
			}, [(0, vue.h)("span", {
				class: "oj-command-launcher__glyph",
				"aria-hidden": "true"
			})]);
		}
	});
	//#endregion
	//#region src/menu.ts
	/** 这一项能不能被选中/聚焦。分隔线与禁用项都不行。 */
	function menuSelectable(item) {
		return item.kind !== "separator" && item.disabled !== true;
	}
	/** 可选项的下标表，按原顺序。组件用它做 tabindex 轮换，导航用它算邻居。 */
	function menuSelectableIndices(items) {
		const out = [];
		items.forEach((item, index) => {
			if (menuSelectable(item)) out.push(index);
		});
		return out;
	}
	/**
	* 方向键/Home/End 之后该聚焦哪一项。返回**项下标**，没有可选项时返回 `-1`。
	*
	* `index` 传 `-1` 表示"当前没有任何项被聚焦"：`ArrowDown` 落到第一个可选项，
	* `ArrowUp` 落到最后一个——这是菜单刚打开时的两种进入方向。
	* 未知按键原样返回 `index`，调用方据此判断"这个键不归我管"。
	*/
	function menuNeighbor(items, index, key) {
		const enabled = menuSelectableIndices(items);
		if (enabled.length === 0) return -1;
		const at = enabled.indexOf(index);
		const first = enabled[0];
		const last = enabled[enabled.length - 1];
		if (key === "Home") return first;
		if (key === "End") return last;
		if (key === "ArrowDown") return enabled[(at + 1) % enabled.length];
		if (key === "ArrowUp") return enabled[(at <= 0 ? enabled.length : at) - 1];
		return index;
	}
	/** 回车/空格该触发哪一项。`-1`（无聚焦）或落在禁用项上时返回 `undefined`。 */
	function menuAction(items, index) {
		const item = items[index];
		if (item === void 0 || !menuSelectable(item)) return void 0;
		return item;
	}
	//#endregion
	//#region src/popper.ts
	function placePopper(options) {
		var _options$gap, _options$padding, _options$placement;
		const gap = (_options$gap = options.gap) !== null && _options$gap !== void 0 ? _options$gap : 4;
		const padding = (_options$padding = options.padding) !== null && _options$padding !== void 0 ? _options$padding : 8;
		const { anchor, popup, viewport } = options;
		const preferred = (_options$placement = options.placement) !== null && _options$placement !== void 0 ? _options$placement : "bottom-start";
		let placement = preferred;
		let y = preferred === "bottom-start" ? anchor.y + anchor.height + gap : anchor.y - gap - popup.height;
		const bottom = anchor.y + anchor.height + gap;
		const top = anchor.y - gap - popup.height;
		const bottomOverflows = bottom + popup.height > viewport.height - padding;
		const topOverflows = top < padding;
		if (preferred === "bottom-start" && bottomOverflows && !topOverflows) {
			placement = "top-start";
			y = top;
		} else if (preferred === "top-start" && topOverflows && !bottomOverflows) {
			placement = "bottom-start";
			y = bottom;
		}
		const maxX = Math.max(padding, viewport.width - padding - popup.width);
		const maxY = Math.max(padding, viewport.height - padding - popup.height);
		const x = Math.min(Math.max(anchor.x, padding), maxX);
		y = Math.min(Math.max(y, padding), maxY);
		return {
			x,
			y,
			placement
		};
	}
	//#endregion
	//#region src/vue/popper.ts
	/** 元素 → 视口矩形。`anchorBox` 优先：canvas 右键坐标没有元素可量。 */
	function anchorOf(el, box) {
		if (box !== null) return {
			x: box.x,
			y: box.y,
			width: box.width,
			height: box.height
		};
		if (el === null) return null;
		const rect = el.getBoundingClientRect();
		return {
			x: rect.left,
			y: rect.top,
			width: rect.width,
			height: rect.height
		};
	}
	var OjPopper = (0, vue.defineComponent)({
		name: "OjPopper",
		props: {
			open: {
				type: Boolean,
				required: true
			},
			anchor: {
				type: Object,
				default: null
			},
			/**
			* 锚**矩形**（视口坐标），优先级高于 `anchor`。
			*
			* 03 §3 D 组点名的两种场景都落在这里：canvas 上的右键坐标（没有 DOM 目标，
			* 矩形退化成零尺寸点）与文本选区的包围盒（锚点是一片区域，不是一个元素）。
			*/
			anchorBox: {
				type: Object,
				default: null
			},
			placement: {
				type: String,
				default: "bottom-start"
			}
		},
		setup(props, { slots }) {
			const panel = (0, vue.ref)(null);
			const x = (0, vue.ref)(0);
			const y = (0, vue.ref)(0);
			const placed = (0, vue.ref)(false);
			function update() {
				const el = panel.value;
				if (!props.open || !el) return;
				const box = anchorOf(props.anchor, props.anchorBox);
				if (box === null) return;
				const popup = el.getBoundingClientRect();
				const next = placePopper({
					anchor: box,
					popup: {
						width: popup.width,
						height: popup.height
					},
					viewport: {
						width: window.innerWidth,
						height: window.innerHeight
					},
					placement: props.placement
				});
				x.value = next.x;
				y.value = next.y;
				placed.value = true;
			}
			(0, vue.onMounted)(() => {
				(0, vue.nextTick)(update);
			});
			(0, vue.watch)(() => props.open, (open) => {
				if (!open) placed.value = false;
				else (0, vue.nextTick)(update);
			});
			(0, vue.watch)(() => {
				var _props$anchorBox, _props$anchorBox2, _props$anchorBox3, _props$anchorBox4;
				return [
					(_props$anchorBox = props.anchorBox) === null || _props$anchorBox === void 0 ? void 0 : _props$anchorBox.x,
					(_props$anchorBox2 = props.anchorBox) === null || _props$anchorBox2 === void 0 ? void 0 : _props$anchorBox2.y,
					(_props$anchorBox3 = props.anchorBox) === null || _props$anchorBox3 === void 0 ? void 0 : _props$anchorBox3.width,
					(_props$anchorBox4 = props.anchorBox) === null || _props$anchorBox4 === void 0 ? void 0 : _props$anchorBox4.height
				];
			}, () => {
				if (props.open) (0, vue.nextTick)(update);
			});
			return () => {
				var _slots$default;
				if (!props.open) return null;
				return (0, vue.h)("div", {
					ref: panel,
					class: "oj-popper",
					style: {
						left: `${x.value}px`,
						top: `${y.value}px`,
						visibility: placed.value ? "visible" : "hidden"
					}
				}, (_slots$default = slots.default) === null || _slots$default === void 0 ? void 0 : _slots$default.call(slots));
			};
		}
	});
	//#endregion
	//#region src/vue/portal.ts
	/**
	* 浮层挂载与层级（prd/03 §3 D 组）。
	*
	* 三件事必须一起做，缺一件都会在 Office 场景里出问题：
	*   1. **teleport 目标可配**：全屏放映要投进放映容器、iframe 内要投进它自己的 document、打印区域同理，
	*      一律挂 body 是不行的。`false` 表示留在原地（宿主已自己做层级管理）。
	*   2. **层级取自 `--oj-z-*`**：写死 `z-index: 9999` 的库和宿主应用拼层级时必输，
	*      而 token 里 `--oj-z-dropdown/modal/toast` 的相对顺序是设计过的。
	*   3. **滚动锁 + 焦点陷阱**：模态浮层必须挡住背景滚动，且 Tab 不许跑出去。
	*      焦点陷阱还要**归还焦点**——关闭后焦点若掉到 `body`，键盘用户就丢了自己的位置。
	*/
	var FOCUSABLE = "a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex=\"-1\"])";
	/** 多个浮层同时开时不能互相踩：计数归零才恢复原来的 `overflow`。 */
	var scrollLocks = 0;
	var previousOverflow = "";
	function lockScroll() {
		if (typeof document === "undefined") return;
		if (scrollLocks === 0) {
			previousOverflow = document.body.style.overflow;
			document.body.style.overflow = "hidden";
		}
		scrollLocks += 1;
	}
	function unlockScroll() {
		if (typeof document === "undefined") return;
		scrollLocks = Math.max(0, scrollLocks - 1);
		if (scrollLocks === 0) document.body.style.overflow = previousOverflow;
	}
	function teleportTarget$1(value) {
		if (value === false) return void 0;
		return typeof value === "string" && value.length > 0 ? value : "body";
	}
	var OjPortal = (0, vue.defineComponent)({
		name: "OjPortal",
		props: {
			/** `'body' | '#selector' | false` */
			to: {
				type: [String, Boolean],
				default: "body"
			},
			/** 层级，默认取浮层档；要盖住模态就用 `var(--oj-z-modal)` */
			zIndex: {
				type: String,
				default: "var(--oj-z-popover)"
			},
			lockScroll: {
				type: Boolean,
				default: false
			},
			trapFocus: {
				type: Boolean,
				default: false
			}
		},
		setup(props, { slots }) {
			const root = (0, vue.ref)(null);
			let restoreTo = null;
			function focusables() {
				const el = root.value;
				if (!el) return [];
				return [...el.querySelectorAll(FOCUSABLE)];
			}
			function onKeydown(event) {
				if (!props.trapFocus || event.key !== "Tab") return;
				const items = focusables();
				if (items.length === 0) {
					var _root$value;
					event.preventDefault();
					(_root$value = root.value) === null || _root$value === void 0 || _root$value.focus();
					return;
				}
				const first = items[0];
				const last = items[items.length - 1];
				const active = document.activeElement;
				const leavingEnd = !event.shiftKey && active === last;
				const leavingStart = event.shiftKey && (active === first || active === root.value);
				if (leavingEnd) {
					event.preventDefault();
					first.focus();
				} else if (leavingStart) {
					event.preventDefault();
					last.focus();
				}
			}
			(0, vue.onMounted)(() => {
				if (props.lockScroll) lockScroll();
				if (props.trapFocus) {
					var _ref;
					restoreTo = document.activeElement instanceof HTMLElement ? document.activeElement : null;
					const [first] = focusables();
					(_ref = first !== null && first !== void 0 ? first : root.value) === null || _ref === void 0 || _ref.focus();
				}
			});
			(0, vue.onUnmounted)(() => {
				if (props.lockScroll) unlockScroll();
				restoreTo === null || restoreTo === void 0 || restoreTo.focus();
				restoreTo = null;
			});
			return () => {
				var _slots$default;
				const content = (0, vue.h)("div", {
					ref: root,
					class: "oj-portal",
					tabindex: props.trapFocus ? -1 : void 0,
					style: { zIndex: props.zIndex },
					onKeydown
				}, (_slots$default = slots.default) === null || _slots$default === void 0 ? void 0 : _slots$default.call(slots));
				const to = teleportTarget$1(props.to);
				return to === void 0 ? content : (0, vue.h)(vue.Teleport, { to }, [content]);
			};
		}
	});
	//#endregion
	//#region src/vue/context-menu.ts
	/**
	* `OjContextMenu`（03 §3 B 组）。
	*
	* 关键差异在**没有 DOM 锚点**：文档里选中文字、表格里点了右键、canvas 上按了 `contextmenu`，
	* 锚点只是一个坐标。所以定位走 `OjPopper` 的 `anchorBox`（零尺寸矩形），
	* 不依赖任何元素，也就不需要"先找一个元素再量"的那套。
	*
	* 键盘模型（03 §5）：菜单一开就把焦点放到第一个可选项，上下键**环绕**、Home/End 跳首尾、
	* Enter/空格执行、Esc/Tab 关闭。焦点是真的落在 `<button role="menuitem">` 上（roving tabindex），
	* 不是靠 `aria-activedescendant`——后者在 Office 这种"菜单里还嵌选择器"的场景里更容易漏更新。
	*
	* 关闭时把焦点**还给打开前的位置**：canvas 场景下它可能只是 body（那就别抢），
	* 但在输入框上右键的菜单，关掉之后用户还得接着打字。
	*/
	var OjContextMenu = (0, vue.defineComponent)({
		name: "OjContextMenu",
		props: {
			open: {
				type: Boolean,
				required: true
			},
			items: {
				type: Array,
				required: true
			},
			/** 视口坐标（`clientX` / `clientY` 直接给，不要减滚动量） */
			x: {
				type: Number,
				default: 0
			},
			y: {
				type: Number,
				default: 0
			},
			/** `'body' | '#selector' | false`（03 §2「弹层归属」） */
			teleport: {
				type: [String, Boolean],
				default: "body"
			},
			label: {
				type: String,
				default: void 0
			}
		},
		emits: [
			"update:open",
			"select",
			"close"
		],
		setup(props, { emit }) {
			const list = (0, vue.ref)(null);
			const active = (0, vue.ref)(-1);
			let restoreTo = null;
			/** 零尺寸锚点：菜单左上角落在右键位置，越界由 `placePopper` 翻转/夹取。 */
			const anchorBox = (0, vue.computed)(() => ({
				x: props.x,
				y: props.y,
				width: 0,
				height: 0
			}));
			function close(reason) {
				emit("update:open", false);
				emit("close", reason);
			}
			function focusIndex(index) {
				var _list$value;
				active.value = index;
				if (index < 0) return;
				(_list$value = list.value) === null || _list$value === void 0 || (_list$value = _list$value.querySelector(`[data-menu-index="${index}"]`)) === null || _list$value === void 0 || _list$value.focus();
			}
			function move(key) {
				const next = menuNeighbor(props.items, active.value, key);
				if (next === active.value) return false;
				focusIndex(next);
				return true;
			}
			function choose(item) {
				emit("select", item.id);
				close("select");
			}
			function onPointerDown(event) {
				const el = list.value;
				if (el !== null && event.target instanceof Node && el.contains(event.target)) return;
				close("outside");
			}
			function onKeydown(event) {
				if (event.key === "Escape") {
					event.preventDefault();
					event.stopPropagation();
					close("escape");
					return;
				}
				if (event.key === "Tab") {
					event.preventDefault();
					close("tab");
					return;
				}
				if (event.key === "Enter" || event.key === " ") {
					const item = menuAction(props.items, active.value);
					if (item === void 0) return;
					event.preventDefault();
					choose(item);
					return;
				}
				if (move(event.key)) event.preventDefault();
			}
			function bindDocument() {
				if (typeof document === "undefined") return;
				document.addEventListener("pointerdown", onPointerDown, true);
			}
			function unbindDocument() {
				if (typeof document === "undefined") return;
				document.removeEventListener("pointerdown", onPointerDown, true);
			}
			function activate() {
				if (typeof document === "undefined") return;
				restoreTo = document.activeElement instanceof HTMLElement ? document.activeElement : null;
				bindDocument();
				(0, vue.nextTick)(() => focusIndex(menuNeighbor(props.items, -1, "ArrowDown")));
			}
			function deactivate() {
				if (typeof document === "undefined") return;
				unbindDocument();
				active.value = -1;
				if (restoreTo !== null && restoreTo !== document.body && restoreTo.isConnected) restoreTo.focus();
				restoreTo = null;
			}
			(0, vue.onMounted)(() => {
				if (props.open) activate();
			});
			(0, vue.watch)(() => props.open, (open) => {
				if (open) activate();
				else deactivate();
			});
			(0, vue.onUnmounted)(unbindDocument);
			function renderItem(item, index) {
				var _item$label;
				if (item.kind === "separator") return (0, vue.h)("div", {
					class: "oj-context-menu__separator",
					role: "separator"
				});
				return (0, vue.h)("button", {
					type: "button",
					class: "oj-context-menu__item",
					role: "menuitem",
					"data-menu-index": index,
					"data-danger": item.danger ? "" : void 0,
					"data-active": index === active.value ? "" : void 0,
					"aria-disabled": item.disabled ? "true" : void 0,
					tabindex: "-1",
					disabled: item.disabled || void 0,
					onMouseenter: () => {
						if (menuSelectable(item)) active.value = index;
					},
					onClick: () => {
						if (!menuSelectable(item)) return;
						choose(item);
					}
				}, [(0, vue.h)("span", { class: "oj-context-menu__label" }, (_item$label = item.label) !== null && _item$label !== void 0 ? _item$label : item.id), item.shortcut === void 0 ? null : (0, vue.h)("kbd", { class: "oj-context-menu__shortcut" }, item.shortcut)]);
			}
			return () => {
				if (!props.open) return null;
				const nodes = [];
				props.items.forEach((item, index) => {
					if (item.separatorBefore) nodes.push((0, vue.h)("div", {
						class: "oj-context-menu__separator",
						role: "separator"
					}));
					nodes.push(renderItem(item, index));
				});
				return (0, vue.h)(OjPortal, {
					to: props.teleport,
					zIndex: "var(--oj-z-dropdown)"
				}, () => (0, vue.h)(OjPopper, {
					open: props.open,
					anchorBox: anchorBox.value
				}, () => (0, vue.h)("div", {
					ref: list,
					class: "oj-context-menu",
					role: "menu",
					"aria-label": props.label,
					tabindex: "-1",
					onKeydown
				}, nodes)));
			};
		}
	});
	//#endregion
	//#region src/vue/toggle-button.ts
	/**
	* `OjToggleButton`（03 §3 B 组）：自己记按下态，用于格式刷、修订模式这类**本地开关**。
	*
	* 和 `OjCommandButton` 的区别是状态从哪来：命令按钮的状态由注册表推给它（唯一事实来源），
	* 开关按钮的状态属于使用方（`v-model`）。两者都用 `aria-pressed`——用 `data-active` 只做样式
	* 而不给读屏一个说法，是这类控件最常见的无障碍缺口。
	*/
	var OjToggleButton = (0, vue.defineComponent)({
		name: "OjToggleButton",
		props: {
			modelValue: {
				type: Boolean,
				required: true
			},
			label: {
				type: String,
				required: true
			},
			icon: {
				type: String,
				default: void 0
			},
			disabled: {
				type: Boolean,
				default: false
			},
			size: {
				type: String,
				default: "medium"
			}
		},
		emits: ["update:modelValue"],
		setup(props, { slots, emit }) {
			return () => {
				var _slots$default, _slots$default2;
				return (0, vue.h)("button", {
					type: "button",
					class: "oj-button",
					"data-size": props.size === "mini" ? "mini" : void 0,
					"data-active": props.modelValue ? "" : void 0,
					"aria-pressed": props.modelValue ? "true" : "false",
					disabled: props.disabled || void 0,
					onClick: () => {
						if (props.disabled) return;
						emit("update:modelValue", !props.modelValue);
					}
				}, [props.icon ? (0, vue.h)(OjIcon, {
					name: props.icon,
					decorative: true
				}) : null, (0, vue.h)("span", { class: "oj-button__label" }, (_slots$default = (_slots$default2 = slots.default) === null || _slots$default2 === void 0 ? void 0 : _slots$default2.call(slots)) !== null && _slots$default !== void 0 ? _slots$default : props.label)]);
			};
		}
	});
	//#endregion
	//#region src/vue/split-button.ts
	/**
	* `OjSplitButton`（03 §3 B 组）：主操作与下拉箭头**分成两个可点区域**。
	*
	* 这条拆分是这类控件的全部价值：合成一个按钮的话，"粘贴"与"粘贴为纯文本"会变成
	* 点两次才能选到，而用户想要的往往是默认那一下。所以点击主区只发 `run`，
	* 箭头只负责开菜单；靠的是两个独立的 `<button>`，不是在一个按钮里判断坐标。
	*
	* 菜单条目读 `data-value`：有值就发 `select(value)`，没有就让插槽自己处理点击。
	*/
	var OjSplitButton = (0, vue.defineComponent)({
		name: "OjSplitButton",
		props: {
			label: {
				type: String,
				required: true
			},
			icon: {
				type: String,
				default: void 0
			},
			disabled: {
				type: Boolean,
				default: false
			},
			/** 受控展开；不给则组件自己记（仍会发 `update:open`） */
			open: {
				type: Boolean,
				default: void 0
			},
			menuLabel: {
				type: String,
				default: "更多选项"
			},
			size: {
				type: String,
				default: "medium"
			}
		},
		emits: [
			"run",
			"update:open",
			"select"
		],
		setup(props, { slots, emit }) {
			const root = (0, vue.ref)(null);
			const arrow = (0, vue.ref)(null);
			const inner = (0, vue.ref)(false);
			const isOpen = (0, vue.computed)(() => {
				var _props$open;
				return (_props$open = props.open) !== null && _props$open !== void 0 ? _props$open : inner.value;
			});
			function setOpen(next) {
				inner.value = next;
				emit("update:open", next);
			}
			function onPointerDown(event) {
				const el = root.value;
				if (!isOpen.value || !el || !(event.target instanceof Node)) return;
				if (el.contains(event.target)) return;
				setOpen(false);
			}
			function onKeydown(event) {
				var _arrow$value;
				if (!isOpen.value) return;
				if (event.key !== "Escape") return;
				event.stopPropagation();
				setOpen(false);
				(_arrow$value = arrow.value) === null || _arrow$value === void 0 || _arrow$value.focus();
			}
			(0, vue.onMounted)(() => {
				document.addEventListener("pointerdown", onPointerDown);
				document.addEventListener("keydown", onKeydown);
			});
			(0, vue.onUnmounted)(() => {
				document.removeEventListener("pointerdown", onPointerDown);
				document.removeEventListener("keydown", onKeydown);
			});
			function onClickMenu(event) {
				var _target$closest;
				const target = event.target;
				const value = target instanceof Element ? (_target$closest = target.closest("[data-value]")) === null || _target$closest === void 0 ? void 0 : _target$closest.getAttribute("data-value") : null;
				if (value != null) emit("select", value);
				setOpen(false);
			}
			return () => {
				var _slots$label, _slots$label2;
				const size = props.size === "mini" ? "mini" : void 0;
				return (0, vue.h)("div", {
					ref: root,
					class: "oj-split"
				}, [
					(0, vue.h)("button", {
						type: "button",
						class: "oj-split__main oj-button",
						"data-size": size,
						disabled: props.disabled || void 0,
						onClick: () => {
							if (props.disabled) return;
							emit("run");
						}
					}, [props.icon ? (0, vue.h)(OjIcon, {
						name: props.icon,
						decorative: true
					}) : null, (0, vue.h)("span", { class: "oj-button__label" }, (_slots$label = (_slots$label2 = slots.label) === null || _slots$label2 === void 0 ? void 0 : _slots$label2.call(slots)) !== null && _slots$label !== void 0 ? _slots$label : props.label)]),
					(0, vue.h)("button", {
						ref: arrow,
						type: "button",
						class: "oj-split__arrow oj-button",
						"data-size": size,
						disabled: props.disabled || void 0,
						"aria-haspopup": "menu",
						"aria-expanded": isOpen.value ? "true" : "false",
						"aria-label": props.menuLabel,
						title: props.menuLabel,
						onClick: () => {
							if (props.disabled) return;
							setOpen(!isOpen.value);
						},
						onKeydown: (event) => {
							if (props.disabled || event.key !== "ArrowDown") return;
							event.preventDefault();
							setOpen(true);
						}
					}, (0, vue.h)(OjIcon, {
						name: "oj-chevron-down",
						decorative: true
					})),
					(0, vue.h)(OjPopper, {
						open: isOpen.value,
						anchor: arrow.value,
						placement: "bottom-start"
					}, { default: () => {
						var _slots$default;
						return (0, vue.h)("div", {
							class: "oj-split__menu",
							role: "menu",
							"aria-label": props.menuLabel,
							onClick: onClickMenu
						}, [(_slots$default = slots.default) === null || _slots$default === void 0 ? void 0 : _slots$default.call(slots)]);
					} })
				]);
			};
		}
	});
	//#endregion
	//#region src/vue/dropdown-button.ts
	/**
	* `OjDropdownButton`（03 §3 B 组）：整颗按钮是触发器，点开是一组命令。
	*
	* 与 `OjSplitButton` 的差别只有一点：**这里没有主操作**。"边框"这类命令本身没有默认值，
	* 硬给它一个"应用上次选择"的主区，反而会让用户在不该改格式的时候改了格式。
	*
	* 键盘：`↓` 打开、`Esc` 关闭并把焦点还给触发器（03 §5 第 3 条），
	* 菜单条目的点击语义与拆分按钮一致——读 `data-value`。
	*/
	var OjDropdownButton = (0, vue.defineComponent)({
		name: "OjDropdownButton",
		props: {
			label: {
				type: String,
				required: true
			},
			icon: {
				type: String,
				default: void 0
			},
			disabled: {
				type: Boolean,
				default: false
			},
			/** 受控展开；不给则组件自己记（仍会发 `update:open`） */
			open: {
				type: Boolean,
				default: void 0
			},
			size: {
				type: String,
				default: "medium"
			},
			menuLabel: {
				type: String,
				default: void 0
			}
		},
		emits: ["update:open", "select"],
		setup(props, { slots, emit }) {
			const root = (0, vue.ref)(null);
			const trigger = (0, vue.ref)(null);
			const inner = (0, vue.ref)(false);
			const isOpen = (0, vue.computed)(() => {
				var _props$open;
				return (_props$open = props.open) !== null && _props$open !== void 0 ? _props$open : inner.value;
			});
			const menuLabel = (0, vue.computed)(() => {
				var _props$menuLabel;
				return (_props$menuLabel = props.menuLabel) !== null && _props$menuLabel !== void 0 ? _props$menuLabel : props.label;
			});
			function setOpen(next) {
				inner.value = next;
				emit("update:open", next);
			}
			function onPointerDown(event) {
				const el = root.value;
				if (!isOpen.value || !el || !(event.target instanceof Node)) return;
				if (el.contains(event.target)) return;
				setOpen(false);
			}
			function onKeydown(event) {
				var _trigger$value;
				if (!isOpen.value || event.key !== "Escape") return;
				event.stopPropagation();
				setOpen(false);
				(_trigger$value = trigger.value) === null || _trigger$value === void 0 || _trigger$value.focus();
			}
			(0, vue.onMounted)(() => {
				document.addEventListener("pointerdown", onPointerDown);
				document.addEventListener("keydown", onKeydown);
			});
			(0, vue.onUnmounted)(() => {
				document.removeEventListener("pointerdown", onPointerDown);
				document.removeEventListener("keydown", onKeydown);
			});
			function onClickMenu(event) {
				var _target$closest;
				const target = event.target;
				const value = target instanceof Element ? (_target$closest = target.closest("[data-value]")) === null || _target$closest === void 0 ? void 0 : _target$closest.getAttribute("data-value") : null;
				if (value != null) emit("select", value);
				setOpen(false);
			}
			return () => {
				var _slots$label, _slots$label2;
				const size = props.size === "mini" ? "mini" : void 0;
				return (0, vue.h)("div", {
					ref: root,
					class: "oj-dropdown-button"
				}, [(0, vue.h)("button", {
					ref: trigger,
					type: "button",
					class: "oj-dropdown-button__trigger oj-button",
					"data-size": size,
					disabled: props.disabled || void 0,
					"aria-haspopup": "menu",
					"aria-expanded": isOpen.value ? "true" : "false",
					onClick: () => {
						if (props.disabled) return;
						setOpen(!isOpen.value);
					},
					onKeydown: (event) => {
						if (props.disabled || event.key !== "ArrowDown") return;
						event.preventDefault();
						setOpen(true);
					}
				}, [
					props.icon ? (0, vue.h)(OjIcon, {
						name: props.icon,
						decorative: true
					}) : null,
					(0, vue.h)("span", { class: "oj-button__label" }, (_slots$label = (_slots$label2 = slots.label) === null || _slots$label2 === void 0 ? void 0 : _slots$label2.call(slots)) !== null && _slots$label !== void 0 ? _slots$label : props.label),
					(0, vue.h)(OjIcon, {
						name: "oj-chevron-down",
						decorative: true
					})
				]), (0, vue.h)(OjPopper, {
					open: isOpen.value,
					anchor: trigger.value,
					placement: "bottom-start"
				}, { default: () => {
					var _slots$default;
					return (0, vue.h)("div", {
						class: "oj-dropdown-button__menu",
						role: "menu",
						"aria-label": menuLabel.value,
						onClick: onClickMenu
					}, [(_slots$default = slots.default) === null || _slots$default === void 0 ? void 0 : _slots$default.call(slots)]);
				} })]);
			};
		}
	});
	//#endregion
	//#region src/ribbon.ts
	var DEGRADE = {
		large: "medium",
		medium: "small",
		small: void 0
	};
	var SIZE_RANK = {
		large: 2,
		medium: 1,
		small: 0
	};
	/** 取更小的那一档。探测时用它保证只会往下压，不会把命令反向放大。 */
	function ribbonSmallerSize(a, b) {
		return SIZE_RANK[a] <= SIZE_RANK[b] ? a : b;
	}
	/**
	* 还差哪一档的宽度没量到。
	*
	* 没给 `width` 的命令，第一版只能按"设计尺寸"渲染出来才量得到宽度；比它更小的档位
	* 则要**真的按那一档渲染一次**才能量。所以组件按 `medium` → `small` 的顺序整组探一次，
	* 量到就记进表里、立刻按真实宽度重算——不靠比例猜，也不事先克隆一份插槽内容去量。
	*
	* 返回 `undefined` 表示已经量全，或者所有缺失都被使用方用 `widths` 显式给出了。
	*/
	function ribbonProbeSize(items, measured) {
		for (const target of ["medium", "small"]) if (items.some((item) => {
			var _item$widths, _measured$item$id;
			if (SIZE_RANK[item.size] < SIZE_RANK[target]) return false;
			if (target === item.size) return false;
			if (((_item$widths = item.widths) === null || _item$widths === void 0 ? void 0 : _item$widths[target]) !== void 0) return false;
			return ((_measured$item$id = measured[item.id]) === null || _measured$item$id === void 0 ? void 0 : _measured$item$id[target]) === void 0;
		})) return target;
	}
	function widthOf(item) {
		var _item$widths$item$dis, _item$widths2;
		return (_item$widths$item$dis = (_item$widths2 = item.widths) === null || _item$widths2 === void 0 ? void 0 : _item$widths2[item.display]) !== null && _item$widths$item$dis !== void 0 ? _item$widths$item$dis : item.width;
	}
	function span(items, gap) {
		if (items.length === 0) return 0;
		return items.reduce((sum, item) => sum + widthOf(item), 0) + gap * (items.length - 1);
	}
	/**
	* 把命令铺进有限宽度：
	*   1. 放得下就原样放；
	*   2. 放不下先**降级**（large→medium→small）：先整组降一档，还不够再整组降第二档，
	*      每降一个就复查一次——顺序不能乱，Ribbon 的肌肉记忆全靠位置；
	*   3. 还装不下就从**末尾**往 `»` 里塞，塞到连"最后一个可见项 + `»`"都放不下为止。
	*/
	function packRibbon(items, availableWidth, options = {}) {
		var _options$gap, _options$overflowWidt;
		const gap = (_options$gap = options.gap) !== null && _options$gap !== void 0 ? _options$gap : 2;
		const overflowWidth = (_options$overflowWidt = options.overflowWidth) !== null && _options$overflowWidt !== void 0 ? _options$overflowWidt : 20;
		const packed = items.map((item) => ({
			...item,
			display: item.size
		}));
		if (packed.length === 0) return {
			visible: [],
			overflow: [],
			used: 0
		};
		if (span(packed, gap) <= availableWidth) return {
			visible: packed,
			overflow: [],
			used: span(packed, gap)
		};
		for (const target of ["medium", "small"]) for (const item of packed) {
			if (DEGRADE[item.display] !== target) continue;
			item.display = target;
			if (span(packed, gap) <= availableWidth) return {
				visible: packed,
				overflow: [],
				used: span(packed, gap)
			};
		}
		const visible = [...packed];
		const overflow = [];
		while (visible.length > 0) {
			if (span(visible, gap) + gap + overflowWidth <= availableWidth) break;
			overflow.unshift(visible.pop());
		}
		return {
			visible,
			overflow,
			used: span(visible, gap) + (overflow.length > 0 ? (visible.length > 0 ? gap : 0) + overflowWidth : 0)
		};
	}
	function createRibbonChrome(tab, collapsed = false) {
		return {
			tab,
			collapsed,
			peek: false
		};
	}
	/** 面板此刻是否可见。收起 + 没临时展开 = 不可见。 */
	function ribbonPanelOpen(state) {
		return !state.collapsed || state.peek;
	}
	/**
	* 单击选项卡。展开态只切标签；收起态先临时展开，
	* 再点同一个标签则收回（Word/WPS 都是这个手感）。
	*/
	function ribbonSelect(state, id) {
		if (!state.collapsed) return state.tab === id ? state : {
			...state,
			tab: id,
			peek: false
		};
		if (state.peek && state.tab === id) return {
			...state,
			peek: false
		};
		return {
			tab: id,
			collapsed: true,
			peek: true
		};
	}
	/** 双击选项卡（或点收起箭头）：在"固定展开"与"固定收起"之间切，顺手清掉临时展开。 */
	function ribbonToggleCollapsed(state) {
		return {
			tab: state.tab,
			collapsed: !state.collapsed,
			peek: false
		};
	}
	/** Esc / 点到面板外面：只收回临时展开，不动固定状态。 */
	function ribbonDismiss(state) {
		return state.peek ? {
			...state,
			peek: false
		} : state;
	}
	/**
	* 把一次按键映射到选项卡 id。只认单字符、大小写不敏感、先到先得。
	* 多字符（`Enter`、`ArrowLeft`）一律不认：那些键在 Ribbon 里另有语义。
	*/
	function ribbonKeyTip(items, key) {
		if (key.length !== 1) return void 0;
		const wanted = key.toLowerCase();
		for (const item of items) if (item.keyTip !== void 0 && item.keyTip.length > 0 && item.keyTip.toLowerCase() === wanted) return item.id;
	}
	/** 有没有任何标签配了 Key Tip——没配就别在按 `Alt` 时弹一排空提示。 */
	function ribbonHasKeyTips(items) {
		return items.some((item) => item.keyTip !== void 0 && item.keyTip.length > 0);
	}
	//#endregion
	//#region src/vue/dropdown.ts
	var OjDropdown = (0, vue.defineComponent)({
		name: "OjDropdown",
		props: { open: {
			type: Boolean,
			default: false
		} },
		emits: ["update:open"],
		setup(props, { slots, emit }) {
			const root = (0, vue.ref)(null);
			const anchor = (0, vue.ref)(null);
			function setOpen(next) {
				emit("update:open", next);
			}
			function onPointerDown(event) {
				const el = root.value;
				if (!props.open || !el) return;
				if (event.target instanceof Node && el.contains(event.target)) return;
				setOpen(false);
			}
			function onKey(event) {
				if (event.key === "Escape" && props.open) {
					var _anchor$value;
					event.stopPropagation();
					setOpen(false);
					(_anchor$value = anchor.value) === null || _anchor$value === void 0 || _anchor$value.focus();
				}
			}
			(0, vue.onMounted)(() => {
				document.addEventListener("pointerdown", onPointerDown);
			});
			(0, vue.onUnmounted)(() => {
				document.removeEventListener("pointerdown", onPointerDown);
			});
			return () => {
				var _slots$trigger;
				return (0, vue.h)("div", {
					ref: root,
					class: "oj-dropdown",
					onKeydown: onKey
				}, [(0, vue.h)("span", {
					ref: anchor,
					class: "oj-dropdown__trigger",
					onClick: () => setOpen(!props.open)
				}, (_slots$trigger = slots.trigger) === null || _slots$trigger === void 0 ? void 0 : _slots$trigger.call(slots)), (0, vue.h)(OjPopper, {
					open: props.open,
					anchor: anchor.value
				}, { default: () => {
					var _slots$default;
					return (_slots$default = slots.default) === null || _slots$default === void 0 ? void 0 : _slots$default.call(slots);
				} })]);
			};
		}
	});
	//#endregion
	//#region src/vue/ribbon-group.ts
	var OjRibbonGroup = (0, vue.defineComponent)({
		name: "OjRibbonGroup",
		props: {
			items: {
				type: Array,
				required: true
			},
			/** 可用宽度。给了就不观察 DOM，宿主自己掌握的那一路（SSR、虚拟化列表）走这里 */
			available: {
				type: Number,
				default: void 0
			},
			/** 与 CSS 的 gap 同源：由组件写进 style，避免"预算按 2px、排版按 4px"那种错位 */
			gap: {
				type: Number,
				default: 2
			},
			overflowWidth: {
				type: Number,
				default: 20
			},
			label: {
				type: String,
				default: void 0
			},
			overflowLabel: {
				type: String,
				default: "更多"
			}
		},
		setup(props, { slots }) {
			const root = (0, vue.ref)(null);
			const boxWidth = (0, vue.ref)(0);
			const widths = (0, vue.ref)({});
			const probe = (0, vue.ref)(null);
			const open = (0, vue.ref)(false);
			/** 已经探过的档位：量不到（隐藏、零尺寸）时也不能无限重试 */
			const probed = /* @__PURE__ */ new Set();
			let observer;
			/** 有命令没给宽度时才需要自己量 */
			const auto = (0, vue.computed)(() => props.items.some((item) => item.width === void 0));
			function observe() {
				observer === null || observer === void 0 || observer.disconnect();
				observer = void 0;
				const el = root.value;
				if (props.available != null || !el || typeof ResizeObserver === "undefined") return;
				boxWidth.value = el.clientWidth;
				observer = new ResizeObserver((entries) => {
					var _entries$;
					const box = (_entries$ = entries[0]) === null || _entries$ === void 0 ? void 0 : _entries$.contentRect;
					if (box) boxWidth.value = box.width;
				});
				observer.observe(el);
			}
			(0, vue.onMounted)(() => {
				observe();
				measure();
			});
			(0, vue.onUnmounted)(() => observer === null || observer === void 0 ? void 0 : observer.disconnect());
			(0, vue.watch)(() => props.available, observe);
			(0, vue.watch)(() => props.items, () => {
				probed.clear();
				probe.value = null;
			});
			/** 把声明 + 已量到的宽度合成 `packRibbon` 要的形态。没量到的档位不虚构成小值。 */
			const packInput = (0, vue.computed)(() => props.items.map((item) => {
				var _item$widths, _widths$value$item$id, _ref, _item$width;
				const table = {
					...(_item$widths = item.widths) !== null && _item$widths !== void 0 ? _item$widths : {},
					...(_widths$value$item$id = widths.value[item.id]) !== null && _widths$value$item$id !== void 0 ? _widths$value$item$id : {}
				};
				return {
					id: item.id,
					size: item.size,
					width: (_ref = (_item$width = item.width) !== null && _item$width !== void 0 ? _item$width : table[item.size]) !== null && _ref !== void 0 ? _ref : 0,
					widths: table
				};
			}));
			const result = (0, vue.computed)(() => {
				var _props$available;
				return packRibbon(packInput.value, (_props$available = props.available) !== null && _props$available !== void 0 ? _props$available : boxWidth.value, {
					gap: props.gap,
					overflowWidth: props.overflowWidth
				});
			});
			/**
			* 探测期间把**所有**命令按目标档渲染出来：如果这一版还按 `packRibbon` 的结果只渲染
			* 可见项，那么"宽度为 0 时全部溢出"的情况下根本没有节点可量，探测就成了死循环。
			*/
			const layout = (0, vue.computed)(() => {
				const cap = probe.value;
				if (cap === null) return {
					visible: result.value.visible,
					overflow: result.value.overflow
				};
				return {
					visible: [...result.value.visible, ...result.value.overflow].map((item) => ({
						...item,
						display: ribbonSmallerSize(item.display, cap)
					})),
					overflow: []
				};
			});
			/** 量当前渲染出来的每一档宽度。返回是否有新数据。 */
			function measure() {
				const el = root.value;
				if (!el || !auto.value) return false;
				let changed = false;
				for (const node of el.querySelectorAll("[data-item]")) {
					var _widths$value$id, _widths$value$id2;
					const id = node.dataset.item;
					const size = node.dataset.size;
					if (id === void 0 || size === void 0) continue;
					const width = node.offsetWidth;
					if (width <= 0) continue;
					const known = (_widths$value$id = widths.value[id]) === null || _widths$value$id === void 0 ? void 0 : _widths$value$id[size];
					if (known !== void 0 && Math.abs(known - width) < .5) continue;
					widths.value = {
						...widths.value,
						[id]: {
							...(_widths$value$id2 = widths.value[id]) !== null && _widths$value$id2 !== void 0 ? _widths$value$id2 : {},
							[size]: width
						}
					};
					changed = true;
				}
				return changed;
			}
			(0, vue.watch)(() => result.value.overflow.length === 0, (empty) => {
				if (empty) open.value = false;
			});
			(0, vue.onUpdated)(() => {
				if (!auto.value) return;
				measure();
				if (probe.value !== null) {
					probed.add(probe.value);
					probe.value = null;
					return;
				}
				if (result.value.overflow.length === 0) return;
				const next = ribbonProbeSize(props.items, widths.value);
				if (next !== void 0 && !probed.has(next)) probe.value = next;
			});
			function renderItem(item, where) {
				var _slots$overflow, _slot;
				const slot = where === "menu" ? (_slots$overflow = slots.overflow) !== null && _slots$overflow !== void 0 ? _slots$overflow : slots.item : slots.item;
				const body = (_slot = slot === null || slot === void 0 ? void 0 : slot({ item })) !== null && _slot !== void 0 ? _slot : (0, vue.h)("span", { class: "oj-ribbon-group__label" }, item.id);
				return (0, vue.h)("div", {
					class: where === "menu" ? "oj-ribbon-group__menu-item" : "oj-ribbon-group__item",
					"data-item": item.id,
					"data-size": where === "group" ? item.display : void 0,
					role: where === "menu" ? "menuitem" : void 0,
					tabindex: where === "menu" ? "-1" : void 0
				}, [body]);
			}
			function renderOverflow(items) {
				return (0, vue.h)(OjDropdown, {
					open: open.value,
					"onUpdate:open": (next) => {
						open.value = next;
					}
				}, {
					trigger: () => (0, vue.h)("button", {
						type: "button",
						class: "oj-ribbon-group__overflow",
						style: { width: `${props.overflowWidth}px` },
						"aria-haspopup": "menu",
						"aria-expanded": open.value ? "true" : "false",
						"aria-label": props.overflowLabel,
						title: props.overflowLabel
					}, "»"),
					default: () => (0, vue.h)("div", {
						class: "oj-ribbon-group__menu",
						role: "menu",
						"aria-label": props.overflowLabel,
						onClick: () => {
							open.value = false;
						}
					}, items.map((item) => renderItem(item, "menu")))
				});
			}
			return () => {
				const packed = layout.value;
				return (0, vue.h)("div", {
					ref: root,
					class: "oj-ribbon-group",
					role: "toolbar",
					"aria-label": props.label,
					"data-probe": probe.value !== null ? "" : void 0,
					style: { gap: `${props.gap}px` }
				}, [
					...packed.visible.map((item) => renderItem(item, "group")),
					packed.overflow.length > 0 ? renderOverflow(packed.overflow) : null,
					slots.launcher === void 0 ? null : (0, vue.h)("span", { class: "oj-ribbon-group__launcher" }, slots.launcher())
				]);
			};
		}
	});
	//#endregion
	//#region src/vue/toolbar.ts
	/**
	* `OjToolbar`（03 §3 B 组）：单行工具条，是 Ribbon 的简化形态（JitKnow、轻量编辑器用）。
	*
	* 三种溢出策略是**产品决策**，不是样式细节：
	*   - `menu`：宽度不够收进 `»`。位置稳定，盲操不会点错，代价是多一次点击；
	*   - `scroll`：横向滚动。适合命令多但用户不常横向滚的场景，代价是右侧命令**看不见**；
	*   - `wrap`：折行。命令全都可见，代价是吃掉两行高度、把正文往下推。
	* 默认 `menu`：办公场景里"按钮突然跑到第二行"比"多点一次"更让人措手不及。
	*
	* `menu` 直接复用 `OjRibbonGroup`——降级/溢出的预算逻辑只有一份，工具条不该有第二套。
	*/
	var OjToolbar = (0, vue.defineComponent)({
		name: "OjToolbar",
		props: {
			items: {
				type: Array,
				required: true
			},
			overflow: {
				type: String,
				default: "menu"
			},
			available: {
				type: Number,
				default: void 0
			},
			gap: {
				type: Number,
				default: 2
			},
			overflowWidth: {
				type: Number,
				default: 20
			},
			label: {
				type: String,
				default: void 0
			},
			overflowLabel: {
				type: String,
				default: "更多"
			}
		},
		setup(props, { slots }) {
			return () => {
				if (props.overflow === "menu") return (0, vue.h)(OjRibbonGroup, {
					items: props.items,
					available: props.available,
					gap: props.gap,
					overflowWidth: props.overflowWidth,
					label: props.label,
					overflowLabel: props.overflowLabel
				}, {
					item: slots.item,
					overflow: slots.overflow
				});
				return (0, vue.h)("div", {
					class: "oj-toolbar",
					role: "toolbar",
					"aria-label": props.label,
					"data-overflow": props.overflow
				}, props.items.map((item) => {
					var _slots$item, _slots$item2;
					return (0, vue.h)("div", {
						class: "oj-toolbar__item",
						"data-item": item.id,
						"data-size": item.size
					}, (_slots$item = (_slots$item2 = slots.item) === null || _slots$item2 === void 0 ? void 0 : _slots$item2.call(slots, { item: {
						...item,
						display: item.size
					} })) !== null && _slots$item !== void 0 ? _slots$item : (0, vue.h)("span", null, item.id));
				}));
			};
		}
	});
	//#endregion
	//#region src/hotkey.ts
	var MODIFIERS = /* @__PURE__ */ new Set([
		"mod",
		"ctrl",
		"control",
		"cmd",
		"command",
		"meta",
		"alt",
		"option",
		"shift"
	]);
	var KEY_ALIASES = {
		" ": "space",
		spacebar: "space",
		esc: "escape",
		del: "delete",
		ins: "insert",
		up: "arrowup",
		down: "arrowdown",
		left: "arrowleft",
		right: "arrowright",
		plus: "+",
		add: "+"
	};
	/** 显示用的主键名：字母照抄、特殊键给人看得懂的写法 */
	var KEY_LABELS = {
		space: "Space",
		escape: "Esc",
		enter: "Enter",
		tab: "Tab",
		backspace: "Backspace",
		delete: "Del",
		insert: "Ins",
		arrowup: "↑",
		arrowdown: "↓",
		arrowleft: "←",
		arrowright: "→",
		"+": "+",
		"-": "-"
	};
	function normalizeKey(raw) {
		var _KEY_ALIASES$lower;
		if (raw === " ") return "space";
		const lower = raw.trim().toLowerCase();
		return (_KEY_ALIASES$lower = KEY_ALIASES[lower]) !== null && _KEY_ALIASES$lower !== void 0 ? _KEY_ALIASES$lower : lower;
	}
	/** 平台推断只看字符串，方便测试。空串按 linux 处理（最保守的一档）。 */
	function platformFrom(source) {
		if (/mac|iphone|ipad|ipod/i.test(source)) return "mac";
		if (/win/i.test(source)) return "win";
		return "linux";
	}
	/** 运行时平台。拿不到 `navigator` 时按 linux——宁可显示 Ctrl，也不要显示一个假 ⌘。 */
	function detectPlatform() {
		var _nav$platform, _nav$userAgent;
		const nav = globalThis.navigator;
		return platformFrom(`${(_nav$platform = nav === null || nav === void 0 ? void 0 : nav.platform) !== null && _nav$platform !== void 0 ? _nav$platform : ""} ${(_nav$userAgent = nav === null || nav === void 0 ? void 0 : nav.userAgent) !== null && _nav$userAgent !== void 0 ? _nav$userAgent : ""}`);
	}
	function emptySpec() {
		return {
			key: "",
			ctrl: false,
			alt: false,
			shift: false,
			meta: false
		};
	}
	/**
	* 解析 `'mod+shift+z'`。坏绑定一律返回 `undefined`，不抛异常：
	* 命令表是数据，一条写错不应该把整个应用带崩。
	*/
	function parseHotkey(binding, platform) {
		const trimmed = binding.trim();
		const parts = (trimmed.endsWith("++") ? `${trimmed.slice(0, -2)}+plus` : trimmed).split("+").map((part) => part.trim());
		const spec = emptySpec();
		const keys = [];
		for (const part of parts) {
			if (part.length === 0) return void 0;
			const lower = part.toLowerCase();
			if (MODIFIERS.has(lower)) {
				if (lower === "mod") {
					if (platform === "mac") spec.meta = true;
					else spec.ctrl = true;
				} else if (lower === "ctrl" || lower === "control") spec.ctrl = true;
				else if (lower === "cmd" || lower === "command" || lower === "meta") spec.meta = true;
				else if (lower === "alt" || lower === "option") spec.alt = true;
				else spec.shift = true;
				continue;
			}
			keys.push(normalizeKey(part));
		}
		if (keys.length !== 1) return void 0;
		spec.key = keys[0];
		return spec;
	}
	/** 严格匹配：修饰键多一个、少一个都不算命中。 */
	function matchHotkey(spec, event) {
		return normalizeKey(event.key) === spec.key && event.ctrlKey === spec.ctrl && event.altKey === spec.alt && event.shiftKey === spec.shift && event.metaKey === spec.meta;
	}
	/** 显示用文案：mac 用符号且不加 `+`，Windows/Linux 用 `Ctrl+Shift+Z` 这种写法。 */
	function formatHotkey(binding, platform) {
		var _KEY_LABELS$spec$key;
		const spec = parseHotkey(binding, platform);
		if (spec === void 0) return binding;
		const key = (_KEY_LABELS$spec$key = KEY_LABELS[spec.key]) !== null && _KEY_LABELS$spec$key !== void 0 ? _KEY_LABELS$spec$key : spec.key.length === 1 ? spec.key.toUpperCase() : spec.key;
		if (platform === "mac") return `${spec.ctrl ? "⌃" : ""}${spec.alt ? "⌥" : ""}${spec.shift ? "⇧" : ""}${spec.meta ? "⌘" : ""}${key}`;
		const parts = [];
		if (spec.ctrl) parts.push("Ctrl");
		if (spec.alt) parts.push("Alt");
		if (spec.shift) parts.push("Shift");
		if (spec.meta) parts.push("Win");
		parts.push(key);
		return parts.join("+");
	}
	//#endregion
	//#region src/vue/hotkey.ts
	/**
	* `OjHotkey`（03 §3 B 组）：把命令表里的 `keys` 绑到真实键盘事件上。渲染 `null`，
	* 只负责监听、匹配、发事件——执行由使用方交给命令注册表（`registry.run(id)`）。
	*
	* 三条必须在这里做对的语义：
	*   1. **IME 期间不响应**（03 §5 第 7 条）。中日文输入法的合成阶段按 Enter/Esc 是给
	*      输入法的，抢过来就等于在核心场景里让用户打不出字。
	*   2. **`event.defaultPrevented` 之后不再抢**。前一个处理器已经处理过的键（比如浮层里的
	*      `Esc`），快捷键层必须让路。
	*   3. **只发意图，不判断能不能执行**。`enabled` / `when` 属于注册表，它比这一层知道得多。
	*/
	var OjHotkey = (0, vue.defineComponent)({
		name: "OjHotkey",
		props: {
			bindings: {
				type: Array,
				required: true
			},
			/** 不给就按运行时平台推断；显式给可以用在"按宿主平台显示/匹配"的场景 */
			platform: {
				type: String,
				default: void 0
			},
			enabled: {
				type: Boolean,
				default: true
			}
		},
		emits: ["run"],
		setup(props, { emit }) {
			const platform = (0, vue.computed)(() => {
				var _props$platform;
				return (_props$platform = props.platform) !== null && _props$platform !== void 0 ? _props$platform : detectPlatform();
			});
			function keysOf(binding) {
				if (binding.keys === void 0) return [];
				return typeof binding.keys === "string" ? [binding.keys] : binding.keys;
			}
			function onKeydown(event) {
				if (!props.enabled || event.defaultPrevented || event.isComposing) return;
				for (const binding of props.bindings) for (const key of keysOf(binding)) {
					const spec = parseHotkey(key, platform.value);
					if (spec === void 0 || !matchHotkey(spec, event)) continue;
					event.preventDefault();
					emit("run", binding.id);
					return;
				}
			}
			function warnConflicts() {}
			(0, vue.onMounted)(() => {
				window.addEventListener("keydown", onKeydown);
			});
			(0, vue.onUnmounted)(() => {
				window.removeEventListener("keydown", onKeydown);
			});
			(0, vue.watch)(() => [props.bindings, props.platform], warnConflicts);
			return () => null;
		}
	});
	//#endregion
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
				var _slots$default, _slots$start, _slots$end;
				const middle = [(_slots$default = slots.default) === null || _slots$default === void 0 ? void 0 : _slots$default.call(slots)];
				if (props.page !== void 0) middle.push(item("page", props.page));
				if (props.words !== void 0) middle.push(item("words", props.words));
				if (props.language !== void 0) middle.push(item("language", props.language));
				if (props.zoom !== void 0) middle.push(item("zoom", `${props.zoom}%`));
				if (props.collaborators !== void 0) middle.push(item("collaborators", props.collaborators));
				return (0, vue.h)("footer", {
					class: "oj-status-bar",
					"aria-label": props.label
				}, [
					(0, vue.h)("div", { class: "oj-status-bar__start" }, (_slots$start = slots.start) === null || _slots$start === void 0 ? void 0 : _slots$start.call(slots)),
					(0, vue.h)("div", { class: "oj-status-bar__center" }, middle),
					(0, vue.h)("div", { class: "oj-status-bar__end" }, (_slots$end = slots.end) === null || _slots$end === void 0 ? void 0 : _slots$end.call(slots))
				]);
			};
		}
	});
	//#endregion
	//#region src/shell/gallery.ts
	/** 返回移动后的下标。`columns` 非法（0、负数、NaN）时按 1 列处理，不抛异常。 */
	function galleryNeighbor(columns, count, index, key) {
		if (count <= 0) return 0;
		const cols = Number.isFinite(columns) && columns >= 1 ? Math.floor(columns) : 1;
		const current = Math.min(Math.max(Number.isFinite(index) ? Math.floor(index) : 0, 0), count - 1);
		if (key === "ArrowRight") return Math.min(current + 1, count - 1);
		if (key === "ArrowLeft") return Math.max(current - 1, 0);
		if (key === "ArrowDown") return Math.min(current + cols, count - 1);
		if (key === "ArrowUp") return Math.max(current - cols, 0);
		if (key === "Home") return 0;
		if (key === "End") return count - 1;
		return current;
	}
	//#endregion
	//#region src/vue/ribbon-gallery.ts
	/**
	* `OjRibbonGallery`（03 §3 B 组 🟡）：命令的网格陈列（样式库、符号）。
	*
	* 网格的键盘模型和普通列表不一样：上下要按**整行**跳、左右按格跳，且最后一行不满
	* 也不能走出边界。这段规则放在 `galleryNeighbor`（零依赖、有单测），组件只负责
	* roving tabindex 与把焦点真的挪过去。
	*/
	var OjRibbonGallery = (0, vue.defineComponent)({
		name: "OjRibbonGallery",
		props: {
			items: {
				type: Array,
				required: true
			},
			columns: {
				type: Number,
				default: 4
			},
			label: {
				type: String,
				default: void 0
			}
		},
		emits: ["select"],
		setup(props, { slots, emit }) {
			const root = (0, vue.ref)(null);
			const focused = (0, vue.ref)(0);
			(0, vue.watch)(() => props.items.length, (length) => {
				if (focused.value > length - 1) focused.value = Math.max(0, length - 1);
			});
			function cells() {
				var _root$value$querySele, _root$value;
				return [...(_root$value$querySele = (_root$value = root.value) === null || _root$value === void 0 ? void 0 : _root$value.querySelectorAll("[data-gallery-item]")) !== null && _root$value$querySele !== void 0 ? _root$value$querySele : []];
			}
			function focusItem(index) {
				var _cells$index;
				(_cells$index = cells()[index]) === null || _cells$index === void 0 || _cells$index.focus();
			}
			/**
			* 从 `from` 出发沿 `direction` 找第一个能聚焦的格子。
			* 禁用的 `<button>` 收不到焦点——直接 `focus()` 会静默失败，焦点留在原地，
			* 用户按了方向键却什么都没发生。
			*/
			function nearestEnabled(from, direction) {
				const nodes = cells();
				for (let i = from; i >= 0 && i < nodes.length; i += direction) if (!nodes[i].disabled) return i;
			}
			function onKeydown(event) {
				const target = galleryNeighbor(props.columns, props.items.length, focused.value, event.key);
				if (target === focused.value) return;
				event.preventDefault();
				const direction = target > focused.value ? 1 : -1;
				let index = nearestEnabled(target, direction);
				if (index === void 0) index = nearestEnabled(target, direction === 1 ? -1 : 1);
				if (index === void 0) return;
				focused.value = index;
				focusItem(index);
			}
			return () => {
				const columns = Number.isFinite(props.columns) && props.columns >= 1 ? Math.floor(props.columns) : 1;
				return (0, vue.h)("div", {
					ref: root,
					class: "oj-ribbon-gallery",
					role: "group",
					"aria-label": props.label,
					style: { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` },
					onKeydown
				}, props.items.map((item, index) => {
					var _slots$item, _slots$item2;
					return (0, vue.h)("button", {
						type: "button",
						class: "oj-ribbon-gallery__item",
						"data-gallery-item": "",
						"data-item": item.id,
						"data-active": item.active ? "" : void 0,
						disabled: item.disabled || void 0,
						tabindex: index === focused.value ? 0 : -1,
						onClick: () => {
							if (item.disabled) return;
							focused.value = index;
							emit("select", item.id);
						}
					}, (_slots$item = (_slots$item2 = slots.item) === null || _slots$item2 === void 0 ? void 0 : _slots$item2.call(slots, {
						item,
						index
					})) !== null && _slots$item !== void 0 ? _slots$item : [item.icon ? (0, vue.h)(OjIcon, {
						name: item.icon,
						decorative: true
					}) : null, (0, vue.h)("span", { class: "oj-ribbon-gallery__label" }, item.label)]);
				}));
			};
		}
	});
	//#endregion
	//#region src/palette.ts
	function isSubsequence(needle, haystack) {
		let at = 0;
		for (const char of haystack) {
			if (char === needle[at]) at += 1;
			if (at === needle.length) return true;
		}
		return needle.length === 0;
	}
	/** 命中返回分数（越大越靠前），不命中返回 `undefined`。空查询一律命中且同分。 */
	function paletteScore(item, query) {
		const wanted = query.trim().toLowerCase();
		if (wanted.length === 0) return 0;
		const label = item.label.toLowerCase();
		if (label === wanted) return 100;
		if (label.startsWith(wanted)) return 80;
		if (label.includes(wanted)) return 60;
		if (item.id.toLowerCase().includes(wanted)) return 40;
		if (item.description !== void 0 && item.description.toLowerCase().includes(wanted)) return 30;
		if (isSubsequence(wanted, label)) return 20;
	}
	function filterPaletteItems(items, query) {
		const scored = [];
		items.forEach((item, index) => {
			const score = paletteScore(item, query);
			if (score !== void 0) scored.push({
				item,
				score,
				index
			});
		});
		scored.sort((a, b) => b.score - a.score || a.index - b.index);
		return scored.map((entry) => entry.item);
	}
	/** 面板里上下移动高亮。**循环**：在最后一条按 ↓ 应该回到第一条，而不是卡住。 */
	function paletteStep(count, current, delta) {
		if (count <= 0) return 0;
		const size = Math.floor(count);
		return (((Number.isFinite(current) ? Math.floor(current) : 0) + (Number.isFinite(delta) ? Math.floor(delta) : 0)) % size + size) % size;
	}
	//#endregion
	//#region src/vue/command-palette.ts
	/**
	* `OjCommandPalette`（03 §3 B 组）：`Ctrl+/` 或 `Ctrl+P` 唤起的命令搜索。
	*
	* 搜索排序在 `palette.ts`（零依赖、有单测），这里只管浮层与键盘：
	*   - `role="dialog"` + 焦点陷阱 + 关闭归还焦点，全部复用 `OjPortal`；
	*   - 输入框是 `combobox`，高亮项通过 `aria-activedescendant` 报给读屏；
	*   - **IME 合成期间不抢 `Enter`**（03 §5 第 7 条）：中日文用户正在选词时回车，
	*     意图是"确认这个词"，不是"执行第一条命令"。
	*/
	var OjCommandPalette = (0, vue.defineComponent)({
		name: "OjCommandPalette",
		props: {
			open: {
				type: Boolean,
				required: true
			},
			items: {
				type: Array,
				required: true
			},
			/** 受控查询词；不给则组件自己记（仍会发 `update:query`） */
			query: {
				type: String,
				default: void 0
			},
			label: {
				type: String,
				default: "命令面板"
			},
			placeholder: {
				type: String,
				default: "搜索命令"
			},
			emptyLabel: {
				type: String,
				default: "没有匹配的命令"
			}
		},
		emits: [
			"update:open",
			"update:query",
			"select"
		],
		setup(props, { emit }) {
			const inner = (0, vue.ref)("");
			const active = (0, vue.ref)(0);
			const platform = detectPlatform();
			const text = (0, vue.computed)(() => {
				var _props$query;
				return (_props$query = props.query) !== null && _props$query !== void 0 ? _props$query : inner.value;
			});
			const results = (0, vue.computed)(() => filterPaletteItems(props.items, text.value));
			const current = (0, vue.computed)(() => results.value[active.value]);
			(0, vue.watch)(() => props.open, (open) => {
				if (open) active.value = 0;
			});
			(0, vue.watch)(() => results.value.length, (length) => {
				if (active.value > length - 1) active.value = Math.max(0, length - 1);
			});
			function close() {
				emit("update:open", false);
			}
			function choose(index) {
				const item = results.value[index];
				if (item === void 0 || item.disabled) return;
				emit("select", item.id);
				close();
			}
			function onKeydown(event) {
				if (event.key === "ArrowDown" || event.key === "ArrowUp") {
					event.preventDefault();
					active.value = paletteStep(results.value.length, active.value, event.key === "ArrowDown" ? 1 : -1);
					return;
				}
				if (event.key === "Home" || event.key === "End") {
					event.preventDefault();
					active.value = event.key === "Home" ? 0 : Math.max(0, results.value.length - 1);
					return;
				}
				if (event.key === "Enter") {
					if (event.isComposing) return;
					event.preventDefault();
					choose(active.value);
					return;
				}
				if (event.key === "Escape") {
					event.stopPropagation();
					close();
				}
			}
			function onInput(event) {
				const value = event.target.value;
				inner.value = value;
				active.value = 0;
				emit("update:query", value);
			}
			function keyLabel(item) {
				if (item.keys === void 0) return void 0;
				const first = typeof item.keys === "string" ? item.keys : item.keys[0];
				return first === void 0 ? void 0 : formatHotkey(first, platform);
			}
			return () => {
				if (!props.open) return null;
				return (0, vue.h)(OjPortal, {
					trapFocus: true,
					lockScroll: true,
					zIndex: "var(--oj-z-modal)"
				}, { default: () => (0, vue.h)("div", {
					class: "oj-palette__mask",
					onClick: (event) => {
						if (event.target === event.currentTarget) close();
					}
				}, [(0, vue.h)("div", {
					class: "oj-palette",
					role: "dialog",
					"aria-modal": "true",
					"aria-label": props.label,
					onKeydown
				}, [
					(0, vue.h)("input", {
						class: "oj-palette__input",
						type: "search",
						value: text.value,
						placeholder: props.placeholder,
						"aria-label": props.placeholder,
						role: "combobox",
						"aria-expanded": "true",
						"aria-controls": "oj-palette-list",
						"aria-autocomplete": "list",
						"aria-activedescendant": current.value === void 0 ? void 0 : `oj-palette-${current.value.id}`,
						onInput
					}),
					(0, vue.h)("ul", {
						class: "oj-palette__list",
						id: "oj-palette-list",
						role: "listbox",
						"aria-label": props.label
					}, results.value.map((item, index) => (0, vue.h)("li", {
						id: `oj-palette-${item.id}`,
						class: "oj-palette__item",
						role: "option",
						"data-item": item.id,
						"data-active": index === active.value ? "" : void 0,
						"aria-selected": index === active.value ? "true" : "false",
						"aria-disabled": item.disabled ? "true" : void 0,
						onClick: () => choose(index)
					}, [
						(0, vue.h)("span", { class: "oj-palette__label" }, item.label),
						item.group === void 0 ? null : (0, vue.h)("span", { class: "oj-palette__group" }, item.group),
						keyLabel(item) === void 0 ? null : (0, vue.h)("kbd", { class: "oj-palette__keys" }, keyLabel(item))
					]))),
					results.value.length === 0 ? (0, vue.h)("p", { class: "oj-palette__empty" }, props.emptyLabel) : null
				])]) });
			};
		}
	});
	//#endregion
	//#region src/trigger.ts
	var defaultScheduler = {
		setTimeout: (task, ms) => globalThis.setTimeout(task, ms),
		clearTimeout: (handle) => globalThis.clearTimeout(handle)
	};
	function createTriggerMachine(options = {}) {
		var _options$modes, _options$openDelay, _options$closeDelay, _options$scheduler;
		const modes = new Set((_options$modes = options.modes) !== null && _options$modes !== void 0 ? _options$modes : ["click"]);
		const openDelay = (_options$openDelay = options.openDelay) !== null && _options$openDelay !== void 0 ? _options$openDelay : 0;
		const closeDelay = (_options$closeDelay = options.closeDelay) !== null && _options$closeDelay !== void 0 ? _options$closeDelay : 120;
		const scheduler = (_options$scheduler = options.scheduler) !== null && _options$scheduler !== void 0 ? _options$scheduler : defaultScheduler;
		let timer;
		let open = false;
		function cancel() {
			if (timer === void 0) return;
			scheduler.clearTimeout(timer);
			timer = void 0;
		}
		function apply(next, reason) {
			var _options$onOpen, _options$onClose;
			cancel();
			if (next === open) return;
			open = next;
			if (open) (_options$onOpen = options.onOpen) === null || _options$onOpen === void 0 || _options$onOpen.call(options);
			else (_options$onClose = options.onClose) === null || _options$onClose === void 0 || _options$onClose.call(options, reason);
		}
		function later(ms, task) {
			cancel();
			if (ms <= 0) {
				task();
				return;
			}
			timer = scheduler.setTimeout(() => {
				timer = void 0;
				task();
			}, ms);
		}
		return {
			isOpen: () => open,
			/** 指针进入触发器（或触发器获得焦点时的 hover 语义） */
			enter() {
				if (modes.has("hover")) later(openDelay, () => apply(true, "leave"));
			},
			leave() {
				if (modes.has("hover")) later(closeDelay, () => apply(false, "leave"));
			},
			/**
			* 指针进入面板：只取消待关闭，不动 open。
			* 这是 closeDelay 存在的全部理由——从触发器到面板之间必然有一段空白。
			*/
			panelEnter() {
				cancel();
			},
			panelLeave() {
				if (modes.has("hover")) later(closeDelay, () => apply(false, "panel-leave"));
			},
			press() {
				if (modes.has("click")) apply(!open, "press");
			},
			focusIn() {
				if (modes.has("focus")) apply(true, "leave");
			},
			focusOut() {
				if (modes.has("focus")) later(closeDelay, () => apply(false, "blur"));
			},
			escape() {
				apply(false, "escape");
			},
			close(reason = "manual") {
				apply(false, reason);
			},
			/**
			* 跟上外部真值（`v-model:open`）。
			*
			* 不跟的话，外部把面板关掉之后机器内部还记着 `open === true`，
			* 下一次 `press()` 会算成"关闭"，用户点两下才打开。
			*/
			sync(value) {
				cancel();
				open = value;
			},
			dispose() {
				cancel();
			}
		};
	}
	//#endregion
	//#region src/vue/trigger.ts
	/**
	* 触发器 + 浮层（prd/03 §3 D 组）：`hover/click/focus/manual` 可组合，含离开延迟。
	*
	* 交互语义全在 `../trigger.ts` 的机器里（零依赖可测），这里只负责把 DOM 事件接上去、
	* 以及把面板放进 `OjPortal` + `OjPopper`。
	*
	* 受控与非受控都给：传 `open` 就是受控（配 `@update:open`），不传就内部自己管。
	* 03 §2 要求"所有可选面板组件同时支持 `v-model` 与 `defaultVisible`"——只给受控会把
	* "我想临时弹一下"这种最常见的用法写复杂。
	*/
	var OjTrigger = (0, vue.defineComponent)({
		name: "OjTrigger",
		props: {
			open: {
				type: Boolean,
				default: void 0
			},
			modes: {
				type: [Array, String],
				default: () => ["click"]
			},
			placement: {
				type: String,
				default: "bottom-start"
			},
			openDelay: {
				type: Number,
				default: 0
			},
			closeDelay: {
				type: Number,
				default: 120
			},
			/** 面板是否挂到 body（`false` 留在原地） */
			portal: {
				type: Boolean,
				default: true
			},
			/** 透传给 `OjPortal` 的挂载点 */
			teleport: {
				type: [String, Boolean],
				default: "body"
			},
			lockScroll: {
				type: Boolean,
				default: false
			},
			trapFocus: {
				type: Boolean,
				default: false
			}
		},
		emits: [
			"update:open",
			"open",
			"close"
		],
		setup(props, { slots, emit }) {
			const anchor = (0, vue.ref)(null);
			const inner = (0, vue.ref)(false);
			const isControlled = () => props.open !== void 0;
			const isOpen = () => isControlled() ? props.open === true : inner.value;
			const machine = createTriggerMachine({
				modes: typeof props.modes === "string" ? [props.modes] : props.modes,
				openDelay: props.openDelay,
				closeDelay: props.closeDelay,
				onOpen: () => {
					if (!isControlled()) inner.value = true;
					emit("update:open", true);
					emit("open");
				},
				onClose: (reason) => {
					if (!isControlled()) inner.value = false;
					emit("update:open", false);
					emit("close", reason);
				}
			});
			(0, vue.watch)(() => props.open, (open) => {
				if (open !== void 0) machine.sync(open);
			}, { immediate: true });
			(0, vue.onUnmounted)(() => machine.dispose());
			function onKeydown(event) {
				if (event.key === "Escape" && isOpen()) machine.escape();
			}
			return () => {
				var _slots$default;
				const open = isOpen();
				return (0, vue.h)("span", {
					ref: anchor,
					class: "oj-trigger",
					"data-open": open ? "" : void 0,
					onClick: () => machine.press(),
					onMouseenter: () => machine.enter(),
					onMouseleave: () => machine.leave(),
					onFocusin: () => machine.focusIn(),
					onFocusout: () => machine.focusOut(),
					onKeydown
				}, [(_slots$default = slots.default) === null || _slots$default === void 0 ? void 0 : _slots$default.call(slots), open ? (0, vue.h)(OjPortal, {
					to: props.portal ? props.teleport : false,
					lockScroll: props.lockScroll,
					trapFocus: props.trapFocus
				}, () => (0, vue.h)(OjPopper, {
					open,
					anchor: anchor.value,
					placement: props.placement
				}, () => {
					var _slots$panel;
					return (0, vue.h)("div", {
						class: "oj-trigger__panel",
						role: "dialog",
						onMouseenter: () => machine.panelEnter(),
						onMouseleave: () => machine.panelLeave(),
						onKeydown
					}, (_slots$panel = slots.panel) === null || _slots$panel === void 0 ? void 0 : _slots$panel.call(slots));
				})) : null]);
			};
		}
	});
	//#endregion
	//#region src/tooltip.ts
	function defaultSchedule(fn, ms) {
		const id = setTimeout(fn, ms);
		return () => clearTimeout(id);
	}
	function createTooltipMachine(options = {}) {
		var _options$delay, _options$schedule;
		const delay = (_options$delay = options.delay) !== null && _options$delay !== void 0 ? _options$delay : 400;
		const schedule = (_options$schedule = options.schedule) !== null && _options$schedule !== void 0 ? _options$schedule : defaultSchedule;
		let open = false;
		let pending = null;
		function setOpen(next) {
			var _options$onChange;
			if (open === next) return;
			open = next;
			(_options$onChange = options.onChange) === null || _options$onChange === void 0 || _options$onChange.call(options, open);
		}
		function cancel() {
			pending === null || pending === void 0 || pending();
			pending = null;
		}
		return {
			get open() {
				return open;
			},
			enter() {
				if (open || pending) return;
				pending = schedule(() => {
					pending = null;
					setOpen(true);
				}, delay);
			},
			leave() {
				cancel();
				setOpen(false);
			},
			show() {
				cancel();
				setOpen(true);
			},
			hide() {
				cancel();
				setOpen(false);
			},
			dispose() {
				cancel();
			}
		};
	}
	//#endregion
	//#region src/vue/tooltip.ts
	var OjTooltip = (0, vue.defineComponent)({
		name: "OjTooltip",
		props: {
			label: {
				type: String,
				required: true
			},
			delay: {
				type: Number,
				default: 400
			}
		},
		setup(props, { slots }) {
			const root = (0, vue.ref)(null);
			const open = (0, vue.ref)(false);
			const x = (0, vue.ref)(0);
			const y = (0, vue.ref)(0);
			const machine = createTooltipMachine({
				get delay() {
					return props.delay;
				},
				onChange: (next) => {
					open.value = next;
					if (!next || !root.value) return;
					const box = root.value.getBoundingClientRect();
					const pos = placePopper({
						anchor: {
							x: box.left,
							y: box.top,
							width: box.width,
							height: box.height
						},
						popup: {
							width: Math.max(props.label.length * 12, 48),
							height: 28
						},
						viewport: {
							width: window.innerWidth,
							height: window.innerHeight
						},
						placement: "top-start"
					});
					x.value = pos.x;
					y.value = pos.y;
				}
			});
			(0, vue.onUnmounted)(() => machine.dispose());
			return () => {
				var _slots$default;
				return (0, vue.h)("span", {
					ref: root,
					class: "oj-tooltip-anchor",
					onMouseenter: () => machine.enter(),
					onMouseleave: () => machine.leave(),
					onFocusin: () => machine.show(),
					onFocusout: () => machine.hide()
				}, [(_slots$default = slots.default) === null || _slots$default === void 0 ? void 0 : _slots$default.call(slots), open.value ? (0, vue.h)("span", {
					class: "oj-tooltip",
					role: "tooltip",
					style: {
						left: `${x.value}px`,
						top: `${y.value}px`
					}
				}, props.label) : null]);
			};
		}
	});
	//#endregion
	//#region src/shell/tabs.ts
	/** 选项卡键盘模型。方向键在一组 id 里循环，Home / End 跳到两端。 */
	function selectByKey(ids, current, key) {
		var _ids, _ids2, _ids$, _ids3;
		if (ids.length === 0) return current;
		const index = Math.max(0, ids.indexOf(current));
		if (key === "ArrowRight") return (_ids = ids[(index + 1) % ids.length]) !== null && _ids !== void 0 ? _ids : current;
		if (key === "ArrowLeft") return (_ids2 = ids[(index - 1 + ids.length) % ids.length]) !== null && _ids2 !== void 0 ? _ids2 : current;
		if (key === "Home") return (_ids$ = ids[0]) !== null && _ids$ !== void 0 ? _ids$ : current;
		if (key === "End") return (_ids3 = ids[ids.length - 1]) !== null && _ids3 !== void 0 ? _ids3 : current;
		return current;
	}
	//#endregion
	//#region src/vue/ribbon-tab.ts
	/**
	* `OjRibbonTab`（03 §3 B 组）：一个选项卡按钮。
	*
	* 刻意不做键盘：方向键与 `Home`/`End` 是 **tablist** 的语义（roving tabindex），
	* 逻辑在 `OjRibbon` 上；Key Tip 的**显示时机**也归 `OjRibbon`（Alt 的 keyup 事件在文档层）。
	* 这里只负责 `role="tab"`、`aria-selected`、点击，以及那枚提示键的渲染。
	*/
	var OjRibbonTab = (0, vue.defineComponent)({
		name: "OjRibbonTab",
		props: {
			id: {
				type: String,
				required: true
			},
			label: {
				type: String,
				required: true
			},
			selected: {
				type: Boolean,
				default: false
			},
			keyTip: {
				type: String,
				default: void 0
			},
			/** 按 `Alt` 期间才显示提示键 */
			showKeyTip: {
				type: Boolean,
				default: false
			}
		},
		emits: ["select"],
		setup(props, { slots, emit }) {
			return () => {
				var _slots$default, _slots$default2;
				const tip = props.keyTip !== void 0 && props.keyTip.length > 0 ? props.keyTip.toUpperCase() : void 0;
				return (0, vue.h)("button", {
					type: "button",
					class: "oj-ribbon__tab",
					role: "tab",
					id: `oj-ribbon-tab-${props.id}`,
					"data-tab": props.id,
					"aria-selected": props.selected ? "true" : "false",
					"aria-controls": `oj-ribbon-panel-${props.id}`,
					"aria-keyshortcuts": tip === void 0 ? void 0 : `Alt+${tip}`,
					tabindex: props.selected ? 0 : -1,
					onClick: () => emit("select", props.id)
				}, [(_slots$default = (_slots$default2 = slots.default) === null || _slots$default2 === void 0 ? void 0 : _slots$default2.call(slots)) !== null && _slots$default !== void 0 ? _slots$default : props.label, props.showKeyTip && tip !== void 0 ? (0, vue.h)("span", {
					class: "oj-ribbon__keytip",
					"aria-hidden": "true"
				}, tip) : null]);
			};
		}
	});
	//#endregion
	//#region src/vue/ribbon.ts
	/**
	* `OjRibbon`（03 §3 B 组）：选项卡 + 组 + 自动折叠（双击标签收起，同 Word）。
	*
	* 折叠拆成 `collapsed`（固定）与 `peek`（临时）两个状态，规则全在 `ribbon.ts` 的纯函数里，
	* 这里只做碰 DOM 的那几件事：派发点击/双击、把方向键换成标签切换、收起时把焦点留在标签上、
	* "点面板外面就收回临时展开"，以及 `Alt` 唤起 Key Tips 后按字母直达标签。
	*
	* ARIA 按 03 §5 的第 2、4 条：外层 `tablist` + `tab` + `tabpanel`，
	* 收起/展开按钮带 `aria-expanded`，方向键在标签间循环，配了 Key Tip 的标签带 `aria-keyshortcuts`。
	*/
	var OjRibbon = (0, vue.defineComponent)({
		name: "OjRibbon",
		props: {
			items: {
				type: Array,
				required: true
			},
			modelValue: {
				type: String,
				required: true
			},
			/** 受控折叠：给了就听外部的；不给则由组件自己记（仍会发 `update:collapsed`） */
			collapsed: {
				type: Boolean,
				default: void 0
			},
			label: {
				type: String,
				default: void 0
			},
			collapseLabel: {
				type: String,
				default: "收起功能区"
			},
			expandLabel: {
				type: String,
				default: "展开功能区"
			}
		},
		emits: ["update:modelValue", "update:collapsed"],
		setup(props, { slots, emit }) {
			var _props$collapsed;
			const root = (0, vue.ref)(null);
			const state = (0, vue.ref)(createRibbonChrome(props.modelValue, (_props$collapsed = props.collapsed) !== null && _props$collapsed !== void 0 ? _props$collapsed : false));
			const open = (0, vue.computed)(() => ribbonPanelOpen(state.value));
			/** `Alt` 按住期间的 Key Tips 可见性——纯展示状态，不进 chrome 状态机 */
			const tips = (0, vue.ref)(false);
			(0, vue.watch)(() => props.modelValue, (tab) => {
				if (tab === state.value.tab) return;
				state.value = {
					...state.value,
					tab
				};
			});
			(0, vue.watch)(() => props.collapsed, (collapsed) => {
				if (collapsed === void 0 || collapsed === state.value.collapsed) return;
				state.value = {
					...state.value,
					collapsed,
					peek: false
				};
			});
			/**
			* 状态写入的唯一入口。`collapsed` 是受控的（给了 prop 就听 prop），
			* 内部状态永远先跟 prop 对齐——否则父级没接受这次变更时，界面会和 prop 分叉。
			*/
			function apply(next) {
				const previous = state.value;
				const normalized = props.collapsed === void 0 ? next : {
					...next,
					collapsed: props.collapsed
				};
				if (normalized.tab !== previous.tab || normalized.collapsed !== previous.collapsed || normalized.peek !== previous.peek) state.value = normalized;
				if (next.tab !== previous.tab) emit("update:modelValue", next.tab);
				if (next.collapsed !== previous.collapsed) emit("update:collapsed", next.collapsed);
			}
			function focusTab(id) {
				(0, vue.nextTick)(() => {
					var _root$value$querySele, _root$value;
					const nodes = (_root$value$querySele = (_root$value = root.value) === null || _root$value === void 0 ? void 0 : _root$value.querySelectorAll("[data-tab]")) !== null && _root$value$querySele !== void 0 ? _root$value$querySele : [];
					for (const node of nodes) {
						if (node.dataset.tab !== id) continue;
						node.focus();
						return;
					}
				});
			}
			/** 点面板外面就收回临时展开、顺手收起 Key Tips。 */
			function onPointerDown(event) {
				if (tips.value) tips.value = false;
				if (!state.value.peek) return;
				const el = root.value;
				if (el && event.target instanceof Node && el.contains(event.target)) return;
				apply(ribbonDismiss(state.value));
			}
			/**
			* 文档级键盘处理，两段：
			*   1. Key Tips 展开时，字母直达对应标签，其他键一律收起提示（`Escape` 只收起）；
			*   2. 否则只接 `Escape`，收回"临时展开"并把焦点留在当前标签上。
			*/
			function onDocumentKeydown(event) {
				if (tips.value) {
					if (event.key === "Escape") {
						tips.value = false;
						return;
					}
					if (event.altKey || event.ctrlKey || event.metaKey) {
						tips.value = false;
						return;
					}
					const id = ribbonKeyTip(props.items, event.key);
					if (id === void 0) {
						tips.value = false;
						return;
					}
					event.preventDefault();
					tips.value = false;
					apply(ribbonSelect(state.value, id));
					focusTab(id);
					return;
				}
				if (event.key !== "Escape" || !state.value.peek) return;
				apply(ribbonDismiss(state.value));
				focusTab(state.value.tab);
			}
			/**
			* Windows 上裸 `Alt` 只有 `keyup`（`keydown` 被系统菜单吞掉），
			* 所以提示必须由 keyup 唤起——只听 keydown 的实现在真机上永远不亮。
			*/
			function onDocumentKeyup(event) {
				if (event.key !== "Alt" || event.ctrlKey || event.metaKey || event.shiftKey) return;
				if (!ribbonHasKeyTips(props.items)) return;
				tips.value = true;
			}
			(0, vue.onMounted)(() => {
				document.addEventListener("pointerdown", onPointerDown);
				document.addEventListener("keydown", onDocumentKeydown);
				document.addEventListener("keyup", onDocumentKeyup);
			});
			(0, vue.onUnmounted)(() => {
				document.removeEventListener("pointerdown", onPointerDown);
				document.removeEventListener("keydown", onDocumentKeydown);
				document.removeEventListener("keyup", onDocumentKeyup);
			});
			function onTabbarKeydown(event) {
				const next = selectByKey(props.items.map((item) => item.id), state.value.tab, event.key);
				if (next === state.value.tab) return;
				event.preventDefault();
				apply(ribbonSelect(state.value, next));
				focusTab(next);
			}
			/** 双击选项卡 = 收起/展开功能区。别绑在每个 tab 上：事件冒泡到这里判断一次就够。 */
			function onTabbarDblClick(event) {
				const target = event.target;
				if (!(target instanceof Element) || !target.closest("[data-tab]")) return;
				apply(ribbonToggleCollapsed(state.value));
			}
			return () => {
				var _slots$default;
				const tab = state.value.tab;
				return (0, vue.h)("div", {
					ref: root,
					class: "oj-ribbon",
					"data-collapsed": state.value.collapsed ? "" : void 0,
					"data-keytips": tips.value ? "" : void 0
				}, [(0, vue.h)("div", {
					class: "oj-ribbon__tabbar",
					role: "tablist",
					"aria-label": props.label,
					onKeydown: onTabbarKeydown,
					onDblclick: onTabbarDblClick
				}, [...props.items.map((item) => (0, vue.h)(OjRibbonTab, {
					id: item.id,
					label: item.label,
					selected: item.id === tab,
					keyTip: item.keyTip,
					showKeyTip: tips.value,
					onSelect: () => apply(ribbonSelect(state.value, item.id))
				})), (0, vue.h)("button", {
					type: "button",
					class: "oj-ribbon__collapse",
					"data-open": open.value ? "" : void 0,
					"aria-expanded": open.value ? "true" : "false",
					"aria-label": state.value.collapsed ? props.expandLabel : props.collapseLabel,
					title: state.value.collapsed ? props.expandLabel : props.collapseLabel,
					onClick: () => apply(ribbonToggleCollapsed(state.value))
				}, (0, vue.h)(OjIcon, {
					name: "oj-chevron-down",
					decorative: true
				}))]), (0, vue.h)("div", {
					class: "oj-ribbon__panel",
					role: "tabpanel",
					id: `oj-ribbon-panel-${tab}`,
					"aria-labelledby": `oj-ribbon-tab-${tab}`,
					hidden: !open.value
				}, (_slots$default = slots.default) === null || _slots$default === void 0 ? void 0 : _slots$default.call(slots, { tab }))]);
			};
		}
	});
	//#endregion
	//#region src/table-grid.ts
	/** prd/03 §4：可见网格到 10 行 × 20 列，再大走插入对话框。 */
	var DEFAULT_GRID_LIMITS = {
		rows: 10,
		cols: 20
	};
	function assertLimits(limits) {
		if (!Number.isInteger(limits.rows) || !Number.isInteger(limits.cols) || limits.rows < 1 || limits.cols < 1) throw new Error("表格框选上限必须是正整数");
	}
	function createGridPicker(limits = DEFAULT_GRID_LIMITS) {
		assertLimits(limits);
		let hover = null;
		let exceeded = false;
		function place(cell) {
			if (!Number.isInteger(cell.row) || !Number.isInteger(cell.col)) return;
			if (cell.row < 1 || cell.col < 1) return;
			if (cell.row > limits.rows || cell.col > limits.cols) {
				exceeded = true;
				return;
			}
			exceeded = false;
			hover = {
				row: cell.row,
				col: cell.col
			};
		}
		return {
			limits,
			get hover() {
				return hover;
			},
			get exceeded() {
				return exceeded;
			},
			move: place,
			leave() {},
			key(key) {
				var _hover;
				const current = (_hover = hover) !== null && _hover !== void 0 ? _hover : {
					row: 1,
					col: 1
				};
				if (key === "Escape") return "cancel";
				if (key === "Enter") return hover ? "commit" : "ignore";
				if (key === "Home") {
					place({
						row: current.row,
						col: 1
					});
					return "move";
				}
				if (key === "End") {
					place({
						row: current.row,
						col: limits.cols
					});
					return "move";
				}
				const next = {
					ArrowUp: {
						row: current.row - 1,
						col: current.col
					},
					ArrowDown: {
						row: current.row + 1,
						col: current.col
					},
					ArrowLeft: {
						row: current.row,
						col: current.col - 1
					},
					ArrowRight: {
						row: current.row,
						col: current.col + 1
					}
				}[key];
				if (!next) return "ignore";
				place(hover ? next : {
					row: 1,
					col: 1
				});
				return "move";
			},
			commit: () => hover,
			vars: () => {
				var _hover$row, _hover$col;
				return {
					"--oj-gp-row": String((_hover$row = hover === null || hover === void 0 ? void 0 : hover.row) !== null && _hover$row !== void 0 ? _hover$row : 0),
					"--oj-gp-col": String((_hover$col = hover === null || hover === void 0 ? void 0 : hover.col) !== null && _hover$col !== void 0 ? _hover$col : 0)
				};
			}
		};
	}
	//#endregion
	//#region src/vue/table-grid-picker.ts
	var OjTableGridPicker = (0, vue.defineComponent)({
		name: "OjTableGridPicker",
		props: {
			rows: {
				type: Number,
				default: 10
			},
			cols: {
				type: Number,
				default: 20
			},
			format: {
				type: Function,
				default: void 0
			},
			detailLabel: {
				type: String,
				default: ""
			},
			exceedLabel: {
				type: String,
				default: ""
			}
		},
		emits: ["select", "detail"],
		setup(props, { emit }) {
			const picker = createGridPicker({
				rows: props.rows,
				cols: props.cols
			});
			const tick = (0, vue.ref)(0);
			function touch() {
				tick.value += 1;
			}
			return () => {
				var _props$format, _props$format2;
				tick.value;
				const hover = picker.hover;
				const vars = picker.vars();
				const cells = [];
				for (let row = 1; row <= picker.limits.rows; row += 1) {
					const rowCells = [];
					for (let col = 1; col <= picker.limits.cols; col += 1) {
						const cell = {
							row,
							col
						};
						rowCells.push((0, vue.h)("button", {
							type: "button",
							class: "oj-grid-picker__cell",
							role: "gridcell",
							"aria-selected": (hover === null || hover === void 0 ? void 0 : hover.row) === row && (hover === null || hover === void 0 ? void 0 : hover.col) === col ? "true" : "false",
							tabindex: -1,
							onMouseenter: () => {
								picker.move(cell);
								touch();
							},
							onClick: () => {
								picker.move(cell);
								const chosen = picker.commit();
								if (chosen) emit("select", chosen);
							}
						}));
					}
					cells.push((0, vue.h)("div", { role: "row" }, rowCells));
				}
				const size = hover ? (_props$format = (_props$format2 = props.format) === null || _props$format2 === void 0 ? void 0 : _props$format2.call(props, hover)) !== null && _props$format !== void 0 ? _props$format : `${hover.row} × ${hover.col}` : "";
				return (0, vue.h)("div", {
					class: "oj-grid-picker",
					onMouseleave: () => {
						picker.leave();
						touch();
					}
				}, [
					(0, vue.h)("div", {
						class: "oj-grid-picker__cells",
						role: "grid",
						tabindex: 0,
						"aria-rowcount": picker.limits.rows,
						"aria-colcount": picker.limits.cols,
						style: {
							...vars,
							"--oj-gp-cols": String(picker.limits.cols)
						},
						onKeydown: (event) => {
							const result = picker.key(event.key);
							if (result === "ignore" || result === "cancel") return;
							event.preventDefault();
							touch();
							if (result === "commit") {
								const chosen = picker.commit();
								if (chosen) emit("select", chosen);
							}
						}
					}, [(0, vue.h)("div", {
						class: "oj-grid-picker__overlay",
						"aria-hidden": "true",
						"data-empty": hover ? void 0 : ""
					}), ...cells]),
					size ? (0, vue.h)("p", { class: "oj-grid-picker__size" }, size) : null,
					picker.exceeded && props.exceedLabel ? (0, vue.h)("p", { class: "oj-grid-picker__exceed" }, props.exceedLabel) : null,
					props.detailLabel ? (0, vue.h)("button", {
						type: "button",
						class: "oj-grid-picker__detail",
						onClick: () => emit("detail")
					}, props.detailLabel) : null
				]);
			};
		}
	});
	//#endregion
	//#region src/shell/number-field.ts
	function normalizeStep(step) {
		if (step === void 0 || !Number.isFinite(step) || step <= 0) return 1;
		return step;
	}
	function normalizePrecision(precision) {
		if (precision === void 0 || !Number.isFinite(precision) || precision <= 0) return 0;
		return Math.min(Math.floor(precision), 6);
	}
	/** 按精度取整。用 `Number(x.toFixed(n))` 而不是 `Math.round(x * 10^n) / 10^n`，后者有浮点尾数。 */
	function roundTo(value, precision) {
		const digits = normalizePrecision(precision);
		if (!Number.isFinite(value)) return 0;
		return Number(value.toFixed(digits));
	}
	/**
	* 夹进 `[min, max]`。`min > max`（配置写反）时**以 min 为准**：
	* 宁可显示下限，也不要把 `NaN` 或越界值写回使用方的状态。
	*/
	function clampNumber(value, bounds = {}) {
		const rounded = roundTo(value, bounds.precision);
		const { min, max } = bounds;
		if (min !== void 0 && Number.isFinite(min) && rounded < min) return roundTo(min, bounds.precision);
		if (max !== void 0 && Number.isFinite(max) && rounded > max) return roundTo(max, bounds.precision);
		return rounded;
	}
	/**
	* 步进一次并夹取。
	*
	* 从上限往下减时先减到上限再减 step：值本来就在界外（使用方传了脏数据）时，
	* 用户点一下减号应该**立刻回到合法区间**，而不是在界外一格一格挪。
	*/
	function stepNumber(value, direction, bounds = {}) {
		return clampNumber(roundTo(clampNumber(value, bounds) + direction * normalizeStep(bounds.step), bounds.precision), bounds);
	}
	/**
	* 解析用户输入。返回 `undefined` 表示"不提交，回退到当前值"。
	*
	* 认这些：`12`、` 12 `、`12px`（单位由调用方决定，这里只取数字）、`-3`、`+3`、`1.5`、`1,5`（欧洲键盘）。
	* 不认：空串、`-`、`12abc`、`1e3`（指数写法在字号/行距里没有意义，放进来只会让人误以为支持）。
	*/
	function parseNumberDraft(text) {
		const trimmed = text.trim().replace(",", ".");
		if (trimmed.length === 0) return void 0;
		const match = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:px|pt|%|em|rem|cm|mm|in)?$/i.exec(trimmed);
		if (match === null) return void 0;
		const numeric = match[0].replace(/[a-z%]+$/i, "");
		const value = Number(numeric);
		return Number.isFinite(value) ? value : void 0;
	}
	//#endregion
	//#region src/vue/number-field.ts
	/**
	* `OjNumberField`（03 §3）：无单位/带单位的数值输入。
	*
	* 输入过程**不重渲染**：`draft` 刻意是普通变量而不是 `ref`。绑成 `ref` 后每敲一个字符就会
	* 用 `props.modelValue` 重算 value，光标跳到末尾——这是受控输入最经典的那个坑。
	* 提交时机只有三个：失焦、回车、步进按钮。
	*
	* 步进按钮与方向键都走 `stepNumber`（夹取 + 精度），所以"在 1 上按减号"不会变成 0。
	*/
	var OjNumberField = (0, vue.defineComponent)({
		name: "OjNumberField",
		props: {
			modelValue: {
				type: Number,
				required: true
			},
			min: {
				type: Number,
				default: void 0
			},
			max: {
				type: Number,
				default: void 0
			},
			step: {
				type: Number,
				default: 1
			},
			precision: {
				type: Number,
				default: 0
			},
			/** 输入框的可访问名。按钮另有自己的标签，不共用。 */
			label: {
				type: String,
				required: true
			},
			decreaseLabel: {
				type: String,
				required: true
			},
			increaseLabel: {
				type: String,
				required: true
			},
			suffix: {
				type: String,
				default: ""
			},
			disabled: {
				type: Boolean,
				default: false
			}
		},
		emits: ["update:modelValue"],
		setup(props, { emit }) {
			let draft = null;
			const bounds = () => ({
				min: props.min,
				max: props.max,
				step: props.step,
				precision: props.precision
			});
			const current = () => clampNumber(props.modelValue, bounds());
			const text = () => draft === null ? `${current()}${props.suffix}` : draft;
			function commit() {
				if (draft === null) return;
				const parsed = parseNumberDraft(draft);
				draft = null;
				if (parsed === void 0) return;
				emit("update:modelValue", clampNumber(parsed, bounds()));
			}
			function bump(direction) {
				draft = null;
				const next = stepNumber(props.modelValue, direction, bounds());
				if (next === current()) return;
				emit("update:modelValue", next);
			}
			return () => (0, vue.h)("div", {
				class: "oj-number-field",
				"data-disabled": props.disabled ? "" : void 0
			}, [
				(0, vue.h)("button", {
					type: "button",
					class: "oj-button",
					"data-size": "mini",
					"aria-label": props.decreaseLabel,
					disabled: props.disabled,
					onClick: () => bump(-1)
				}, "−"),
				(0, vue.h)("input", {
					class: "oj-number-field__input",
					type: "text",
					role: "spinbutton",
					inputmode: "decimal",
					"aria-label": props.label,
					"aria-valuenow": current(),
					"aria-valuemin": props.min,
					"aria-valuemax": props.max,
					"aria-disabled": props.disabled ? "true" : void 0,
					disabled: props.disabled,
					value: text(),
					onInput: (event) => {
						draft = event.target.value;
					},
					onBlur: () => commit(),
					onKeydown: (event) => {
						if (event.key === "Enter") {
							event.preventDefault();
							commit();
							return;
						}
						if (event.key === "ArrowUp") {
							event.preventDefault();
							bump(1);
							return;
						}
						if (event.key === "ArrowDown") {
							event.preventDefault();
							bump(-1);
							return;
						}
						if (event.key === "Escape") {
							draft = null;
							event.target.value = text();
						}
					}
				}),
				(0, vue.h)("button", {
					type: "button",
					class: "oj-button",
					"data-size": "mini",
					"aria-label": props.increaseLabel,
					disabled: props.disabled,
					onClick: () => bump(1)
				}, "+")
			]);
		}
	});
	//#endregion
	//#region src/shell/alignment.ts
	var HORIZONTAL_ALIGNS = [
		"left",
		"center",
		"right",
		"justify"
	];
	var VERTICAL_ALIGNS = [
		"top",
		"middle",
		"bottom"
	];
	/** 默认值：左对齐 + 顶端对齐，与 Office 新建文档一致。 */
	var DEFAULT_ALIGNMENT = {
		horizontal: "left",
		vertical: "top"
	};
	function isHorizontal(value) {
		return typeof value === "string" && HORIZONTAL_ALIGNS.includes(value);
	}
	function isVertical(value) {
		return typeof value === "string" && VERTICAL_ALIGNS.includes(value);
	}
	/**
	* 归一化：任一方向不合法就回退到默认值，而不是保留半边。
	* 半边合法会让界面出现"水平高亮在右、垂直一个都没高亮"的状态。
	*/
	function normalizeAlignment(value) {
		if (value === void 0) return DEFAULT_ALIGNMENT;
		return {
			horizontal: isHorizontal(value.horizontal) ? value.horizontal : DEFAULT_ALIGNMENT.horizontal,
			vertical: isVertical(value.vertical) ? value.vertical : DEFAULT_ALIGNMENT.vertical
		};
	}
	/** 在水平方向循环（方向键左右用）。两端不环绕：环绕会让"按到底"变成"回到另一头"。 */
	function stepHorizontal(value, direction) {
		const next = HORIZONTAL_ALIGNS[HORIZONTAL_ALIGNS.indexOf(value) + direction];
		return next !== null && next !== void 0 ? next : value;
	}
	function stepVertical(value, direction) {
		const next = VERTICAL_ALIGNS[VERTICAL_ALIGNS.indexOf(value) + direction];
		return next !== null && next !== void 0 ? next : value;
	}
	/** 预览用的 CSS `text-align`。`justify` 原样透出，浏览器认它。 */
	function textAlignCss(horizontal) {
		return horizontal === "justify" ? "justify" : horizontal;
	}
	/** 预览用的 CSS `vertical-align`：`middle` 在表格单元格里要写成 `middle`，不是 `center`。 */
	function verticalAlignCss(vertical) {
		return vertical === "middle" ? "middle" : vertical;
	}
	//#endregion
	//#region src/vue/alignment-picker.ts
	/**
	* `OjAlignmentPicker`（03 §3 / M2）。
	*
	* 两组按钮而不是一个 3×3 网格：Office 的水平与垂直对齐是两个独立命令，
	* 合成九宫格后"两端对齐 + 垂直居中"就没有位置可点了（9 格只表示"两端对齐除外"的组合）。
	*
	* 图标用内联 SVG 而不是字体图标（00 §4 红线 2）：线条全部 `currentColor`，
	* 颜色跟着按钮状态走，不需要额外维护一套图标字体。
	*/
	var HORIZONTAL_GLYPHS = {
		left: "<svg viewBox=\"0 0 16 16\" fill=\"currentColor\"><rect x=\"2\" y=\"3\" width=\"12\" height=\"1.5\"/><rect x=\"2\" y=\"7.25\" width=\"8\" height=\"1.5\"/><rect x=\"2\" y=\"11.5\" width=\"12\" height=\"1.5\"/></svg>",
		center: "<svg viewBox=\"0 0 16 16\" fill=\"currentColor\"><rect x=\"2\" y=\"3\" width=\"12\" height=\"1.5\"/><rect x=\"4\" y=\"7.25\" width=\"8\" height=\"1.5\"/><rect x=\"2\" y=\"11.5\" width=\"12\" height=\"1.5\"/></svg>",
		right: "<svg viewBox=\"0 0 16 16\" fill=\"currentColor\"><rect x=\"2\" y=\"3\" width=\"12\" height=\"1.5\"/><rect x=\"6\" y=\"7.25\" width=\"8\" height=\"1.5\"/><rect x=\"2\" y=\"11.5\" width=\"12\" height=\"1.5\"/></svg>",
		justify: "<svg viewBox=\"0 0 16 16\" fill=\"currentColor\"><rect x=\"2\" y=\"3\" width=\"12\" height=\"1.5\"/><rect x=\"2\" y=\"7.25\" width=\"12\" height=\"1.5\"/><rect x=\"2\" y=\"11.5\" width=\"12\" height=\"1.5\"/></svg>"
	};
	var VERTICAL_GLYPHS = {
		top: "<svg viewBox=\"0 0 16 16\" fill=\"currentColor\"><rect x=\"2\" y=\"2\" width=\"12\" height=\"1.5\"/><rect x=\"5\" y=\"5\" width=\"6\" height=\"9\"/></svg>",
		middle: "<svg viewBox=\"0 0 16 16\" fill=\"currentColor\"><rect x=\"2\" y=\"7.25\" width=\"12\" height=\"1.5\"/><rect x=\"5\" y=\"4\" width=\"6\" height=\"8\"/></svg>",
		bottom: "<svg viewBox=\"0 0 16 16\" fill=\"currentColor\"><rect x=\"2\" y=\"12.5\" width=\"12\" height=\"1.5\"/><rect x=\"5\" y=\"2\" width=\"6\" height=\"9\"/></svg>"
	};
	var OjAlignmentPicker = (0, vue.defineComponent)({
		name: "OjAlignmentPicker",
		props: {
			modelValue: {
				type: Object,
				default: () => ({})
			},
			label: {
				type: String,
				required: true
			},
			/** 每个按钮的可访问名（语言相关，由使用方给）；缺省时用 id。 */
			itemLabels: {
				type: Object,
				default: () => ({})
			},
			disabled: {
				type: Boolean,
				default: false
			}
		},
		emits: ["update:modelValue"],
		setup(props, { emit }) {
			const value = () => normalizeAlignment(props.modelValue);
			const nameOf = (key) => {
				var _props$itemLabels$key;
				return (_props$itemLabels$key = props.itemLabels[key]) !== null && _props$itemLabels$key !== void 0 ? _props$itemLabels$key : key;
			};
			function apply(next) {
				const current = value();
				if (next.horizontal === current.horizontal && next.vertical === current.vertical) return;
				emit("update:modelValue", next);
			}
			function button(key, glyph, pressed, onClick) {
				return (0, vue.h)("button", {
					key,
					type: "button",
					class: "oj-alignment__button",
					"aria-label": nameOf(key),
					"aria-pressed": pressed ? "true" : "false",
					"data-active": pressed ? "" : void 0,
					disabled: props.disabled,
					onClick
				}, (0, vue.h)("span", {
					class: "oj-alignment__glyph",
					"aria-hidden": "true",
					innerHTML: glyph
				}));
			}
			return () => {
				const current = value();
				return (0, vue.h)("div", {
					class: "oj-alignment",
					role: "group",
					"aria-label": props.label,
					onKeydown: (event) => {
						const now = value();
						if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
							event.preventDefault();
							apply({
								horizontal: stepHorizontal(now.horizontal, event.key === "ArrowRight" ? 1 : -1),
								vertical: now.vertical
							});
						}
						if (event.key === "ArrowUp" || event.key === "ArrowDown") {
							event.preventDefault();
							apply({
								horizontal: now.horizontal,
								vertical: stepVertical(now.vertical, event.key === "ArrowDown" ? 1 : -1)
							});
						}
					}
				}, [(0, vue.h)("div", {
					class: "oj-alignment__row",
					role: "group",
					"aria-label": nameOf("horizontal")
				}, [...HORIZONTAL_ALIGNS.map((align) => button(align, HORIZONTAL_GLYPHS[align], current.horizontal === align, () => apply({
					horizontal: align,
					vertical: current.vertical
				}))), (0, vue.h)("span", {
					class: "oj-alignment__preview",
					"aria-hidden": "true",
					style: { textAlign: textAlignCss(current.horizontal) }
				}, "Abc")]), (0, vue.h)("div", {
					class: "oj-alignment__row",
					role: "group",
					"aria-label": nameOf("vertical")
				}, [...VERTICAL_ALIGNS.map((align) => button(align, VERTICAL_GLYPHS[align], current.vertical === align, () => apply({
					horizontal: current.horizontal,
					vertical: align
				}))), (0, vue.h)("span", {
					class: "oj-alignment__preview oj-alignment__preview--vertical",
					"aria-hidden": "true",
					style: { verticalAlign: verticalAlignCss(current.vertical) }
				}, "Abc")])]);
			};
		}
	});
	//#endregion
	//#region src/shell/color.ts
	/**
	* 默认色板：品牌十阶 + 一组中性色。
	*
	* 只取 3~9 阶：1/2 阶在白底上几乎看不见，10 阶是深色文字色，
	* 做"填充色"都会让用户以为没生效。
	*/
	var COLOR_SWATCH_GROUPS = [{
		id: "brand",
		values: [
			"var(--oj-brand-3)",
			"var(--oj-brand-4)",
			"var(--oj-brand-5)",
			"var(--oj-brand-6)",
			"var(--oj-brand-7)",
			"var(--oj-brand-8)",
			"var(--oj-brand-9)"
		]
	}, {
		id: "neutral",
		values: [
			"#000000",
			"#404040",
			"#808080",
			"#bfbfbf",
			"#e5e6eb",
			"#ffffff",
			"transparent"
		]
	}];
	var HEX = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;
	/**
	* 归一化十六进制颜色。返回 `#rrggbb`（小写）或 `undefined`。
	* 带 alpha 的 8 位写法（`#rrggbbaa`）刻意不收：文档格式里 alpha 是独立属性，
	* 混进颜色值会让"透明度"出现两种来源。
	*/
	function normalizeHex(input) {
		const match = HEX.exec(input.trim());
		if (match === null) return void 0;
		const body = match[1].toLowerCase();
		if (body.length === 3) return `#${body[0]}${body[0]}${body[1]}${body[1]}${body[2]}${body[2]}`;
		return `#${body}`;
	}
	/** 是否是一个组件能渲染的颜色值：token 引用、十六进制、`transparent`、`rgb()/hsl()`。 */
	function isCssColor(value) {
		const trimmed = value.trim();
		if (trimmed.length === 0) return false;
		if (trimmed === "transparent" || trimmed === "currentColor") return true;
		if (normalizeHex(trimmed) !== void 0) return true;
		if (/^var\(--oj-[a-z0-9-]+\)$/.test(trimmed)) return true;
		return /^(?:rgb|hsl)a?\([^()]*\)$/.test(trimmed);
	}
	//#endregion
	//#region src/shell/border.ts
	/**
	* 边框模型（03 §3 / M2 `OjBorderPicker`）。
	*
	* 三个维度（线型 / 线宽 / 颜色）必须一起归一，否则会出现"选了无边框，但颜色还高亮着"的界面：
	* `none` 时宽度与颜色在语义上不存在，归一化后要显式表达这一点（`width: 0`）。
	*
	* 线宽是 **px 数值**而不是枚举字符串：文档格式存的是数值，组件只是提供几个常用档位。
	*/
	var BORDER_STYLES = [
		"none",
		"solid",
		"dashed",
		"dotted",
		"double"
	];
	/** Word 的常用线宽档（pt 换算后的近似值），含 0.5 这种细线。 */
	var BORDER_WIDTHS = [
		.5,
		.75,
		1,
		1.5,
		2,
		3
	];
	var BORDER_COLORS = [
		"var(--oj-text-1)",
		"var(--oj-text-3)",
		"var(--oj-border-3)",
		"var(--oj-brand-6)",
		"var(--oj-text-danger)"
	];
	var DEFAULT_BORDER = {
		style: "solid",
		width: 1,
		color: "var(--oj-text-1)"
	};
	var BORDER_WIDTH_RANGE = {
		min: 0,
		max: 12
	};
	function isStyle(value) {
		return typeof value === "string" && BORDER_STYLES.includes(value);
	}
	/**
	* 归一化三个维度。
	*
	* 规则：
	*   - `style: 'none'` 时宽度归 0（语义上"没有线"，留着 1px 会让下游导出工具画出细线）；
	*   - 宽度夹进 `[0, 12]` 并保留两位小数（0.75 这类值是合法档位）；
	*   - 颜色不合法就回退默认色，而不是保留一个渲染不出来的字符串。
	*/
	function normalizeBorder(value) {
		const style = isStyle(value === null || value === void 0 ? void 0 : value.style) ? value.style : DEFAULT_BORDER.style;
		const rawWidth = typeof (value === null || value === void 0 ? void 0 : value.width) === "number" && Number.isFinite(value.width) ? value.width : DEFAULT_BORDER.width;
		const clamped = Math.min(Math.max(rawWidth, BORDER_WIDTH_RANGE.min), BORDER_WIDTH_RANGE.max);
		const color = typeof (value === null || value === void 0 ? void 0 : value.color) === "string" && isCssColor(value.color) ? value.color : DEFAULT_BORDER.color;
		if (style === "none") return {
			style,
			width: 0,
			color
		};
		return {
			style,
			width: Number(clamped.toFixed(2)),
			color
		};
	}
	/**
	* 生成 CSS 值，供预览块与"应用到选区"两条路共用（两套字符串迟早会不一致）。
	* 入参收 `Partial`：预览时经常只想换一个维度（`{ ...current, style: 'none' }`），
	* 内部统一走 `normalizeBorder`，调用方不必先自己补齐三个字段。
	*/
	function borderCss(value) {
		const normalized = normalizeBorder(value);
		if (normalized.style === "none") return "none";
		return `${normalized.width}px ${normalized.style} ${normalized.color}`;
	}
	/** 线宽档位文案：`1` 而不是 `1.00`。 */
	function formatBorderWidth(width) {
		return String(Number(width.toFixed(2)));
	}
	//#endregion
	//#region src/vue/border-picker.ts
	/**
	* `OjBorderPicker`（03 §3 / M2）：线型 + 线宽 + 颜色。
	*
	* 三个维度写在同一张卡片里、一次 `change` 出去，而不是三次独立的 `update:*`：
	* 选线型时宽度会从 1 变成 0（`none` 的语义），如果拆成三个事件，
	* 使用方会收到"线型变了但宽度还是 1"的中间态，写进文档后就是一条看不见的 1px 线。
	*
	* 预览块直接用 `borderCss()` 生成：与"应用到选区"走同一个函数，
	* 两套字符串拼法迟早会不一致（预览是虚线、文档里是实线）。
	*/
	var OjBorderPicker = (0, vue.defineComponent)({
		name: "OjBorderPicker",
		props: {
			modelValue: {
				type: Object,
				default: () => ({})
			},
			label: {
				type: String,
				required: true
			},
			widthLabel: {
				type: String,
				required: true
			},
			colorLabel: {
				type: String,
				required: true
			},
			/** 线型显示名（语言相关）。 */
			styleLabels: {
				type: Object,
				default: () => ({})
			},
			disabled: {
				type: Boolean,
				default: false
			}
		},
		emits: ["update:modelValue"],
		setup(props, { emit }) {
			const value = () => normalizeBorder(props.modelValue);
			const styleName = (style) => {
				var _props$styleLabels$st;
				return (_props$styleLabels$st = props.styleLabels[style]) !== null && _props$styleLabels$st !== void 0 ? _props$styleLabels$st : style;
			};
			function apply(patch) {
				const current = value();
				const next = normalizeBorder({
					...current,
					...patch
				});
				if (next.style === current.style && next.width === current.width && next.color === current.color) return;
				emit("update:modelValue", next);
			}
			return () => {
				const current = value();
				return (0, vue.h)("div", {
					class: "oj-border-picker",
					role: "group",
					"aria-label": props.label
				}, [
					(0, vue.h)("div", {
						class: "oj-border-picker__styles",
						role: "group",
						"aria-label": props.label
					}, BORDER_STYLES.map((style) => (0, vue.h)("button", {
						key: style,
						type: "button",
						class: "oj-border-picker__style",
						"aria-label": styleName(style),
						"aria-pressed": current.style === style ? "true" : "false",
						"data-active": current.style === style ? "" : void 0,
						disabled: props.disabled,
						onClick: () => apply({ style })
					}, (0, vue.h)("span", {
						class: "oj-border-picker__sample",
						"aria-hidden": "true",
						style: { borderBottom: borderCss({
							...current,
							style
						}) }
					})))),
					(0, vue.h)("label", { class: "oj-border-picker__field" }, [(0, vue.h)("span", { class: "oj-border-picker__field-label" }, props.widthLabel), (0, vue.h)("select", {
						class: "oj-border-picker__width",
						"aria-label": props.widthLabel,
						disabled: props.disabled,
						value: String(current.width),
						onChange: (event) => apply({ width: Number(event.target.value) })
					}, BORDER_WIDTHS.map((width) => (0, vue.h)("option", {
						value: String(width),
						selected: width === current.width
					}, formatBorderWidth(width))))]),
					(0, vue.h)("div", {
						class: "oj-border-picker__colors",
						role: "group",
						"aria-label": props.colorLabel
					}, BORDER_COLORS.map((color) => (0, vue.h)("button", {
						key: color,
						type: "button",
						class: "oj-border-picker__color",
						"aria-label": color,
						"aria-pressed": current.color === color ? "true" : "false",
						"data-active": current.color === color ? "" : void 0,
						style: { background: color },
						disabled: props.disabled,
						onClick: () => apply({ color })
					}))),
					(0, vue.h)("span", {
						class: "oj-border-picker__preview",
						"aria-hidden": "true",
						style: { border: borderCss(current) }
					})
				]);
			};
		}
	});
	//#endregion
	//#region src/vue/gallery.ts
	/**
	* `OjGallery`（03 §3 / M2）：通用网格选择。
	*
	* 与 `OjRibbonGallery` 的分工：那个是 Ribbon 里的**溢出条目**（一行放不下就滚动），
	* 这个是**独立面板里的网格**（列数固定、方向键按行列走）。两者共用 `galleryNeighbor`，
	* 因为"上下键跳一整行"的边界算法只该有一份。
	*
	* 选中项用 `aria-selected`；网格外壳是 `role="listbox"`，每项 `role="option"`。
	*/
	var OjGallery = (0, vue.defineComponent)({
		name: "OjGallery",
		props: {
			items: {
				type: Array,
				required: true
			},
			modelValue: {
				type: String,
				required: true
			},
			label: {
				type: String,
				required: true
			},
			columns: {
				type: Number,
				default: 4
			},
			disabled: {
				type: Boolean,
				default: false
			}
		},
		emits: ["update:modelValue"],
		setup(props, { emit }) {
			const columns = () => Number.isFinite(props.columns) && props.columns >= 1 ? Math.floor(props.columns) : 1;
			return () => (0, vue.h)("div", {
				class: "oj-gallery",
				role: "listbox",
				"aria-label": props.label,
				"data-disabled": props.disabled ? "" : void 0,
				style: { gridTemplateColumns: `repeat(${columns()}, minmax(0, 1fr))` },
				onKeydown: (event) => {
					const index = props.items.findIndex((item) => item.id === props.modelValue);
					if (index === -1) return;
					const next = galleryNeighbor(columns(), props.items.length, index, event.key);
					if (next === index) return;
					event.preventDefault();
					const item = props.items[next];
					if (item !== void 0) emit("update:modelValue", item.id);
				}
			}, props.items.map((item) => (0, vue.h)("button", {
				key: item.id,
				type: "button",
				class: "oj-gallery__item",
				role: "option",
				"aria-selected": item.id === props.modelValue ? "true" : "false",
				"data-active": item.id === props.modelValue ? "" : void 0,
				disabled: props.disabled,
				onClick: () => {
					if (item.id === props.modelValue) return;
					emit("update:modelValue", item.id);
				}
			}, [(0, vue.h)("span", { class: "oj-gallery__label" }, item.label), item.description === void 0 ? null : (0, vue.h)("span", { class: "oj-gallery__description" }, item.description)])));
		}
	});
	//#endregion
	//#region src/shell/style-gallery.ts
	var STYLE_PRESETS = [
		{
			id: "title-1",
			fontSize: 32,
			bold: true
		},
		{
			id: "title-2",
			fontSize: 24,
			bold: true
		},
		{
			id: "title-3",
			fontSize: 20,
			bold: true
		},
		{
			id: "body",
			fontSize: 14
		},
		{
			id: "quote",
			fontSize: 14,
			italic: true,
			family: "doc"
		},
		{
			id: "code",
			fontSize: 14,
			family: "mono"
		}
	];
	/** 预览与"应用样式"共用的一份内联样式，避免两处各写一套。 */
	function stylePresetCss(preset) {
		var _preset$family;
		const css = { fontSize: `${preset.fontSize}px` };
		if (preset.bold === true) css.fontWeight = "600";
		if (preset.italic === true) css.fontStyle = "italic";
		css.fontFamily = `var(--oj-font-${(_preset$family = preset.family) !== null && _preset$family !== void 0 ? _preset$family : "sans"})`;
		return css;
	}
	/**
	* 显示名缺省时回退到 id。
	* 不在这里编中文名：`title-1` 在日文界面应该是"見出し1"，写死中文就永远翻不掉。
	*/
	function styleLabel(labels, id) {
		var _labels$id;
		return (_labels$id = labels === null || labels === void 0 ? void 0 : labels[id]) !== null && _labels$id !== void 0 ? _labels$id : id;
	}
	//#endregion
	//#region src/vue/style-gallery.ts
	/**
	* `OjStyleGallery`（03 §3 / M2）：段落样式画廊。
	*
	* 每一项都用**预设自己的排版**渲染示例文本：只显示"标题 1/2/3"等于让用户背编号，
	* 而样式画廊的价值恰恰是"一眼看出层级"。
	*
	* 示例文本由 `sample` 给（语言相关：日文界面应该看到かな，而不是 "Aa"）。
	*/
	var OjStyleGallery = (0, vue.defineComponent)({
		name: "OjStyleGallery",
		props: {
			modelValue: {
				type: String,
				required: true
			},
			presets: {
				type: Array,
				default: () => STYLE_PRESETS
			},
			label: {
				type: String,
				required: true
			},
			labels: {
				type: Object,
				default: () => ({})
			},
			sample: {
				type: String,
				default: "Aa"
			},
			columns: {
				type: Number,
				default: 3
			},
			disabled: {
				type: Boolean,
				default: false
			}
		},
		emits: ["update:modelValue"],
		setup(props, { emit }) {
			const columns = () => Number.isFinite(props.columns) && props.columns >= 1 ? Math.floor(props.columns) : 1;
			return () => (0, vue.h)("div", {
				class: "oj-style-gallery",
				role: "listbox",
				"aria-label": props.label,
				"data-disabled": props.disabled ? "" : void 0,
				style: { gridTemplateColumns: `repeat(${columns()}, minmax(0, 1fr))` },
				onKeydown: (event) => {
					const index = props.presets.findIndex((preset) => preset.id === props.modelValue);
					if (index === -1) return;
					const next = galleryNeighbor(columns(), props.presets.length, index, event.key);
					if (next === index) return;
					event.preventDefault();
					const preset = props.presets[next];
					if (preset !== void 0) emit("update:modelValue", preset.id);
				}
			}, props.presets.map((preset) => (0, vue.h)("button", {
				key: preset.id,
				type: "button",
				class: "oj-style-gallery__item",
				role: "option",
				"aria-selected": preset.id === props.modelValue ? "true" : "false",
				"data-active": preset.id === props.modelValue ? "" : void 0,
				disabled: props.disabled,
				onClick: () => {
					if (preset.id === props.modelValue) return;
					emit("update:modelValue", preset.id);
				}
			}, [(0, vue.h)("span", {
				class: "oj-style-gallery__sample",
				"aria-hidden": "true",
				style: stylePresetCss(preset)
			}, props.sample), (0, vue.h)("span", { class: "oj-style-gallery__label" }, styleLabel(props.labels, preset.id))])));
		}
	});
	//#endregion
	//#region src/vue/color-picker.ts
	/**
	* `OjColorPicker`（03 §3 / M2）。
	*
	* 两个刻意的取舍：
	*   1. 色板样本是 **token 引用**（`var(--oj-brand-6)`），不是十六进制——选完写进文档的是
	*      token，暗色档位与主题切换才会跟着变；
	*   2. 自定义色**只在提交时归一**（`#abc` → `#aabbcc`），输入过程中不重写输入框，
	*      否则用户打到第三个字符就被"补全"掉了。
	*
	* a11y：整体是 `listbox`，每块色是 `option`；色块本身没有文字，所以必须有 `swatchLabel`
	* 提供可访问名（默认回退到颜色值本身，读屏会念 `#3366FF`——不优雅但可辨认）。
	*/
	var OjColorPicker = (0, vue.defineComponent)({
		name: "OjColorPicker",
		props: {
			modelValue: {
				type: String,
				required: true
			},
			groups: {
				type: Array,
				default: () => COLOR_SWATCH_GROUPS
			},
			label: {
				type: String,
				required: true
			},
			/** 自定义色的输入框标签；不给就不渲染自定义栏。 */
			customLabel: {
				type: String,
				default: ""
			},
			swatchLabel: {
				type: Function,
				default: void 0
			},
			disabled: {
				type: Boolean,
				default: false
			}
		},
		emits: ["update:modelValue"],
		setup(props, { emit }) {
			let draft = null;
			const nameOf = (value) => {
				var _props$swatchLabel, _props$swatchLabel2;
				return (_props$swatchLabel = (_props$swatchLabel2 = props.swatchLabel) === null || _props$swatchLabel2 === void 0 ? void 0 : _props$swatchLabel2.call(props, value)) !== null && _props$swatchLabel !== void 0 ? _props$swatchLabel : value;
			};
			function commitCustom() {
				if (draft === null) return;
				const raw = draft;
				draft = null;
				const hex = normalizeHex(raw);
				if (hex !== void 0) {
					emit("update:modelValue", hex);
					return;
				}
				if (isCssColor(raw)) emit("update:modelValue", raw.trim());
			}
			return () => {
				var _draft;
				return (0, vue.h)("div", {
					class: "oj-color-picker",
					role: "listbox",
					"aria-label": props.label
				}, [...props.groups.flatMap((group) => [(0, vue.h)("div", {
					class: "oj-color-picker__group",
					role: "group",
					"aria-label": group.id
				}, group.values.map((value) => (0, vue.h)("button", {
					type: "button",
					class: "oj-color-picker__swatch",
					role: "option",
					"aria-label": nameOf(value),
					"aria-selected": value === props.modelValue ? "true" : "false",
					"data-active": value === props.modelValue ? "" : void 0,
					"data-transparent": value === "transparent" ? "" : void 0,
					style: { background: value },
					disabled: props.disabled,
					onClick: () => {
						if (value === props.modelValue) return;
						emit("update:modelValue", value);
					}
				})))]), props.customLabel ? (0, vue.h)("div", { class: "oj-color-picker__custom" }, [(0, vue.h)("span", { class: "oj-color-picker__custom-label" }, props.customLabel), (0, vue.h)("input", {
					class: "oj-color-picker__hex",
					type: "text",
					"aria-label": props.customLabel,
					value: (_draft = draft) !== null && _draft !== void 0 ? _draft : props.modelValue,
					disabled: props.disabled,
					onInput: (event) => {
						draft = event.target.value;
					},
					onBlur: () => commitCustom(),
					onKeydown: (event) => {
						if (event.key !== "Enter") return;
						event.preventDefault();
						commitCustom();
					}
				})]) : null]);
			};
		}
	});
	//#endregion
	//#region src/shell/fonts.ts
	var FONT_OPTIONS = [
		{
			id: "sans",
			label: "Sans",
			stack: "var(--oj-font-sans)"
		},
		{
			id: "mono",
			label: "Mono",
			stack: "var(--oj-font-mono)"
		},
		{
			id: "mono-cjk",
			label: "Mono CJK",
			stack: "var(--oj-font-mono-cjk)"
		},
		{
			id: "doc",
			label: "Serif",
			stack: "var(--oj-font-doc)"
		}
	];
	/** 按 id 或显示名做子串过滤（忽略大小写与首尾空白）。空查询返回全部。 */
	function filterFonts(fonts, query) {
		const needle = query.trim().toLowerCase();
		if (needle.length === 0) return [...fonts];
		return fonts.filter((font) => font.id.toLowerCase().includes(needle) || font.label.toLowerCase().includes(needle));
	}
	/** 键盘上下移动：到两端就停住，不环绕（环绕会让用户在列表底部误以为是顶部）。 */
	function stepFont(fonts, id, direction) {
		var _next$id;
		if (fonts.length === 0) return id;
		const index = fonts.findIndex((font) => font.id === id);
		if (index === -1) return fonts[0].id;
		const next = fonts[index + direction];
		return (_next$id = next === null || next === void 0 ? void 0 : next.id) !== null && _next$id !== void 0 ? _next$id : id;
	}
	//#endregion
	//#region src/vue/font-picker.ts
	/**
	* `OjFontPicker`（03 §3 / M2）：字体列表 + 过滤 + 键盘。
	*
	* 每项用**自己的字体栈**渲染预览：字体选择器只显示名字等于让用户猜，
	* 尤其 `Serif` / `Sans` 这种词在中英混排下完全看不出差别。
	*
	* 过滤是纯子串匹配而不是模糊打分：字体列表通常只有几十项，
	* 打分排序会让"输入 sans 却排在第一的是 Doc Sans Mono"这类意外排到用户脸上。
	*/
	var OjFontPicker = (0, vue.defineComponent)({
		name: "OjFontPicker",
		props: {
			modelValue: {
				type: String,
				required: true
			},
			fonts: {
				type: Array,
				default: () => FONT_OPTIONS
			},
			label: {
				type: String,
				required: true
			},
			/** 搜索框的占位文案（语言相关，由使用方给）。 */
			placeholder: {
				type: String,
				default: ""
			},
			previewText: {
				type: String,
				default: "Aa 字"
			},
			disabled: {
				type: Boolean,
				default: false
			}
		},
		emits: ["update:modelValue"],
		setup(props, { emit }) {
			const query = (0, vue.ref)("");
			function move(key) {
				const direction = key === "ArrowDown" ? 1 : key === "ArrowUp" ? -1 : 0;
				if (direction === 0) return;
				const next = stepFont(props.fonts, props.modelValue, direction);
				if (next === props.modelValue) return;
				emit("update:modelValue", next);
			}
			return () => {
				const visible = filterFonts(props.fonts, query.value);
				return (0, vue.h)("div", {
					class: "oj-font-picker",
					role: "listbox",
					"aria-label": props.label,
					"data-disabled": props.disabled ? "" : void 0,
					onKeydown: (event) => {
						if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
						event.preventDefault();
						move(event.key);
					}
				}, [(0, vue.h)("input", {
					class: "oj-font-picker__search",
					type: "search",
					"aria-label": props.label,
					placeholder: props.placeholder,
					disabled: props.disabled,
					onInput: (event) => {
						query.value = event.target.value;
					}
				}), (0, vue.h)("ul", {
					class: "oj-font-picker__list",
					role: "presentation"
				}, visible.map((font) => (0, vue.h)("li", {
					key: font.id,
					role: "presentation"
				}, (0, vue.h)("button", {
					type: "button",
					class: "oj-font-picker__option",
					role: "option",
					"aria-selected": font.id === props.modelValue ? "true" : "false",
					"data-active": font.id === props.modelValue ? "" : void 0,
					style: { fontFamily: font.stack },
					disabled: props.disabled,
					onClick: () => emit("update:modelValue", font.id)
				}, [(0, vue.h)("span", { class: "oj-font-picker__name" }, font.label), (0, vue.h)("span", { class: "oj-font-picker__preview" }, props.previewText)]))))]);
			};
		}
	});
	//#endregion
	//#region src/shell/symbols.ts
	var SYMBOL_GROUPS = [
		{
			id: "common",
			symbols: [
				{
					char: "©",
					name: "copyright"
				},
				{
					char: "®",
					name: "registered"
				},
				{
					char: "™",
					name: "trademark"
				},
				{
					char: "§",
					name: "section"
				},
				{
					char: "¶",
					name: "paragraph"
				},
				{
					char: "°",
					name: "degree"
				},
				{
					char: "‰",
					name: "per mille"
				},
				{
					char: "№",
					name: "numero"
				}
			]
		},
		{
			id: "math",
			symbols: [
				{
					char: "±",
					name: "plus minus"
				},
				{
					char: "×",
					name: "multiply"
				},
				{
					char: "÷",
					name: "divide"
				},
				{
					char: "≠",
					name: "not equal"
				},
				{
					char: "≤",
					name: "less or equal"
				},
				{
					char: "≥",
					name: "greater or equal"
				},
				{
					char: "∞",
					name: "infinity"
				},
				{
					char: "∑",
					name: "sum"
				},
				{
					char: "√",
					name: "square root"
				},
				{
					char: "π",
					name: "pi"
				},
				{
					char: "≈",
					name: "almost equal"
				},
				{
					char: "µ",
					name: "micro"
				}
			]
		},
		{
			id: "arrow",
			symbols: [
				{
					char: "←",
					name: "left arrow"
				},
				{
					char: "→",
					name: "right arrow"
				},
				{
					char: "↑",
					name: "up arrow"
				},
				{
					char: "↓",
					name: "down arrow"
				},
				{
					char: "↔",
					name: "left right arrow"
				},
				{
					char: "⇄",
					name: "swap arrows"
				},
				{
					char: "⇧",
					name: "shift arrow"
				},
				{
					char: "⇒",
					name: "double right arrow"
				}
			]
		},
		{
			id: "currency",
			symbols: [
				{
					char: "$",
					name: "dollar"
				},
				{
					char: "€",
					name: "euro"
				},
				{
					char: "£",
					name: "pound"
				},
				{
					char: "¥",
					name: "yen"
				},
				{
					char: "₩",
					name: "won"
				},
				{
					char: "₹",
					name: "rupee"
				},
				{
					char: "¢",
					name: "cent"
				}
			]
		},
		{
			id: "punctuation",
			symbols: [
				{
					char: "—",
					name: "em dash"
				},
				{
					char: "–",
					name: "en dash"
				},
				{
					char: "…",
					name: "ellipsis"
				},
				{
					char: "·",
					name: "middle dot"
				},
				{
					char: "“",
					name: "left double quote"
				},
				{
					char: "”",
					name: "right double quote"
				},
				{
					char: "‘",
					name: "left single quote"
				},
				{
					char: "’",
					name: "right single quote"
				}
			]
		}
	];
	/**
	* 按名字过滤。空查询返回原表（保持分组结构，调用方据此渲染标题）。
	* 同时接受直接输入字符：用户已经知道要插哪个符号时，比记名字快。
	*/
	function filterSymbols(groups, query) {
		const needle = query.trim().toLowerCase();
		if (needle.length === 0) return [...groups];
		return groups.map((group) => ({
			id: group.id,
			symbols: group.symbols.filter((symbol) => symbol.char === needle || symbol.name.toLowerCase().includes(needle))
		})).filter((group) => group.symbols.length > 0);
	}
	/** 摊平成一维（键盘导航按下标走，分组只是视觉）。 */
	function flattenSymbols(groups) {
		return groups.flatMap((group) => [...group.symbols]);
	}
	//#endregion
	//#region src/vue/symbol-picker.ts
	/**
	* `OjSymbolPicker`（03 §3 / M2）：插入 Unicode 符号。
	*
	* 与其它 picker 的区别：它**没有 modelValue**。选符号是"插入动作"（`select`），
	* 不是"选一个持久状态"——把插入做成受控值，会让连续插两个符号时第二个把第一个覆盖掉。
	*
	* 分组标题由使用方给（`groupLabels`）：组件库里写死中文标题，日文界面就永远翻不掉。
	*/
	var OjSymbolPicker = (0, vue.defineComponent)({
		name: "OjSymbolPicker",
		props: {
			groups: {
				type: Array,
				default: () => SYMBOL_GROUPS
			},
			label: {
				type: String,
				required: true
			},
			/** 搜索框占位文案（语言相关）。 */
			placeholder: {
				type: String,
				default: ""
			},
			/** 分组 id → 显示名；缺省不渲染标题。 */
			groupLabels: {
				type: Object,
				default: () => ({})
			},
			/** 网格列数，键盘左右移动按它算。 */
			columns: {
				type: Number,
				default: 8
			}
		},
		emits: ["select"],
		setup(props, { emit }) {
			const query = (0, vue.ref)("");
			const active = (0, vue.ref)(0);
			const columns = () => Number.isFinite(props.columns) && props.columns >= 1 ? Math.floor(props.columns) : 1;
			return () => {
				const visible = filterSymbols(props.groups, query.value);
				const flat = flattenSymbols(visible);
				const current = Math.min(Math.max(active.value, 0), Math.max(flat.length - 1, 0));
				return (0, vue.h)("div", {
					class: "oj-symbol-picker",
					role: "listbox",
					"aria-label": props.label,
					onKeydown: (event) => {
						if (event.key === "Enter") {
							const symbol = flat[current];
							if (symbol === void 0) return;
							event.preventDefault();
							emit("select", symbol.char);
							return;
						}
						const next = galleryNeighbor(columns(), flat.length, current, event.key);
						if (next === current) return;
						event.preventDefault();
						active.value = next;
					}
				}, [(0, vue.h)("input", {
					class: "oj-symbol-picker__search",
					type: "search",
					"aria-label": props.label,
					placeholder: props.placeholder,
					onInput: (event) => {
						query.value = event.target.value;
						active.value = 0;
					}
				}), ...visible.map((group) => {
					var _props$groupLabels$gr;
					return (0, vue.h)("div", {
						class: "oj-symbol-picker__group",
						role: "group",
						"aria-label": (_props$groupLabels$gr = props.groupLabels[group.id]) !== null && _props$groupLabels$gr !== void 0 ? _props$groupLabels$gr : group.id
					}, [props.groupLabels[group.id] !== void 0 ? (0, vue.h)("p", { class: "oj-symbol-picker__group-label" }, props.groupLabels[group.id]) : null, (0, vue.h)("div", {
						class: "oj-symbol-picker__grid",
						style: { gridTemplateColumns: `repeat(${columns()}, 24px)` }
					}, group.symbols.map((symbol) => {
						const index = flat.indexOf(symbol);
						return (0, vue.h)("button", {
							key: `${group.id}-${symbol.char}`,
							type: "button",
							class: "oj-symbol-picker__cell",
							role: "option",
							"aria-label": symbol.name,
							"aria-selected": index === current ? "true" : "false",
							"data-active": index === current ? "" : void 0,
							onClick: () => {
								active.value = index;
								emit("select", symbol.char);
							}
						}, symbol.char);
					}))]);
				})]);
			};
		}
	});
	//#endregion
	//#region src/shell/presets.ts
	/**
	* 档位表与"最近档位"（03 §3 `OjFontSizeField` / `OjLineSpacingPicker`）。
	*
	* 字号档位**必须与 token 一致**：`--oj-fs-12`~`--oj-fs-32` 那八档就是设计给的可用值，
	* 组件里再自造一套（比如加上 15px）会让"用户选的 15px"在 `ja` 档位下没有对应 token，
	* 于是又变成一次写死。这里把档位写成常量，并由用例与 token 表对账。
	*
	* 行距用**倍数**而不是 px：Word/WPS 的行距单位是"多倍行距"，存 px 会随字号变化而失真。
	*/
	/** 与 `packages/tokens` 的 `fs.*` 一一对应（顺序即下拉里的顺序）。 */
	var FONT_SIZE_PRESETS = [
		12,
		13,
		14,
		16,
		18,
		20,
		24,
		32
	];
	/** Word 的常用档位：单倍、1.15、1.5、双倍。 */
	var LINE_SPACING_PRESETS = [
		1,
		1.15,
		1.5,
		2
	];
	/** 字号上下限：低于 1px 或高于 999px 的输入是误操作，不是需求。 */
	var FONT_SIZE_RANGE = {
		min: 1,
		max: 999
	};
	/** 行距上下限：0 会让行叠在一起，10 倍以上没有排版意义。 */
	var LINE_SPACING_RANGE = {
		min: .5,
		max: 10
	};
	/** 离 `value` 最近的档位。空表返回 `value` 本身（调用方没给档位就不该被改值）。 */
	function nearestPreset(presets, value) {
		if (presets.length === 0 || !Number.isFinite(value)) return value;
		let best = presets[0];
		let bestGap = Math.abs(best - value);
		for (const preset of presets) {
			const gap = Math.abs(preset - value);
			if (gap < bestGap) {
				best = preset;
				bestGap = gap;
			}
		}
		return best;
	}
	/**
	* 在档位表里前进/后退一档。
	*
	* 当前值不在表里时（用户手输过 17px），先落到**最近的档位**再走一步：
	* 直接 `indexOf` 得到 -1 会让"下箭头"跳到第一档，用户会觉得方向反了。
	*/
	function stepPreset(presets, value, direction) {
		var _sorted$index;
		if (presets.length === 0) return value;
		const sorted = [...presets].sort((a, b) => a - b);
		const exact = sorted.indexOf(value);
		if (exact !== -1) {
			const next = sorted[exact + direction];
			return next !== null && next !== void 0 ? next : value;
		}
		const nearest = nearestPreset(sorted, value);
		if (nearest === value) return value;
		const nearestIndex = sorted.indexOf(nearest);
		return (_sorted$index = sorted[(direction === 1 ? nearest < value : nearest > value) ? nearestIndex + direction : nearestIndex]) !== null && _sorted$index !== void 0 ? _sorted$index : nearest;
	}
	/** 行距显示成 `1.5` / `1` / `1.15`：去掉无意义的尾零，但不把 1.50 显示成 1.5 以外的东西。 */
	function formatLineSpacing(value) {
		if (!Number.isFinite(value)) return "1";
		const rounded = Number(value.toFixed(2));
		return String(rounded);
	}
	/** 字号显示成 `14`（单位由使用方在其后补，语言不同单位写法也不同）。 */
	function formatFontSize(value) {
		if (!Number.isFinite(value)) return "";
		return String(Number(value.toFixed(1)));
	}
	//#endregion
	//#region src/vue/font-size-field.ts
	/**
	* `OjFontSizeField`（03 §3 / M2）：字号输入 + 档位选择。
	*
	* 三件事必须同时成立，否则在实际使用里会互相打架：
	*   1. **可以手输**：Word 用户会直接打 17px（虽然 token 里没有这一档）；
	*   2. **上下键走档位**：不是 ±1，而是 12 → 13 → 14 → 16…（Office 的行为）；
	*   3. **档位与 token 对齐**：`FONT_SIZE_PRESETS` 就是 `--oj-fs-*` 那八档，
	*      所以选中什么字号，`ja` / `compact` 档位降字号时它才会跟着降。
	*/
	var OjFontSizeField = (0, vue.defineComponent)({
		name: "OjFontSizeField",
		props: {
			modelValue: {
				type: Number,
				required: true
			},
			presets: {
				type: Array,
				default: () => FONT_SIZE_PRESETS
			},
			label: {
				type: String,
				required: true
			},
			decreaseLabel: {
				type: String,
				required: true
			},
			increaseLabel: {
				type: String,
				required: true
			},
			/** 单位后缀（`px` / `pt`），只影响显示。 */
			unit: {
				type: String,
				default: "px"
			},
			disabled: {
				type: Boolean,
				default: false
			}
		},
		emits: ["update:modelValue"],
		setup(props, { emit }) {
			let draft = null;
			const bounds = () => ({ ...FONT_SIZE_RANGE });
			const current = () => clampNumber(props.modelValue, bounds());
			const selectedPreset = () => nearestPreset(props.presets, current());
			function commit() {
				if (draft === null) return;
				const parsed = parseNumberDraft(draft);
				draft = null;
				if (parsed === void 0) return;
				emit("update:modelValue", clampNumber(parsed, bounds()));
			}
			function bump(direction) {
				draft = null;
				const next = clampNumber(stepPreset(props.presets, current(), direction), bounds());
				if (next === current()) return;
				emit("update:modelValue", next);
			}
			function select(value) {
				const next = clampNumber(value, bounds());
				if (next === current()) return;
				emit("update:modelValue", next);
			}
			return () => {
				var _draft;
				return (0, vue.h)("div", {
					class: "oj-font-size",
					"data-disabled": props.disabled ? "" : void 0
				}, [
					(0, vue.h)("button", {
						type: "button",
						class: "oj-button",
						"data-size": "mini",
						"aria-label": props.decreaseLabel,
						disabled: props.disabled,
						onClick: () => bump(-1)
					}, "−"),
					(0, vue.h)("input", {
						class: "oj-font-size__input",
						type: "text",
						role: "spinbutton",
						inputmode: "decimal",
						"aria-label": props.label,
						"aria-valuenow": current(),
						"aria-valuemin": FONT_SIZE_RANGE.min,
						"aria-valuemax": FONT_SIZE_RANGE.max,
						disabled: props.disabled,
						value: (_draft = draft) !== null && _draft !== void 0 ? _draft : formatFontSize(current()),
						onInput: (event) => {
							draft = event.target.value;
						},
						onBlur: () => commit(),
						onKeydown: (event) => {
							if (event.key === "Enter") {
								event.preventDefault();
								commit();
								return;
							}
							if (event.key === "ArrowUp") {
								event.preventDefault();
								bump(1);
								return;
							}
							if (event.key === "ArrowDown") {
								event.preventDefault();
								bump(-1);
							}
						}
					}),
					(0, vue.h)("span", {
						class: "oj-font-size__unit",
						"aria-hidden": "true"
					}, props.unit),
					(0, vue.h)("button", {
						type: "button",
						class: "oj-button",
						"data-size": "mini",
						"aria-label": props.increaseLabel,
						disabled: props.disabled,
						onClick: () => bump(1)
					}, "+"),
					(0, vue.h)("select", {
						class: "oj-font-size__presets",
						"aria-label": props.label,
						disabled: props.disabled,
						value: String(selectedPreset()),
						onChange: (event) => {
							const next = Number(event.target.value);
							if (Number.isFinite(next)) select(next);
						}
					}, props.presets.map((preset) => (0, vue.h)("option", {
						value: String(preset),
						selected: preset === selectedPreset()
					}, String(preset))))
				]);
			};
		}
	});
	//#endregion
	//#region src/vue/line-spacing-picker.ts
	/**
	* `OjLineSpacingPicker`（03 §3 / M2）：行距档位列表。
	*
	* 行距存的是**倍数**（1 / 1.15 / 1.5 / 2），不是 px：Word/WPS 的"多倍行距"就是这个语义，
	* 存 px 会在换字号时失真（14px 文字配 21px 行高，换成 32px 就挤成一团）。
	*
	* 选中态用 `aria-selected` 而不是只加 class：`role="listbox"` 里读屏靠它播报"当前第几项"。
	*/
	var OjLineSpacingPicker = (0, vue.defineComponent)({
		name: "OjLineSpacingPicker",
		props: {
			modelValue: {
				type: Number,
				required: true
			},
			presets: {
				type: Array,
				default: () => LINE_SPACING_PRESETS
			},
			label: {
				type: String,
				required: true
			},
			disabled: {
				type: Boolean,
				default: false
			}
		},
		emits: ["update:modelValue"],
		setup(props, { emit }) {
			const bounds = () => ({
				...LINE_SPACING_RANGE,
				precision: 2
			});
			const current = () => clampNumber(props.modelValue, bounds());
			function select(value) {
				const next = clampNumber(value, bounds());
				if (next === current()) return;
				emit("update:modelValue", next);
			}
			return () => (0, vue.h)("div", {
				class: "oj-line-spacing",
				role: "listbox",
				"aria-label": props.label,
				"data-disabled": props.disabled ? "" : void 0,
				onKeydown: (event) => {
					if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
					event.preventDefault();
					select(stepPreset(props.presets, current(), event.key === "ArrowUp" ? 1 : -1));
				}
			}, [...props.presets].sort((a, b) => a - b).map((preset) => (0, vue.h)("button", {
				type: "button",
				class: "oj-line-spacing__option",
				role: "option",
				"aria-selected": preset === nearestPreset(props.presets, current()) ? "true" : "false",
				"data-active": preset === nearestPreset(props.presets, current()) ? "" : void 0,
				disabled: props.disabled,
				onClick: () => select(preset)
			}, [(0, vue.h)("span", {
				class: "oj-line-spacing__lines",
				"aria-hidden": "true",
				style: { gap: `${Math.max(2, (preset - 1) * 6 + 2)}px` }
			}, [(0, vue.h)("i", { class: "oj-line-spacing__line" }), (0, vue.h)("i", { class: "oj-line-spacing__line" })]), (0, vue.h)("span", { class: "oj-line-spacing__value" }, formatLineSpacing(preset))])));
		}
	});
	//#endregion
	//#region src/vue/tabs.ts
	var OjTabs = (0, vue.defineComponent)({
		name: "OjTabs",
		props: {
			items: {
				type: Array,
				required: true
			},
			modelValue: {
				type: String,
				required: true
			}
		},
		emits: ["update:modelValue"],
		setup(props, { emit }) {
			return () => (0, vue.h)("div", {
				class: "oj-tabs",
				role: "tablist",
				onKeydown: (event) => {
					const next = selectByKey(props.items.map((item) => item.id), props.modelValue, event.key);
					if (next === props.modelValue) return;
					event.preventDefault();
					emit("update:modelValue", next);
				}
			}, props.items.map((item) => {
				const selected = item.id === props.modelValue;
				return (0, vue.h)("button", {
					type: "button",
					class: "oj-tabs__tab",
					role: "tab",
					id: `oj-tab-${item.id}`,
					"aria-selected": selected ? "true" : "false",
					tabindex: selected ? 0 : -1,
					onClick: () => emit("update:modelValue", item.id)
				}, item.label);
			}));
		}
	});
	//#endregion
	//#region src/vue/dialog.ts
	/**
	* 03 §2「弹层归属」：`teleport: 'body' | '[selector]' | false`。
	*
	* Office 场景里弹窗不能一律挂 body：全屏放映要投进放映容器、iframe 内要投进 iframe 的
	* document、打印区域同理。`false` 留在原地，给已经自己做了层级管理的宿主用。
	*/
	function teleportTarget(value) {
		if (value === false) return void 0;
		return typeof value === "string" && value.length > 0 ? value : "body";
	}
	var OjDialog = (0, vue.defineComponent)({
		name: "OjDialog",
		props: {
			open: {
				type: Boolean,
				required: true
			},
			title: {
				type: String,
				required: true
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
			"confirm",
			"cancel"
		],
		setup(props, { slots, emit }) {
			function cancel() {
				emit("cancel");
				emit("update:open", false);
			}
			function confirm() {
				emit("confirm");
			}
			function onKey(event) {
				if (!props.open || event.key !== "Escape") return;
				event.preventDefault();
				cancel();
			}
			(0, vue.onMounted)(() => document.addEventListener("keydown", onKey));
			(0, vue.onUnmounted)(() => document.removeEventListener("keydown", onKey));
			(0, vue.watch)(() => props.open, (open) => {
				if (!open) return;
				queueMicrotask(() => {
					var _document$querySelect;
					return (_document$querySelect = document.querySelector(".oj-dialog__confirm")) === null || _document$querySelect === void 0 ? void 0 : _document$querySelect.focus();
				});
			});
			return () => {
				var _slots$default;
				if (!props.open) return null;
				const content = (0, vue.h)("div", {
					class: "oj-dialog__mask",
					onClick: () => cancel()
				}, [(0, vue.h)("div", {
					class: "oj-dialog",
					role: "dialog",
					"aria-modal": "true",
					"aria-label": props.title,
					onClick: (event) => event.stopPropagation()
				}, [
					(0, vue.h)("header", { class: "oj-dialog__header" }, [(0, vue.h)("h2", { class: "oj-dialog__title" }, props.title), (0, vue.h)("button", {
						type: "button",
						class: "oj-button",
						"data-size": "mini",
						"aria-label": props.cancelLabel,
						onClick: () => cancel()
					}, [(0, vue.h)(OjIcon, {
						name: "oj-close",
						decorative: true
					})])]),
					(0, vue.h)("div", { class: "oj-dialog__body" }, (_slots$default = slots.default) === null || _slots$default === void 0 ? void 0 : _slots$default.call(slots)),
					(0, vue.h)("footer", { class: "oj-dialog__footer" }, [props.cancelLabel ? (0, vue.h)("button", {
						type: "button",
						class: "oj-button",
						onClick: () => cancel()
					}, props.cancelLabel) : null, props.confirmLabel ? (0, vue.h)("button", {
						type: "button",
						class: "oj-button oj-dialog__confirm",
						"data-active": "",
						onClick: () => confirm()
					}, props.confirmLabel) : null])
				])]);
				const to = teleportTarget(props.teleport);
				return to === void 0 ? content : (0, vue.h)(vue.Teleport, { to }, [content]);
			};
		}
	});
	//#endregion
	//#region src/vue/search-bar.ts
	var OjSearchReplaceBar = (0, vue.defineComponent)({
		name: "OjSearchReplaceBar",
		props: {
			find: {
				type: String,
				default: ""
			},
			replace: {
				type: String,
				default: ""
			},
			matchCase: {
				type: Boolean,
				default: false
			},
			current: {
				type: Number,
				default: 0
			},
			total: {
				type: Number,
				default: 0
			},
			findLabel: {
				type: String,
				required: true
			},
			replaceLabel: {
				type: String,
				required: true
			},
			nextLabel: {
				type: String,
				required: true
			},
			previousLabel: {
				type: String,
				required: true
			},
			matchCaseLabel: {
				type: String,
				required: true
			},
			countLabel: {
				type: String,
				required: true
			},
			replaceActionLabel: {
				type: String,
				required: true
			},
			replaceAllLabel: {
				type: String,
				required: true
			}
		},
		emits: [
			"update:find",
			"update:replace",
			"update:matchCase",
			"next",
			"previous",
			"replace",
			"replace-all"
		],
		setup(props, { emit }) {
			return () => (0, vue.h)("form", {
				class: "oj-search",
				onSubmit: (event) => event.preventDefault()
			}, [
				(0, vue.h)("label", { class: "oj-search__field" }, [(0, vue.h)("span", props.findLabel), (0, vue.h)("input", {
					value: props.find,
					onInput: (event) => emit("update:find", event.target.value)
				})]),
				(0, vue.h)("label", { class: "oj-search__field" }, [(0, vue.h)("span", props.replaceLabel), (0, vue.h)("input", {
					value: props.replace,
					onInput: (event) => emit("update:replace", event.target.value)
				})]),
				(0, vue.h)("span", { class: "oj-search__count" }, props.countLabel),
				(0, vue.h)("button", {
					type: "button",
					class: "oj-button",
					"data-size": "mini",
					"data-active": props.matchCase ? "" : void 0,
					"aria-pressed": props.matchCase ? "true" : "false",
					onClick: () => emit("update:matchCase", !props.matchCase)
				}, props.matchCaseLabel),
				(0, vue.h)("button", {
					type: "button",
					class: "oj-button",
					"data-size": "mini",
					onClick: () => emit("previous")
				}, props.previousLabel),
				(0, vue.h)("button", {
					type: "button",
					class: "oj-button",
					"data-size": "mini",
					onClick: () => emit("next")
				}, props.nextLabel),
				(0, vue.h)("button", {
					type: "button",
					class: "oj-button",
					"data-size": "mini",
					onClick: () => emit("replace")
				}, props.replaceActionLabel),
				(0, vue.h)("button", {
					type: "button",
					class: "oj-button",
					"data-size": "mini",
					onClick: () => emit("replace-all")
				}, props.replaceAllLabel)
			]);
		}
	});
	function clampZoom(value) {
		if (!Number.isFinite(value)) return 100;
		return Math.min(200, Math.max(50, Math.round(value)));
	}
	function stepZoom(value, direction) {
		return clampZoom(clampZoom(value) + direction * 10);
	}
	//#endregion
	//#region src/vue/zoom-control.ts
	var OjZoomControl = (0, vue.defineComponent)({
		name: "OjZoomControl",
		props: {
			modelValue: {
				type: Number,
				required: true
			},
			zoomOutLabel: {
				type: String,
				required: true
			},
			zoomInLabel: {
				type: String,
				required: true
			},
			resetLabel: {
				type: String,
				required: true
			}
		},
		emits: ["update:modelValue"],
		setup(props, { emit }) {
			return () => (0, vue.h)("div", {
				class: "oj-zoom",
				role: "group"
			}, [
				(0, vue.h)("button", {
					type: "button",
					class: "oj-button",
					"data-size": "mini",
					"aria-label": props.zoomOutLabel,
					onClick: () => emit("update:modelValue", stepZoom(props.modelValue, -1))
				}, [(0, vue.h)(OjIcon, {
					name: "oj-zoom-out",
					decorative: true
				})]),
				(0, vue.h)("span", { class: "oj-zoom__value" }, `${props.modelValue}%`),
				(0, vue.h)("button", {
					type: "button",
					class: "oj-button",
					"data-size": "mini",
					"aria-label": props.zoomInLabel,
					onClick: () => emit("update:modelValue", stepZoom(props.modelValue, 1))
				}, [(0, vue.h)(OjIcon, {
					name: "oj-zoom-in",
					decorative: true
				})]),
				(0, vue.h)("button", {
					type: "button",
					class: "oj-button",
					"data-size": "mini",
					onClick: () => emit("update:modelValue", 100)
				}, props.resetLabel)
			]);
		}
	});
	//#endregion
	//#region src/vue/file-tree.ts
	var OjFileTree = (0, vue.defineComponent)({
		name: "OjFileTree",
		props: {
			nodes: {
				type: Array,
				required: true
			},
			openIds: {
				type: Array,
				default: () => []
			},
			selectedId: {
				type: String,
				default: ""
			},
			emptyLabel: {
				type: String,
				default: ""
			}
		},
		emits: ["toggle", "select"],
		setup(props, { emit }) {
			function renderNode(node, depth) {
				const open = props.openIds.includes(node.id);
				const selected = props.selectedId === node.id;
				return (0, vue.h)("li", {
					key: node.id,
					role: "none"
				}, [(0, vue.h)("button", {
					type: "button",
					class: "oj-files__item",
					role: "treeitem",
					"aria-expanded": node.kind === "folder" ? String(open) : void 0,
					"aria-selected": selected ? "true" : "false",
					style: { paddingLeft: `${8 + depth * 16}px` },
					onClick: () => {
						if (node.kind === "folder") emit("toggle", node.id);
						emit("select", node.id);
					}
				}, [node.kind === "folder" ? (0, vue.h)(OjIcon, {
					name: open ? "oj-chevron-down" : "oj-chevron-right",
					decorative: true
				}) : (0, vue.h)(OjIcon, {
					name: "oj-file",
					decorative: true
				}), (0, vue.h)("span", node.name)]), node.kind === "folder" && open && node.children ? (0, vue.h)("ul", { role: "group" }, node.children.map((child) => renderNode(child, depth + 1))) : null]);
			}
			return () => {
				if (props.nodes.length === 0) return (0, vue.h)("p", { class: "oj-files__empty" }, props.emptyLabel);
				return (0, vue.h)("ul", {
					class: "oj-files",
					role: "tree"
				}, props.nodes.map((node) => renderNode(node, 0)));
			};
		}
	});
	//#endregion
	//#region src/shell/ruler.ts
	/** 标尺刻度。1cm 按 96dpi 换算，再乘当前缩放。 */
	var PX_PER_CM = 96 / 2.54;
	function rulerTicks(lengthPx, zoomPercent) {
		if (lengthPx <= 0 || zoomPercent <= 0) return [];
		const step = PX_PER_CM * (zoomPercent / 100);
		const ticks = [];
		const count = Math.floor(lengthPx / step);
		for (let index = 0; index <= count; index += 1) ticks.push({
			offset: Math.round(index * step),
			label: String(index)
		});
		return ticks;
	}
	//#endregion
	//#region src/vue/ruler.ts
	var OjRuler = (0, vue.defineComponent)({
		name: "OjRuler",
		props: {
			length: {
				type: Number,
				required: true
			},
			zoom: {
				type: Number,
				required: true
			},
			orientation: {
				type: String,
				default: "horizontal"
			}
		},
		setup(props) {
			return () => {
				const ticks = rulerTicks(props.length, props.zoom);
				const horizontal = props.orientation !== "vertical";
				return (0, vue.h)("div", {
					class: horizontal ? "oj-ruler oj-ruler--h" : "oj-ruler oj-ruler--v",
					style: horizontal ? { width: `${props.length}px` } : { height: `${props.length}px` },
					"aria-hidden": "true"
				}, ticks.map((tick) => (0, vue.h)("span", {
					class: "oj-ruler__tick",
					style: horizontal ? { left: `${tick.offset}px` } : { top: `${tick.offset}px` }
				}, tick.label)));
			};
		}
	});
	//#endregion
	//#region src/shell/signature.ts
	function startStroke(strokes, point) {
		return [...strokes, { points: [point] }];
	}
	function extendStroke(strokes, point) {
		const last = strokes[strokes.length - 1];
		if (!last) return startStroke(strokes, point);
		return [...strokes.slice(0, -1), { points: [...last.points, point] }];
	}
	function strokePath(stroke) {
		const first = stroke.points[0];
		if (!first) return "";
		const rest = stroke.points.slice(1).map((point) => `L ${point.x} ${point.y}`);
		return [`M ${first.x} ${first.y}`, ...rest].join(" ");
	}
	//#endregion
	//#region src/vue/signature-pad.ts
	var OjSignaturePad = (0, vue.defineComponent)({
		name: "OjSignaturePad",
		props: { clearLabel: {
			type: String,
			required: true
		} },
		emits: ["change"],
		setup(props, { emit }) {
			const strokes = (0, vue.ref)([]);
			const drawing = (0, vue.ref)(false);
			function point(event) {
				const bounds = event.currentTarget.getBoundingClientRect();
				return {
					x: Math.round(event.clientX - bounds.left),
					y: Math.round(event.clientY - bounds.top)
				};
			}
			function publish(next) {
				strokes.value = next;
				emit("change", next);
			}
			return () => (0, vue.h)("div", { class: "oj-signature" }, [(0, vue.h)("svg", {
				class: "oj-signature__pad",
				viewBox: "0 0 360 140",
				onPointerdown: (event) => {
					drawing.value = true;
					event.currentTarget.setPointerCapture(event.pointerId);
					publish(startStroke(strokes.value, point(event)));
				},
				onPointermove: (event) => {
					if (!drawing.value) return;
					publish(extendStroke(strokes.value, point(event)));
				},
				onPointerup: () => {
					drawing.value = false;
				}
			}, strokes.value.map((stroke, index) => (0, vue.h)("path", {
				key: index,
				d: strokePath(stroke),
				fill: "none",
				stroke: "currentColor",
				"stroke-width": "1.6"
			}))), (0, vue.h)("button", {
				type: "button",
				class: "oj-button",
				"data-size": "mini",
				onClick: () => publish([])
			}, props.clearLabel)]);
		}
	});
	//#endregion
	//#region src/vue/stamp.ts
	var OjStamp = (0, vue.defineComponent)({
		name: "OjStamp",
		props: { text: {
			type: String,
			required: true
		} },
		setup(props) {
			return () => (0, vue.h)("span", {
				class: "oj-stamp",
				"aria-hidden": "true"
			}, props.text);
		}
	});
	//#endregion
	//#region src/vue/watermark.ts
	var OjWatermark = (0, vue.defineComponent)({
		name: "OjWatermark",
		props: {
			text: {
				type: String,
				required: true
			},
			visible: {
				type: Boolean,
				default: true
			}
		},
		setup(props, { slots }) {
			return () => {
				var _slots$default;
				return (0, vue.h)("div", { class: "oj-watermark" }, [(_slots$default = slots.default) === null || _slots$default === void 0 ? void 0 : _slots$default.call(slots), props.visible ? (0, vue.h)("div", {
					class: "oj-watermark__layer",
					"aria-hidden": "true"
				}, props.text) : null]);
			};
		}
	});
	//#endregion
	//#region src/vue/ai-panel.ts
	var OjAiPanel = (0, vue.defineComponent)({
		name: "OjAiPanel",
		props: {
			title: {
				type: String,
				required: true
			},
			placeholder: {
				type: String,
				required: true
			},
			sendLabel: {
				type: String,
				required: true
			},
			messages: {
				type: Array,
				default: () => []
			},
			notice: {
				type: String,
				default: ""
			}
		},
		emits: ["submit"],
		setup(props, { emit }) {
			const draft = (0, vue.ref)("");
			return () => (0, vue.h)("aside", {
				class: "oj-ai",
				"aria-label": props.title
			}, [
				(0, vue.h)("header", { class: "oj-ai__title" }, props.title),
				props.notice ? (0, vue.h)("p", { class: "oj-ai__notice" }, props.notice) : null,
				(0, vue.h)("ol", { class: "oj-ai__log" }, props.messages.map((message, index) => (0, vue.h)("li", {
					key: index,
					"data-role": message.role
				}, message.text))),
				(0, vue.h)("form", {
					class: "oj-ai__form",
					onSubmit: (event) => {
						event.preventDefault();
						const text = draft.value.trim();
						if (!text) return;
						draft.value = "";
						emit("submit", text);
					}
				}, [(0, vue.h)("input", {
					value: draft.value,
					placeholder: props.placeholder,
					onInput: (event) => {
						draft.value = event.target.value;
					}
				}), (0, vue.h)("button", {
					type: "submit",
					class: "oj-button",
					"data-size": "mini"
				}, props.sendLabel)])
			]);
		}
	});
	//#endregion
	//#region src/vue/code-block.ts
	var OjCodeBlock = (0, vue.defineComponent)({
		name: "OjCodeBlock",
		props: {
			code: {
				type: String,
				required: true
			},
			language: {
				type: String,
				default: ""
			}
		},
		setup(props) {
			return () => (0, vue.h)("pre", { class: "oj-code" }, [props.language ? (0, vue.h)("span", { class: "oj-code__lang" }, props.language) : null, props.code]);
		}
	});
	/**
	* 头像上的首字母。
	*
	* 拉丁名取首尾两词首字母（`Ada Lovelace` → `AL`），单字取首字符，中日韩整名取**首字**——
	* 取末字会让"张伟 / 王伟"这类名字在头像上撞成同一个字。
	*
	* 中日韩名字中间带空格（`王 伟`）时仍只取一个字：这类空格是排版习惯，不是"两个词"，
	* 取两个字符在圆形头像里会挤成一团。
	*
	* 用 `[...name]` 而不是 `name[0]`：emoji 与部分 CJK 扩展字是代理对，按 UTF-16 切会切出半个字符。
	*/
	var CJK = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uac00-\ud7af]/;
	function initialsOf(name) {
		var _, _2;
		const parts = name.trim().split(/\s+/).filter((part) => part.length > 0);
		if (parts.length === 0) return "";
		const first = (_ = [...parts[0]][0]) !== null && _ !== void 0 ? _ : "";
		if (parts.length === 1 || CJK.test(first)) return first.toUpperCase();
		return (first + ((_2 = [...parts[parts.length - 1]][0]) !== null && _2 !== void 0 ? _2 : "")).toUpperCase();
	}
	/**
	* 色板序号：稳定哈希，同一 `id` 永远同一档。
	*
	* 不用 `charCodeAt(0)` 取模：`user-1`/`user-2`… 这类 id 的首字符全一样，会全部撞到同一档；
	* djb2 变体对"前缀相同、尾号不同"的 id 分布足够散。
	*/
	function avatarTone(person) {
		if (person.tone !== void 0 && Number.isInteger(person.tone)) return (person.tone % 4 + 4) % 4;
		let hash = 5381;
		for (let index = 0; index < person.id.length; index += 1) hash = (hash << 5) + hash + person.id.charCodeAt(index) >>> 0;
		return hash % 4;
	}
	/**
	* 头像堆叠：超过 `max` 个就折叠，**折叠数不含"更多"按钮自身**（按钮显示 `overflow` 个人）。
	*
	* `max` 为 0 时返回空 + 全折叠：调用方据此在窄侧栏里把整组隐藏掉，而不是渲染一个 `+5` 再也没地方展开。
	* `max` 非整数或负数按 0 处理——`max` 常常来自"容器宽度算出来的档数"，算错时应该什么都不画，而不是画非整数个。
	*/
	function stackPeople(people, max) {
		const limit = Number.isFinite(max) && max > 0 ? Math.floor(max) : 0;
		if (limit === 0) return {
			visible: [],
			overflow: people.length
		};
		if (people.length <= limit) return {
			visible: [...people],
			overflow: 0
		};
		const shown = Math.max(limit - 1, 0);
		return {
			visible: people.slice(0, shown),
			overflow: people.length - shown
		};
	}
	//#endregion
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
					"data-tone": String(avatarTone(person)),
					"aria-hidden": "true"
				}, initialsOf(person.name));
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
	//#region src/shell/review.ts
	var REVIEW_KINDS = [
		"insert",
		"delete",
		"format"
	];
	function match(change, filter) {
		var _filter$kind, _filter$authorId;
		const kind = (_filter$kind = filter.kind) !== null && _filter$kind !== void 0 ? _filter$kind : "all";
		const authorId = (_filter$authorId = filter.authorId) !== null && _filter$authorId !== void 0 ? _filter$authorId : "all";
		if (kind !== "all" && change.kind !== kind) return false;
		if (authorId !== "all" && change.author.id !== authorId) return false;
		return true;
	}
	/** 按种类/作者筛选，保持原有顺序（顺序即文档位置，重排会让"下一个修订"跳着走）。 */
	function filterChanges(changes, filter) {
		return changes.filter((change) => match(change, filter));
	}
	//#endregion
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
			const visible = () => filterChanges(props.changes, { kind: kind.value });
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
					}, [chip("all", props.allKindsLabel), ...REVIEW_KINDS.map((entry) => chip(entry, props.kindLabels[entry]))]),
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
							"data-tone": String(avatarTone(change.author)),
							"aria-hidden": "true"
						}, initialsOf(change.author.name)),
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
	//#region src/vue/presence-avatars.ts
	/**
	* `OjPresenceAvatars`（03 §3 E 组）：协同在场头像堆叠。
	*
	* 三个决定：
	*   1. **颜色与首字母由 `id` 与姓名派生**，不接受外部传色板：同一人在批注区和标题栏必须是同一个颜色，
	*      允许外部指定就一定有两处不一致的那天。
	*   2. **"还有 N 人"是按钮而不是一段文字**：它是唯一能展开完整名单的入口，
	*      做成 `<span>` 就等于这批人永远看不到（03 §5 的可达性底线）。
	*   3. **堆叠数由 `max` 决定，不做 CSS 自动折行**：折行会让参与人数改变标题栏高度，
	*      标题栏一抖，下面的文档就跟着跳。
	*/
	var OjPresenceAvatars = (0, vue.defineComponent)({
		name: "OjPresenceAvatars",
		props: {
			people: {
				type: Array,
				required: true
			},
			/** 最多显示几格（含"更多"按钮）。给 0 表示这个位置放不下，整组不画。 */
			max: {
				type: Number,
				default: 5
			},
			/** 整组的可访问名（"当前在线的协作者"）。 */
			label: {
				type: String,
				required: true
			},
			/** 已格式化的"还有 N 人"文案；不给时按钮上只显示 `+N`。 */
			overflowLabel: {
				type: String,
				default: ""
			},
			/** 溢出按钮的提示（"查看全部协作者"）。 */
			overflowTitle: {
				type: String,
				default: ""
			}
		},
		emits: ["select", "overflow"],
		setup(props, { emit }) {
			return () => {
				if (!(props.max > 0)) return null;
				const stacked = stackPeople(props.people, props.max);
				if (stacked.visible.length === 0 && stacked.overflow === 0) return null;
				const overflow = stacked.overflow;
				return (0, vue.h)("div", {
					class: "oj-presence",
					role: "group",
					"aria-label": props.label
				}, [...stacked.visible.map((person) => (0, vue.h)("button", {
					key: person.id,
					type: "button",
					class: "oj-presence__avatar oj-avatar",
					"data-tone": String(avatarTone(person)),
					title: person.name,
					"aria-label": person.name,
					onClick: () => emit("select", person.id)
				}, initialsOf(person.name))), overflow > 0 ? (0, vue.h)("button", {
					type: "button",
					class: "oj-presence__more",
					title: props.overflowTitle === "" ? props.overflowLabel : props.overflowTitle,
					"aria-label": props.overflowLabel === "" ? `+${overflow}` : props.overflowLabel,
					onClick: () => emit("overflow")
				}, props.overflowLabel === "" ? `+${overflow}` : props.overflowLabel) : null]);
			};
		}
	});
	//#endregion
	//#region src/shell/file-name.ts
	/** Windows 保留字符（不含 `\0`，它在 JS 字符串里根本进不来）。 */
	var ILLEGAL = /[\\/:*?"<>|]/;
	/** Windows 保留设备名。大小写不敏感，且带扩展名也是保留的（`CON.txt` 同样建不出来）。 */
	var RESERVED = /* @__PURE__ */ new Set([
		"con",
		"prn",
		"aux",
		"nul",
		...Array.from({ length: 9 }, (_, index) => `com${index + 1}`),
		...Array.from({ length: 9 }, (_, index) => `lpt${index + 1}`)
	]);
	/**
	* 校验文件名。返回 `undefined` 表示可用。
	*
	* 首尾空白先裁掉再判空：`"  "` 是用户想清空名字的常见中间态，它必须报 `empty` 而不是"可用"。
	* `.` 与 `..` 归到 `reserved`：它们在所有平台上都不是合法文件名，但也不是"空"。
	*/
	function fileNameProblem(name) {
		var _trimmed$split$0$toLo, _trimmed$split$;
		const trimmed = name.trim();
		if (trimmed.length === 0) return "empty";
		if (trimmed === "." || trimmed === "..") return "reserved";
		if (ILLEGAL.test(trimmed)) return "illegal";
		const stem = (_trimmed$split$0$toLo = (_trimmed$split$ = trimmed.split(".")[0]) === null || _trimmed$split$ === void 0 ? void 0 : _trimmed$split$.toLowerCase()) !== null && _trimmed$split$0$toLo !== void 0 ? _trimmed$split$0$toLo : "";
		if (RESERVED.has(stem)) return "reserved";
	}
	/**
	* 重命名结果。**与原值相同视为成功且返回原名**（不是"没变化所以失败"）：
	* 用户回车确认一个没改的名字，界面应该退出编辑态，而不是弹错误。
	*/
	function renameFile(current, next) {
		const trimmed = next.trim();
		if (trimmed === current) return {
			ok: true,
			name: current
		};
		const problem = fileNameProblem(trimmed);
		if (problem !== void 0) return {
			ok: false,
			problem
		};
		return {
			ok: true,
			name: trimmed
		};
	}
	//#endregion
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
	var OjFileNameHeader = (0, vue.defineComponent)({
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
			const editing = (0, vue.ref)(false);
			const draft = (0, vue.ref)("");
			const problem = (0, vue.ref)(void 0);
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
				return (0, vue.h)("input", {
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
						element === null || element === void 0 || element.focus();
						element === null || element === void 0 || element.select();
					}
				});
			}
			return () => {
				var _props$problemLabels$;
				const message = problem.value === void 0 ? "" : (_props$problemLabels$ = props.problemLabels[problem.value]) !== null && _props$problemLabels$ !== void 0 ? _props$problemLabels$ : "";
				return (0, vue.h)("div", {
					class: "oj-file-name",
					"data-state": props.state
				}, [
					(0, vue.h)("button", {
						type: "button",
						class: "oj-file-name__favorite",
						"data-active": props.favored ? "" : void 0,
						"aria-pressed": props.favored ? "true" : "false",
						"aria-label": props.favoriteLabel,
						title: props.favoriteLabel,
						onClick: () => emit("update:favored", !props.favored)
					}, "★"),
					editing.value ? input() : (0, vue.h)("button", {
						type: "button",
						class: "oj-file-name__title",
						title: props.renameLabel,
						"aria-label": props.renameLabel,
						onClick: start
					}, props.name),
					props.stateLabel === "" ? null : (0, vue.h)("span", {
						class: "oj-file-name__state",
						"data-state": props.state
					}, [(0, vue.h)("i", {
						class: "oj-file-name__dot",
						"aria-hidden": "true"
					}), props.stateLabel]),
					message === "" ? null : (0, vue.h)("span", {
						class: "oj-file-name__problem",
						role: "alert"
					}, message)
				]);
			};
		}
	});
	function finiteOr(value, fallback) {
		return value !== void 0 && Number.isFinite(value) ? value : fallback;
	}
	/**
	* 夹进 `[min, max]`；`collapsible` 时低于 `min / 2` 归 0。
	*
	* 折叠阈值取 `min / 2` 而不是 0 或 min：阈值等于 min 时"想拖窄一点"会被判成折叠，
	* 等于 0 时永远折叠不了（鼠标到 0 之前已经到 min）。一半是唯一能让两种意图都成立的界线。
	*
	* `max` 为 `Infinity`（或没给）表示**不设上限**，不能当成"缺省 = min"：
	* 那样"右侧批注栏最宽不限"会被夹成最小宽度，拖一下就弹回去，看起来像拖拽坏了。
	* `max` 小于 `min`（配置写反）时以 `min` 为准：宁可显示最小宽，也不要让栏宽变成 `NaN`。
	*/
	function clampPane(size, bounds) {
		const min = Math.max(0, finiteOr(bounds.min, 0));
		const limit = finiteOr(bounds.max, Number.POSITIVE_INFINITY);
		const max = Number.isFinite(limit) ? Math.max(min, limit) : Number.POSITIVE_INFINITY;
		const value = finiteOr(size, min);
		if (bounds.collapsible === true && value < min / 2) return 0;
		return Math.min(Math.max(value, min), max);
	}
	/**
	* 拖拽中的新尺寸。`delta` 是"这一栏要变宽多少"（向右拖左侧栏变大即正）。
	* 已经折叠（0）的栏在拖拽中不自动展开：展开走键盘或拖回 `min` 以上，避免手抖一下就弹回来。
	*/
	function resizePane(start, delta, bounds) {
		const current = finiteOr(start, bounds.min);
		if (current === 0) return 0;
		return clampPane(current + finiteOr(delta, 0), bounds);
	}
	/**
	* 键盘步进。折叠态下按"变大"直接回到 `min`（否则 `0 + 16` 会停在折叠区里出不来）。
	*
	* 反向的边界单独处理：已经在 `min` 上再按"变小"必须折叠到 0。走 `clampPane` 的话
	* `min - 16` 大于 `min / 2`，会被夹回 `min`——键盘就**永远收不起侧栏**，
	* 而拖拽能收，于是同一个组件的两条输入路径行为不一致。
	*/
	function stepPane(size, direction, bounds, step = 16) {
		const min = Math.max(0, finiteOr(bounds.min, 0));
		const current = finiteOr(size, min);
		const amount = Math.abs(finiteOr(step, 16)) || 16;
		if (current === 0) return direction === 1 ? clampPane(min, bounds) : 0;
		const next = current + direction * amount;
		if (direction === -1 && bounds.collapsible === true && next <= min) return 0;
		return clampPane(next, bounds);
	}
	/** 折叠/展开切换。不可折叠时返回原尺寸——按钮仍可在，但点了没反应比"变成 0 就回不来"好。 */
	function togglePane(size, bounds) {
		if (bounds.collapsible !== true) return clampPane(size, bounds);
		return finiteOr(size, bounds.min) === 0 ? clampPane(bounds.min, bounds) : 0;
	}
	/**
	* 第 `index` 栏左侧那根分隔条归谁管。`index` 是"后一栏"的下标，所以从 1 开始。
	*
	* 规则：**总是调固定宽的那一栏**。可伸缩栏的尺寸是"剩下的空间"，没有独立数值可拖，
	* 让它当被调对象只会出现"拖动后跳回原处"。两侧都固定时才调后一栏（与 `OjSplitter` 的默认一致）。
	* 两侧都 `flexible` 时返回 `undefined`：它们按比例分空间，拖谁都表达不成单个尺寸。
	*/
	function paneSplitter(panes, index) {
		if (index <= 0 || index >= panes.length) return void 0;
		const before = panes[index - 1];
		const after = panes[index];
		if (before === void 0 || after === void 0) return void 0;
		if (before.flexible === true && after.flexible === true) return void 0;
		const controlledIsBefore = after.flexible === true;
		const controlled = controlledIsBefore ? before : after;
		if (controlled.resizable === false) return void 0;
		return {
			controlled: controlled.id,
			side: controlledIsBefore ? "before" : "after"
		};
	}
	//#endregion
	//#region src/vue/splitter.ts
	/**
	* `OjSplitter`（03 §3 D 组）：两栏之间的可拖拽分隔条。
	*
	* 只画一根条子，不画两侧的栏——`size` 描述的是**被调那一栏**的宽度/高度，
	* 由 `pane` 决定是分隔条之前还是之后那一栏（默认 `'after'`，即右侧批注栏 / 下方控制台）。
	* 方向必须显式声明：同一根条子既能表示"左栏收起"也能表示"右栏展开"，
	* 两种语义都不说清等于永远搞不懂往哪拖。往右拖是**把右栏压窄、把左栏放宽**。
	*
	* 受控：拖拽只上抛 `update:size`，本地不留尺寸副本。拖拽期间宿主可能同时在钳制
	* （窗口缩小、另一栏被折叠），本地存一份就会出现松开后"跳一下"。
	*
	* 键盘走 WAI-ARIA window splitter 的语义：方向键移动的是**分隔条本身**，
	* 不是"把数值调大"——否则右栏的右键与左栏的右键行为相反，谁都用不对。
	*/
	var OjSplitter = (0, vue.defineComponent)({
		name: "OjSplitter",
		props: {
			/** 被调那一栏的尺寸（px）。 */
			size: {
				type: Number,
				required: true
			},
			min: {
				type: Number,
				default: 0
			},
			max: {
				type: Number,
				default: Number.POSITIVE_INFINITY
			},
			collapsible: {
				type: Boolean,
				default: false
			},
			/** 被调的是分隔条**之前**还是**之后**那一栏。 */
			pane: {
				type: String,
				default: "after"
			},
			orientation: {
				type: String,
				default: "vertical"
			},
			/** 分隔条的可访问名（"调整批注栏宽度"）。 */
			label: {
				type: String,
				required: true
			},
			step: {
				type: Number,
				default: 16
			},
			disabled: {
				type: Boolean,
				default: false
			}
		},
		emits: [
			"update:size",
			"drag-start",
			"drag-end"
		],
		setup(props, { emit }) {
			const dragging = (0, vue.ref)(false);
			let origin = 0;
			let originSize = 0;
			let last = props.size;
			function bounds() {
				return {
					min: props.min,
					max: props.max,
					collapsible: props.collapsible
				};
			}
			/** 只在值真的变了才上抛：拖拽一次会收到几十个 pointermove，重复值会打断宿主的渲染合帧。 */
			function commit(next) {
				if (next === last) return;
				last = next;
				emit("update:size", next);
			}
			/**
			* 指针捕获让光标划出条子之外仍能继续拖。测试环境（happy-dom）不一定实现，
			* 捕获失败只影响"拖出条子就断"，不该让拖拽本身抛错。
			*/
			function capture(element, pointerId) {
				try {
					element === null || element === void 0 || element.setPointerCapture(pointerId);
				} catch (_unused) {}
			}
			function onPointerdown(event) {
				if (props.disabled || event.button !== 0) return;
				event.preventDefault();
				capture(event.currentTarget, event.pointerId);
				dragging.value = true;
				origin = props.orientation === "vertical" ? event.clientX : event.clientY;
				originSize = props.size;
				last = props.size;
				emit("drag-start");
			}
			function onPointermove(event) {
				if (!dragging.value) return;
				const pointer = props.orientation === "vertical" ? event.clientX : event.clientY;
				const delta = props.pane === "before" ? pointer - origin : origin - pointer;
				commit(resizePane(originSize, delta, bounds()));
			}
			function finish(event) {
				if (!dragging.value) return;
				dragging.value = false;
				const target = event.currentTarget;
				try {
					if ((target === null || target === void 0 ? void 0 : target.hasPointerCapture(event.pointerId)) === true) target.releasePointerCapture(event.pointerId);
				} catch (_unused2) {}
				emit("drag-end", last);
			}
			function onKeydown(event) {
				if (props.disabled) return;
				const vertical = props.orientation === "vertical";
				const backward = vertical ? "ArrowLeft" : "ArrowUp";
				const forward = vertical ? "ArrowRight" : "ArrowDown";
				const grow = props.pane === "before" ? forward : backward;
				const shrink = props.pane === "before" ? backward : forward;
				if (event.key === grow) {
					event.preventDefault();
					commit(stepPane(props.size, 1, bounds(), props.step));
					return;
				}
				if (event.key === shrink) {
					event.preventDefault();
					commit(stepPane(props.size, -1, bounds(), props.step));
					return;
				}
				if (event.key === "Home") {
					event.preventDefault();
					commit(props.collapsible ? 0 : clampPane(props.min, bounds()));
					return;
				}
				if (event.key === "End") {
					event.preventDefault();
					if (Number.isFinite(props.max)) commit(clampPane(props.max, bounds()));
					return;
				}
				if (event.key === "Enter" || event.key === " ") {
					event.preventDefault();
					commit(togglePane(props.size, bounds()));
				}
			}
			return () => {
				const collapsed = props.size === 0;
				return (0, vue.h)("div", {
					class: "oj-splitter",
					role: "separator",
					tabindex: props.disabled ? -1 : 0,
					"aria-label": props.label,
					"aria-orientation": props.orientation,
					"aria-valuenow": Math.round(props.size),
					"aria-valuemin": Math.round(props.min),
					"aria-valuemax": Number.isFinite(props.max) ? Math.round(props.max) : void 0,
					"aria-disabled": props.disabled ? "true" : void 0,
					"data-orientation": props.orientation,
					"data-pane": props.pane,
					"data-dragging": dragging.value ? "" : void 0,
					"data-collapsed": collapsed ? "" : void 0,
					"data-disabled": props.disabled ? "" : void 0,
					onPointerdown,
					onPointermove,
					onPointerup: finish,
					onPointercancel: finish,
					onKeydown,
					onDblclick: () => {
						if (props.disabled) return;
						commit(togglePane(props.size, bounds()));
					}
				});
			};
		}
	});
	//#endregion
	//#region src/vue/pane-group.ts
	/**
	* `OjPaneGroup`（03 §3 D 组）：按声明排布多栏，并在栏之间插分隔条。
	*
	* 只做三件组件里最容易写错的事，其余交给宿主：
	*   - **哪根条子调哪一栏**由 `paneSplitter()` 决定——永远调固定宽的那一栏。
	*     可伸缩栏的尺寸是"剩下的空间"，让它当被调对象就会出现"拖完跳回原处"。
	*   - **栏位用命名插槽**（`#<id>`），不用默认插槽：默认插槽会把同一段内容画进每一栏，
	*     而多栏布局里每栏内容必然不同，复制出来的 DOM 只会让宿主以为组件坏了。
	*   - **不自己存尺寸**。`update:size` 带栏位 id 上抛，宿主回写 `panes`；否则拖拽与
	*     外部改布局（切换预设、恢复会话）会各存一份，谁赢取决于时序。
	*
	* 布局只用 flex：固定栏 `flex: 0 0 auto` + 宽/高，可伸缩栏 `flex: 1 1 0`。
	* 全部用 `width: calc(...)` 之类的表达式反而会在收起时算不清最小宽度。
	*/
	var OjPaneGroup = (0, vue.defineComponent)({
		name: "OjPaneGroup",
		props: {
			panes: {
				type: Array,
				required: true
			},
			orientation: {
				type: String,
				default: "vertical"
			},
			/** 分隔条的兜底可访问名；栏位自己给了 `label` 时优先用栏位的。 */
			label: {
				type: String,
				required: true
			}
		},
		emits: ["update:size"],
		setup(props, { emit, slots }) {
			/** 固定栏沿主轴的长度；可伸缩栏沿主轴的 `min` 仍然要生效，否则会被压到 0 无法操作。 */
			function paneStyle(pane) {
				const vertical = props.orientation === "vertical";
				const min = Number.isFinite(pane.min) ? Math.max(0, pane.min) : 0;
				if (pane.flexible === true) return vertical ? {
					flex: "1 1 0",
					minWidth: `${min}px`
				} : {
					flex: "1 1 0",
					minHeight: `${min}px`
				};
				const size = Number.isFinite(pane.size) ? Math.max(0, pane.size) : 0;
				return vertical ? {
					flex: "0 0 auto",
					width: `${size}px`
				} : {
					flex: "0 0 auto",
					height: `${size}px`
				};
			}
			return () => {
				const children = [];
				props.panes.forEach((pane, index) => {
					var _slots$pane$id;
					if (index > 0) {
						const splitter = paneSplitter(props.panes, index);
						const target = splitter === void 0 ? void 0 : props.panes.find((entry) => entry.id === splitter.controlled);
						if (splitter !== void 0 && target !== void 0) {
							var _target$min, _target$max, _target$label;
							children.push((0, vue.h)(OjSplitter, {
								key: `splitter-${pane.id}`,
								size: target.size,
								min: (_target$min = target.min) !== null && _target$min !== void 0 ? _target$min : 0,
								max: (_target$max = target.max) !== null && _target$max !== void 0 ? _target$max : Number.POSITIVE_INFINITY,
								collapsible: target.collapsible === true,
								pane: splitter.side,
								orientation: props.orientation,
								label: (_target$label = target.label) !== null && _target$label !== void 0 ? _target$label : props.label,
								"onUpdate:size": (size) => emit("update:size", target.id, size)
							}));
						}
					}
					children.push((0, vue.h)("section", {
						key: pane.id,
						class: "oj-pane-group__pane",
						"data-pane": pane.id,
						"data-flexible": pane.flexible === true ? "" : void 0,
						"data-collapsed": pane.flexible !== true && pane.size === 0 ? "" : void 0,
						style: paneStyle(pane)
					}, (_slots$pane$id = slots[pane.id]) === null || _slots$pane$id === void 0 ? void 0 : _slots$pane$id.call(slots)));
				});
				return (0, vue.h)("div", {
					class: "oj-pane-group",
					"data-orientation": props.orientation
				}, children);
			};
		}
	});
	//#endregion
	//#region src/shell/virtual.ts
	/** 非法尺寸一律当 0：`NaN` 混进前缀和会让整张表的偏移全部变成 `NaN`，且再也恢复不了。 */
	function positive(value, fallback) {
		if (value === void 0 || !Number.isFinite(value)) return Math.max(0, fallback);
		return Math.max(0, value);
	}
	function createMetrics(items, estimateSize) {
		const estimate = positive(estimateSize, 0);
		const ids = [];
		const sizes = [];
		const offsets = [0];
		for (const item of items) {
			ids.push(item.id);
			const size = positive(item.size, estimate);
			sizes.push(size);
			offsets.push(offsets[offsets.length - 1] + size);
		}
		return {
			ids,
			sizes,
			offsets,
			total: offsets[offsets.length - 1]
		};
	}
	/**
	* 量到真实高度后重建偏移。
	*
	* 只改 `index` 之后的偏移：前面的行与它们的滚动位置都不受影响，列表才不会在测量时抖动。
	* 尺寸没变时返回原对象——`ResizeObserver` 会在同一帧里反复回调，引用变化会引发无意义的重渲染。
	*/
	function measureItem(metrics, index, size) {
		const current = metrics.sizes[index];
		if (current === void 0) return metrics;
		const next = positive(size, current);
		if (next === current) return metrics;
		const delta = next - current;
		const sizes = metrics.sizes.slice();
		sizes[index] = next;
		const offsets = metrics.offsets.slice();
		for (let cursor = index + 1; cursor < offsets.length; cursor += 1) offsets[cursor] = offsets[cursor] + delta;
		return {
			ids: metrics.ids,
			sizes,
			offsets,
			total: metrics.total + delta
		};
	}
	/**
	* 某个滚动位置落在第几行。
	*
	* 返回的是"顶部已滚过的那一行"，不是"完全可见的第一行"——两者在滚到一半时不同，
	* 锚点与可视窗口用的都是前者。空列表返回 0，调用方靠 `ids.length` 判断空态。
	*/
	function indexAtOffset(metrics, offset) {
		const count = metrics.ids.length;
		if (count === 0) return 0;
		const value = Number.isFinite(offset) ? offset : 0;
		if (value <= 0) return 0;
		if (value >= metrics.total) return count - 1;
		let low = 0;
		let high = count - 1;
		while (low < high) {
			const middle = Math.ceil((low + high) / 2);
			if (metrics.offsets[middle] <= value) low = middle;
			else high = middle - 1;
		}
		return low;
	}
	/**
	* 需要渲染的窗口。
	*
	* `overscan` 是上下各多渲染的行数：滚动时先看到"白块"再蹦出内容，多半就是少了这一圈。
	* 高度为 0 的视口仍然返回至少一行（见文件头第 3 条），否则永远量不到真实高度。
	*/
	function visibleRange(metrics, scrollOffset, viewportSize, overscan = 0) {
		const count = metrics.ids.length;
		if (count === 0) return {
			start: 0,
			end: 0,
			padTop: 0,
			padBottom: 0
		};
		const offset = Math.max(0, Number.isFinite(scrollOffset) ? scrollOffset : 0);
		const viewport = Math.max(0, Number.isFinite(viewportSize) ? viewportSize : 0);
		const buffer = Math.max(0, Math.floor(Number.isFinite(overscan) ? overscan : 0));
		const start = Math.max(0, indexAtOffset(metrics, offset) - buffer);
		const end = Math.min(count, indexAtOffset(metrics, offset + viewport) + 1 + buffer);
		return {
			start,
			end: Math.max(start, end),
			padTop: metrics.offsets[start],
			padBottom: metrics.total - metrics.offsets[end]
		};
	}
	/** 滚动位置夹进合法范围：内容比视口还短时只能停在 0。 */
	function clampScrollOffset(offset, metrics, viewportSize) {
		const viewport = Math.max(0, Number.isFinite(viewportSize) ? viewportSize : 0);
		const max = Math.max(0, metrics.total - viewport);
		return Math.min(Math.max(0, Number.isFinite(offset) ? offset : 0), max);
	}
	/** 记住"视口顶部是哪一行、被滚过去了多少"，供数据更新后还原。空列表没有锚点。 */
	function anchorAt(metrics, scrollOffset) {
		if (metrics.ids.length === 0) return void 0;
		const offset = Math.max(0, Number.isFinite(scrollOffset) ? scrollOffset : 0);
		const index = indexAtOffset(metrics, offset);
		const id = metrics.ids[index];
		if (id === void 0) return void 0;
		return {
			id,
			delta: offset - metrics.offsets[index]
		};
	}
	/**
	* 数据更新后要还原到的滚动位置。
	*
	* 锚点行被删掉时返回 `undefined`——猜一个位置会让用户从"读第 3 条"跳到"第 1 条"，
	* 保持当前滚动位置反而是唯一不突兀的选择。调用方负责再夹一次范围。
	*/
	function scrollTopForAnchor(metrics, anchor) {
		const index = metrics.ids.indexOf(anchor.id);
		if (index < 0) return void 0;
		return metrics.offsets[index] + anchor.delta;
	}
	//#endregion
	//#region src/vue/virtual-list.ts
	/**
	* `OjVirtualList`（03 §3 D 组）：变高虚拟列表，带 `scrollToIndex` 与锚点稳定。
	*
	* 只渲染 `visibleRange()` 给出的窗口，其余高度由 spacer 撑着。三条不变量：
	*   - **向上插入不跳**：数据更新前记下"视口顶部那一行 + 偏移"，更新后还原；锚点行被删掉时
	*     保持当前滚动位置（猜一个位置只会让用户从头找）。
	*   - **测量只改被量那一行之后的偏移**，前面的行纹丝不动，所以测量期不会抖。
	*   - **视口高度优先用 `viewportSize`**，没给才量容器（`ResizeObserver`）。放在首帧被折叠的
	*     侧栏里时容器高度是 0，只看容器会让列表永远不渲染、尺寸也永远补不上。
	*
	* 组件不猜行高：行内容通过默认插槽渲染，由宿主在挂载/变化时调用 `measure(height)`；
	* 想完全托管高度也可以直接把 `size` 写进 `items`。
	*/
	var OjVirtualList = (0, vue.defineComponent)({
		name: "OjVirtualList",
		props: {
			items: {
				type: Array,
				required: true
			},
			/** 未测量行的估算高度（px）。估得越准，首次滚动时的跳动越小。 */
			estimateSize: {
				type: Number,
				required: true
			},
			/** 视口上下各多渲染的行数：滚动时先看到白块再蹦出内容，多半就是少了这一圈。 */
			overscan: {
				type: Number,
				default: 3
			},
			/** 视口高度（px）。传 0 表示由容器实际高度决定。 */
			viewportSize: {
				type: Number,
				default: 0
			},
			/** 滚动区域的可访问名（"批注列表"）。 */
			label: {
				type: String,
				required: true
			}
		},
		setup(props, { slots, expose }) {
			const scroller = (0, vue.ref)(null);
			const scrolled = (0, vue.ref)(0);
			const containerHeight = (0, vue.ref)(0);
			/** 宿主量到的高度按 id 存：行被回收后再滚回来不必重量一次。 */
			const measured = /* @__PURE__ */ new Map();
			const metrics = (0, vue.shallowRef)(createMetrics(props.items, props.estimateSize));
			const viewport = (0, vue.computed)(() => props.viewportSize > 0 ? props.viewportSize : containerHeight.value);
			const viewportWindow = (0, vue.computed)(() => visibleRange(metrics.value, scrolled.value, viewport.value, props.overscan));
			let observer;
			function applyScroll(offset) {
				const element = scroller.value;
				if (element !== null) element.scrollTop = offset;
			}
			function scrollToIndex(index, align = "start") {
				const current = metrics.value;
				if (current.ids.length === 0) return;
				const target = Math.min(Math.max(Math.floor(index), 0), current.ids.length - 1);
				const rowOffset = current.offsets[target];
				const rowSize = current.sizes[target];
				const view = viewport.value;
				const next = clampScrollOffset(align === "end" ? rowOffset + rowSize - view : align === "center" ? rowOffset + rowSize / 2 - view / 2 : rowOffset, current, view);
				scrolled.value = next;
				(0, vue.nextTick)(() => applyScroll(next));
			}
			function measure(index, height) {
				const item = props.items[index];
				if (item === void 0) return;
				measured.set(item.id, height);
				const next = measureItem(metrics.value, index, height);
				if (next !== metrics.value) metrics.value = next;
			}
			(0, vue.watch)(() => props.items, (next) => {
				const anchor = anchorAt(metrics.value, scrolled.value);
				metrics.value = createMetrics(next.map((item) => {
					var _measured$get;
					const size = (_measured$get = measured.get(item.id)) !== null && _measured$get !== void 0 ? _measured$get : item.size;
					return size === void 0 ? { id: item.id } : {
						id: item.id,
						size
					};
				}), props.estimateSize);
				const restored = anchor === void 0 ? void 0 : scrollTopForAnchor(metrics.value, anchor);
				const offset = clampScrollOffset(restored !== null && restored !== void 0 ? restored : scrolled.value, metrics.value, viewport.value);
				scrolled.value = offset;
				(0, vue.nextTick)(() => applyScroll(offset));
			}, { flush: "pre" });
			(0, vue.onMounted)(() => {
				const element = scroller.value;
				if (element === null) return;
				containerHeight.value = element.clientHeight;
				if (typeof ResizeObserver !== "function") return;
				observer = new ResizeObserver((entries) => {
					var _entries$;
					const rect = (_entries$ = entries[0]) === null || _entries$ === void 0 ? void 0 : _entries$.contentRect;
					if (rect !== void 0) containerHeight.value = rect.height;
				});
				observer.observe(element);
			});
			(0, vue.onBeforeUnmount)(() => {
				observer === null || observer === void 0 || observer.disconnect();
				observer = void 0;
			});
			expose({ scrollToIndex });
			return () => {
				const current = metrics.value;
				const window = viewportWindow.value;
				const rows = props.items.slice(window.start, window.end).map((item, offset) => {
					var _slots$default;
					const index = window.start + offset;
					return (_slots$default = slots.default) === null || _slots$default === void 0 ? void 0 : _slots$default.call(slots, {
						item,
						index,
						measure: (height) => measure(index, height)
					});
				});
				return (0, vue.h)("div", {
					class: "oj-virtual-list",
					ref: scroller,
					role: "list",
					"aria-label": props.label,
					tabindex: 0,
					onScroll: (event) => {
						scrolled.value = event.currentTarget.scrollTop;
					}
				}, [(0, vue.h)("div", {
					class: "oj-virtual-list__spacer",
					style: { height: `${current.total}px` }
				}, [(0, vue.h)("div", {
					class: "oj-virtual-list__window",
					style: { transform: `translateY(${window.padTop}px)` }
				}, rows)])]);
			};
		}
	});
	function finite(value, fallback) {
		return value !== void 0 && Number.isFinite(value) ? value : fallback;
	}
	function between(value, min, max) {
		return Math.min(Math.max(value, min), max);
	}
	function isFloating(state) {
		return state.side === "floating";
	}
	/** 收起只是不画内容，标题栏必须留着——否则收起的面板就再也点不开了。 */
	function toggleCollapsed(state) {
		return {
			...state,
			collapsed: !state.collapsed
		};
	}
	/** 浮出。保留 `docked`，`float` 矩形也原样带回。 */
	function undock(state) {
		if (state.side === "floating") return state;
		return {
			...state,
			side: "floating"
		};
	}
	/** 回到上次停靠的那一侧（不是默认那一侧）。 */
	function redock(state) {
		if (state.side !== "floating") return state;
		return {
			...state,
			side: state.docked
		};
	}
	/**
	* 把浮动矩形夹回"抓得住"的范围。
	*
	* 横向允许左边缘移出到只剩一条标题栏（`FLOAT_GRAB_STRIP`），纵向不允许上边缘出界：
	* 标题栏被顶到视口上方时连拖动入口都没有了。
	*/
	function clampFloatRect(rect, viewport) {
		const width = Math.max(1, finite(rect.width, 320));
		const height = Math.max(1, finite(rect.height, 480));
		const minX = 48 - width;
		const maxX = Math.max(minX, finite(viewport.width, 0) - 48);
		const maxY = Math.max(0, finite(viewport.height, 0) - 48);
		return {
			x: between(finite(rect.x, 0), minX, maxX),
			y: between(finite(rect.y, 0), 0, maxY),
			width,
			height
		};
	}
	//#endregion
	//#region src/vue/dock-panel.ts
	/**
	* `OjDockPanel`（03 §3 D 组）：可停靠 / 浮动 / 收起的侧栏面板（属性面板、AI 任务面板）。
	*
	* 状态全在 `state` 里（受控）：组件只发 `update:state`，自己不记"停在哪、浮在哪"。
	* 理由很实际——面板位置要随会话保存、要跟着预设切换（合同审阅用右栏、写作用左栏），
	* 组件内部再存一份就一定会与宿主的真值分叉。
	*
	* 三条容易做错的：
	*   - **收起后标题栏必须还在**。整个面板隐藏掉，用户就再也找不到展开入口；
	*   - **浮动时按标题栏拖动，按钮不算拖动区**。不排除按钮，点"收起"会顺带把面板拖走几像素；
	*   - **位置夹取在拖动时就做**（`clampFloatRect`），不是松手后。松手才修正等于允许用户把面板
	*     拖出屏幕，然后眼睁睁看它跳回来。
	*
	* 停靠尺寸不归这里管：那是 `OjPaneGroup` 的栏位尺寸，由分隔条调。
	*/
	var OjDockPanel = (0, vue.defineComponent)({
		name: "OjDockPanel",
		props: {
			state: {
				type: Object,
				required: true
			},
			/** 面板标题，同时作为 region 的可访问名。 */
			title: {
				type: String,
				required: true
			},
			collapseLabel: {
				type: String,
				required: true
			},
			expandLabel: {
				type: String,
				required: true
			},
			/** 浮出按钮的可访问名（"浮动"）。 */
			floatLabel: {
				type: String,
				required: true
			},
			/** 停靠按钮的可访问名（"停靠"）。 */
			dockLabel: {
				type: String,
				required: true
			}
		},
		emits: ["update:state"],
		setup(props, { emit, slots }) {
			const dragging = (0, vue.ref)(false);
			let originX = 0;
			let originY = 0;
			let originRect;
			function viewport() {
				if (typeof window === "undefined") return {
					width: 0,
					height: 0
				};
				return {
					width: window.innerWidth,
					height: window.innerHeight
				};
			}
			function commit(next) {
				if (next !== props.state) emit("update:state", next);
			}
			function capture(element, pointerId) {
				try {
					element === null || element === void 0 || element.setPointerCapture(pointerId);
				} catch (_unused) {}
			}
			function onPointerdown(event) {
				var _event$target, _event$target$closest;
				if (!isFloating(props.state) || event.button !== 0) return;
				if (((_event$target = event.target) === null || _event$target === void 0 || (_event$target$closest = _event$target.closest) === null || _event$target$closest === void 0 ? void 0 : _event$target$closest.call(_event$target, "button")) !== null) return;
				event.preventDefault();
				capture(event.currentTarget, event.pointerId);
				dragging.value = true;
				originX = event.clientX;
				originY = event.clientY;
				originRect = props.state.float;
			}
			function onPointermove(event) {
				if (!dragging.value || originRect === void 0) return;
				const rect = clampFloatRect({
					...originRect,
					x: originRect.x + (event.clientX - originX),
					y: originRect.y + (event.clientY - originY)
				}, viewport());
				if (rect.x === props.state.float.x && rect.y === props.state.float.y) return;
				commit({
					...props.state,
					float: rect
				});
			}
			function finish(event) {
				if (!dragging.value) return;
				dragging.value = false;
				originRect = void 0;
				const target = event.currentTarget;
				try {
					if ((target === null || target === void 0 ? void 0 : target.hasPointerCapture(event.pointerId)) === true) target.releasePointerCapture(event.pointerId);
				} catch (_unused2) {}
			}
			return () => {
				var _slots$default;
				const state = props.state;
				const floating = isFloating(state);
				return (0, vue.h)("section", {
					class: "oj-dock",
					"data-side": state.side,
					"data-collapsed": state.collapsed ? "" : void 0,
					"data-dragging": dragging.value ? "" : void 0,
					"aria-label": props.title,
					style: floating ? {
						left: `${state.float.x}px`,
						top: `${state.float.y}px`,
						width: `${state.float.width}px`,
						height: state.collapsed ? void 0 : `${state.float.height}px`
					} : void 0
				}, [(0, vue.h)("header", {
					class: "oj-dock__header",
					onPointerdown,
					onPointermove,
					onPointerup: finish,
					onPointercancel: finish
				}, [
					(0, vue.h)("h2", { class: "oj-dock__title" }, props.title),
					(0, vue.h)("button", {
						type: "button",
						class: "oj-dock__collapse",
						"aria-expanded": state.collapsed ? "false" : "true",
						"aria-label": state.collapsed ? props.expandLabel : props.collapseLabel,
						title: state.collapsed ? props.expandLabel : props.collapseLabel,
						onClick: () => commit(toggleCollapsed(state))
					}, state.collapsed ? "▸" : "▾"),
					(0, vue.h)("button", {
						type: "button",
						class: "oj-dock__float",
						"aria-pressed": floating ? "true" : "false",
						"aria-label": floating ? props.dockLabel : props.floatLabel,
						title: floating ? props.dockLabel : props.floatLabel,
						onClick: () => commit(floating ? redock(state) : undock(state))
					}, floating ? "⇲" : "⇱")
				]), state.collapsed ? null : (0, vue.h)("div", { class: "oj-dock__body" }, (_slots$default = slots.default) === null || _slots$default === void 0 ? void 0 : _slots$default.call(slots))]);
			};
		}
	});
	//#endregion
	//#region src/shell/upload.ts
	/** 0..1。大小为 0 的项没有"进度"，只有"完成没完成"。 */
	function uploadPercent(item) {
		if (item.size <= 0) return item.state === "done" ? 1 : 0;
		return Math.min(1, Math.max(0, item.loaded / item.size));
	}
	function uploadSummary(items) {
		let done = 0;
		let failed = 0;
		let active = 0;
		let loaded = 0;
		let size = 0;
		for (const item of items) {
			if (item.state === "done") done += 1;
			else if (item.state === "failed") failed += 1;
			else active += 1;
			loaded += item.loaded;
			size += item.size;
		}
		const percent = size > 0 ? loaded / size : items.length > 0 && done === items.length ? 1 : 0;
		return {
			count: items.length,
			done,
			failed,
			active,
			loaded,
			size,
			percent
		};
	}
	//#endregion
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
				const summary = uploadSummary(props.items);
				if (props.items.length === 0) return props.emptyLabel === "" ? null : (0, vue.h)("p", { class: "oj-upload-progress__empty" }, props.emptyLabel);
				const rows = props.items.map((item) => {
					var _props$statusLabels$i;
					const percent = uploadPercent(item);
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
							}, (_props$statusLabels$i = props.statusLabels[item.state]) !== null && _props$statusLabels$i !== void 0 ? _props$statusLabels$i : ""),
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
	//#region src/shell/drop-zone.ts
	/**
	* 按 `DataTransfer.types` 判断载荷种类。`types` 是**小写**的 MIME 列表，不是文件名。
	*
	* 顺序即优先级：文件优先于富文本，富文本优先于纯文本（前者信息更全）。
	* 同时带 `text/html` 与 `text/plain` 是浏览器对富文本的常规做法，取 html 才不会丢掉格式。
	*/
	function classifyTransfer(types) {
		let html = false;
		let text = false;
		for (const entry of types) {
			const value = entry.trim().toLowerCase();
			if (value === "files" || value === "application/x-moz-file") return "files";
			if (value === "text/html") html = true;
			else if (value === "text/plain") text = true;
		}
		return html ? "html" : text ? "text" : "none";
	}
	/** 扩展名（小写、带点）。没有扩展名或点在开头（`.gitignore`）时返回空串。 */
	function extensionOf(name) {
		const index = name.lastIndexOf(".");
		if (index <= 0 || index === name.length - 1) return "";
		return name.slice(index).toLowerCase();
	}
	/** 单个文件是否被受理。`accept.types` 为空/未给时一律受理。 */
	function acceptsFile(file, accept) {
		var _accept$types, _file$type;
		const types = (_accept$types = accept.types) !== null && _accept$types !== void 0 ? _accept$types : [];
		if (types.length === 0) return true;
		const extension = extensionOf(file.name);
		const mime = ((_file$type = file.type) !== null && _file$type !== void 0 ? _file$type : "").toLowerCase();
		for (const entry of types) {
			const rule = entry.trim().toLowerCase();
			if (rule.length === 0) continue;
			if (rule.startsWith(".")) {
				if (extension === rule) return true;
				continue;
			}
			if (rule.endsWith("/*")) {
				if (mime.startsWith(rule.slice(0, -1))) return true;
				continue;
			}
			if (mime === rule) return true;
		}
		return false;
	}
	/**
	* 一次拖放的整体判定。`multiple: false` 时**只收第一个**，其余算数量超限。
	*
	* 不把"多选"当格式错误：这两种拒绝在界面上要给的提示完全不同
	* （"这个格式不支持" vs "一次只能传一个"），混成一条会让用户改错方向。
	*/
	function selectDropped(files, accept) {
		const multiple = accept.multiple !== false;
		const accepted = [];
		let rejected;
		for (const file of files) {
			if (!acceptsFile(file, accept)) {
				rejected = "type";
				continue;
			}
			if (!multiple && accepted.length >= 1) {
				if (rejected === void 0) rejected = "count";
				continue;
			}
			accepted.push(file);
		}
		return {
			accepted,
			rejected
		};
	}
	//#endregion
	//#region src/shell/drag-context.ts
	/**
	* 拖放协议：区分**内部拖拽**与**外部拖入**（03 §3 D 组 `OjDragDropContext`，§8.9 类型协商）。
	*
	* 不看 MIME 就统一处理，是本项目里最容易犯的错：
	*   - 把"拖动文档里选中的一段字"当成"拖进来一个文件"，弹"只收 .docx"；
	*   - 把"从桌面拖进来的文件"当成内部拖动，直接插进正文变成一段二进制乱码。
	*
	* 判定靠一个私有 MIME 标记：内部拖拽在 `dragstart` 里写进 `DRAG_MARKER`，
	* 外部来源不可能带这个类型。相比"记住鼠标按下了"之类的猜测，这是唯一稳定的信号。
	*/
	/** 内部拖拽标记。私有 MIME 不会被任何外部应用发出。 */
	var DRAG_MARKER = "application/x-oj-drag";
	function safeGetData(transfer, format) {
		try {
			return transfer.getData(format);
		} catch (_unused) {
			return "";
		}
	}
	/**
	* 读一次拖放载荷。`types` 里带标记就是内部拖拽，此时不再当文件处理——
	* 内部拖拽同样会带 `text/html`，只看那些类型永远分不开。
	*/
	function readTransfer(transfer) {
		const files = [...transfer.files];
		const internal = transfer.types.some((type) => type.trim().toLowerCase() === DRAG_MARKER);
		return {
			kind: internal ? "internal" : classifyTransfer(transfer.types),
			files,
			html: safeGetData(transfer, "text/html"),
			text: safeGetData(transfer, "text/plain"),
			data: internal ? safeGetData(transfer, DRAG_MARKER) : ""
		};
	}
	/** MIME 规则（含通配）能否命中这次拖拽。拖入阶段拿不到文件名，只能按类型先判。 */
	function mimeMatches(types, rules) {
		const actual = types.map((type) => type.trim().toLowerCase());
		return rules.some((rule) => {
			const value = rule.trim().toLowerCase();
			const slash = value.indexOf("/");
			if (slash <= 0) return false;
			if (value.endsWith("/*")) {
				const prefix = value.slice(0, slash + 1);
				return actual.some((type) => type.startsWith(prefix));
			}
			return actual.includes(value);
		});
	}
	/**
	* 这次拖拽是否归我们处理。
	*
	* 文件分支的规则很别扭但必须这样：`accept.types` 里只有扩展名（`.docx`）时，
	* 拖入阶段**没有文件名**，只能放行，等 `drop` 再靠 `selectDropped` 判；
	* 反过来若按"扩展名不匹配 MIME"直接拒绝，用户会看到遮罩根本不出现，也就再没法导入。
	* 含 `/` 的规则（`application/pdf`、`image/*`）则必须命中，能提前挡掉明显不对的拖拽。
	*/
	function negotiateTransfer(types, accept = {}) {
		if (types.some((type) => type.trim().toLowerCase() === "application/x-oj-drag")) return true;
		const kind = classifyTransfer(types);
		if (kind === "files") {
			var _accept$types;
			const mimeRules = ((_accept$types = accept.types) !== null && _accept$types !== void 0 ? _accept$types : []).filter((rule) => rule.includes("/"));
			if (mimeRules.length === 0) return true;
			return mimeMatches(types, mimeRules);
		}
		if (kind === "none") return false;
		return accept.text === true;
	}
	//#endregion
	//#region src/vue/drag-context.ts
	var OJ_DRAG_CONTEXT = Symbol("oj-drag-context");
	/** 子组件读取上下文。没有 `OjDragContext` 包裹时返回 `undefined`，调用方按"不在拖拽"处理。 */
	function useOjDragContext() {
		return (0, vue.inject)(OJ_DRAG_CONTEXT);
	}
	/**
	* `OjDragContext`（03 §3 D 组）：拖放协议的统一入口，区分内部拖拽与外部拖入。
	*
	* 与 `OjDropZone` 的分工：`OjDropZone` 是"整页遮罩 + 文件受理"的成品；
	* 这里是"协议层"——不画遮罩，只判断这次拖拽归谁、是什么载荷，然后上抛。
	* 需要"拖拽高亮 + 内部排序 + 外部文件导入"同屏共存时用这个。
	*
	* 组件本身不产生盒子（`display: contents`）：它套在布局外面，但布局仍由内部的
	* 分栏/网格决定。`data-kind` / `data-dragging` 落在包裹元素上，宿主用属性选择器做高亮。
	*/
	var OjDragContext = (0, vue.defineComponent)({
		name: "OjDragContext",
		props: {
			accept: {
				type: Object,
				default: () => ({})
			},
			disabled: {
				type: Boolean,
				default: false
			}
		},
		emits: [
			"enter",
			"leave",
			"drop"
		],
		setup(props, { emit, slots }) {
			const dragging = (0, vue.ref)(false);
			const kind = (0, vue.ref)("none");
			const data = (0, vue.ref)("");
			let depth = 0;
			(0, vue.provide)(OJ_DRAG_CONTEXT, {
				dragging,
				kind,
				data
			});
			function payloadOf(transfer) {
				return readTransfer({
					types: [...transfer.types],
					files: Array.from(transfer.files),
					getData: (format) => transfer.getData(format)
				});
			}
			function reset() {
				depth = 0;
				dragging.value = false;
				kind.value = "none";
				data.value = "";
			}
			function onDragEnter(event) {
				var _event$dataTransfer$t, _event$dataTransfer;
				if (props.disabled) return;
				const types = (_event$dataTransfer$t = (_event$dataTransfer = event.dataTransfer) === null || _event$dataTransfer === void 0 ? void 0 : _event$dataTransfer.types) !== null && _event$dataTransfer$t !== void 0 ? _event$dataTransfer$t : [];
				if (!negotiateTransfer(types, props.accept)) return;
				depth += 1;
				dragging.value = true;
				const preview = readTransfer({
					types,
					files: [],
					getData: () => ""
				});
				kind.value = preview.kind;
				data.value = preview.data;
				emit("enter", preview.kind);
			}
			function onDragOver(event) {
				if (props.disabled || !dragging.value) return;
				event.preventDefault();
				if (event.dataTransfer !== null) event.dataTransfer.dropEffect = kind.value === "internal" ? "move" : "copy";
			}
			function onDragLeave(event) {
				if (event.relatedTarget === null) {
					reset();
					emit("leave");
					return;
				}
				depth = Math.max(0, depth - 1);
				if (depth > 0) return;
				dragging.value = false;
				kind.value = "none";
				data.value = "";
				emit("leave");
			}
			function onDrop(event) {
				if (props.disabled) return;
				const transfer = event.dataTransfer;
				if (transfer === null) {
					reset();
					return;
				}
				if (!negotiateTransfer([...transfer.types], props.accept)) {
					reset();
					return;
				}
				event.preventDefault();
				const payload = payloadOf(transfer);
				reset();
				if ((payload.kind === "html" || payload.kind === "text") && props.accept.text !== true) return;
				emit("drop", payload);
			}
			(0, vue.onMounted)(() => {
				if (typeof window === "undefined") return;
				window.addEventListener("dragenter", onDragEnter);
				window.addEventListener("dragover", onDragOver);
				window.addEventListener("dragleave", onDragLeave);
				window.addEventListener("drop", onDrop);
				window.addEventListener("dragend", reset);
			});
			(0, vue.onBeforeUnmount)(() => {
				if (typeof window === "undefined") return;
				window.removeEventListener("dragenter", onDragEnter);
				window.removeEventListener("dragover", onDragOver);
				window.removeEventListener("dragleave", onDragLeave);
				window.removeEventListener("drop", onDrop);
				window.removeEventListener("dragend", reset);
			});
			return () => {
				var _slots$default;
				return (0, vue.h)("div", {
					class: "oj-drag-context",
					"data-dragging": dragging.value ? "" : void 0,
					"data-kind": kind.value === "none" ? void 0 : kind.value
				}, (_slots$default = slots.default) === null || _slots$default === void 0 ? void 0 : _slots$default.call(slots));
			};
		}
	});
	//#endregion
	//#region src/shell/share.ts
	/**
	* 共享权限模型（03 §3 E 组 `OjShareDialog`）。
	*
	* 这里只做一件容易被做错的事：**决定"实际发出去的是什么权限"**。
	*
	* 界面上的选择组合不都是合法的：`private` 没有角色，`link` 不该给"可编辑"（拿到链接就能改），
	* 有效期只对链接有意义。把归一化放进组件，就会出现"界面上选了可编辑、请求里发的是可评论"，
	* 谁也不知道到底给了什么权限。所以：范围切换时把角色降级，`resolveShare()` 给出真正生效的值。
	*/
	var SHARE_SCOPES = [
		"private",
		"link",
		"org",
		"people"
	];
	/** 各范围允许的角色。链接范围不给"可编辑"：链接会被转发，转发的人不该顺带给出编辑权。 */
	var ROLES_BY_SCOPE = {
		private: [],
		link: ["viewer", "commenter"],
		org: [
			"viewer",
			"commenter",
			"editor"
		],
		people: [
			"viewer",
			"commenter",
			"editor"
		]
	};
	var SHARE_MAX_EXPIRY_DAYS = 3650;
	var SHARE_MAX_PEOPLE = 9999;
	function rolesForScope(scope) {
		return ROLES_BY_SCOPE[scope];
	}
	function whole(value, fallback, max) {
		if (value === void 0 || !Number.isFinite(value)) return fallback;
		return Math.min(Math.max(0, Math.floor(value)), max);
	}
	function allowedRole(scope, role) {
		var _allowed$;
		const allowed = ROLES_BY_SCOPE[scope];
		if (allowed.includes(role)) return role;
		return (_allowed$ = allowed[0]) !== null && _allowed$ !== void 0 ? _allowed$ : role;
	}
	/** 切范围时顺手把角色降级到合法值：界面上不会出现"当前范围根本不允许的角色"。 */
	function setShareScope(state, scope) {
		const role = allowedRole(scope, state.role);
		if (scope === state.scope && role === state.role) return state;
		return {
			...state,
			scope,
			role
		};
	}
	/** 选角色。当前范围不允许的角色直接忽略（UI 不该放出这种选项，但宿主可能直接调）。 */
	function setShareRole(state, role) {
		if (state.role === role) return state;
		if (!ROLES_BY_SCOPE[state.scope].includes(role)) return state;
		return {
			...state,
			role
		};
	}
	/** 链接有效期。只影响 `link`；负数/NaN 归 0（永久）。 */
	function setShareExpiry(state, days) {
		const expiryDays = whole(days, state.expiryDays, SHARE_MAX_EXPIRY_DAYS);
		if (expiryDays === state.expiryDays) return state;
		return {
			...state,
			expiryDays
		};
	}
	function setSharePeopleCount(state, count) {
		const peopleCount = whole(count, state.peopleCount, SHARE_MAX_PEOPLE);
		if (peopleCount === state.peopleCount) return state;
		return {
			...state,
			peopleCount
		};
	}
	/**
	* 归一化后的权限——真正该发给后端的东西。
	*
	* 不做这一步，就会出现"界面显示可评论、实际给了可编辑"或反过来的事故：
	* 两类信息（范围、角色）在 UI 上互相覆盖，只有一处能算出最终值才不会分叉。
	*/
	function resolveShare(state) {
		if (state.scope === "private") return {
			scope: state.scope,
			role: void 0,
			expiryDays: void 0,
			peopleCount: void 0
		};
		return {
			scope: state.scope,
			role: allowedRole(state.scope, state.role),
			expiryDays: state.scope === "link" ? state.expiryDays : void 0,
			peopleCount: state.scope === "people" ? state.peopleCount : void 0
		};
	}
	//#endregion
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
	var OjShareDialog = (0, vue.defineComponent)({
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
				return (0, vue.h)("label", {
					class: "oj-share__option",
					"data-active": active ? "" : void 0
				}, [(0, vue.h)("input", {
					class: "oj-share__radio",
					type: "radio",
					name: "oj-share-scope",
					value: scope,
					checked: active,
					onChange: () => emit("update:state", setShareScope(props.state, scope))
				}), (0, vue.h)("span", { class: "oj-share__option-text" }, props.scopeLabels[scope])]);
			}
			function role(role) {
				const active = props.state.role === role;
				return (0, vue.h)("label", {
					class: "oj-share__option",
					"data-active": active ? "" : void 0
				}, [(0, vue.h)("input", {
					class: "oj-share__radio",
					type: "radio",
					name: "oj-share-role",
					value: role,
					checked: active,
					onChange: () => emit("update:state", setShareRole(props.state, role))
				}), (0, vue.h)("span", { class: "oj-share__option-text" }, props.roleLabels[role])]);
			}
			return () => {
				const roles = rolesForScope(props.state.scope);
				const body = [(0, vue.h)("fieldset", { class: "oj-share__group" }, [(0, vue.h)("legend", { class: "oj-share__legend" }, props.scopeLabel), ...SHARE_SCOPES.map(option)])];
				if (roles.length > 0) body.push((0, vue.h)("fieldset", { class: "oj-share__group" }, [(0, vue.h)("legend", { class: "oj-share__legend" }, props.roleLabel), ...roles.map(role)]));
				if (props.state.scope === "link" && props.expiryOptions.length > 0) body.push((0, vue.h)("label", { class: "oj-share__field" }, [(0, vue.h)("span", { class: "oj-share__field-label" }, props.expiryLabel), (0, vue.h)("select", {
					class: "oj-share__select",
					value: String(props.state.expiryDays),
					onChange: (event) => emit("update:state", setShareExpiry(props.state, Number(event.target.value)))
				}, props.expiryOptions.map((choice) => (0, vue.h)("option", {
					value: String(choice.days),
					selected: choice.days === props.state.expiryDays
				}, choice.label)))]));
				if (props.state.scope === "people" && props.peopleLabel !== "") body.push((0, vue.h)("label", { class: "oj-share__field" }, [(0, vue.h)("span", { class: "oj-share__field-label" }, props.peopleLabel), (0, vue.h)("input", {
					class: "oj-share__count",
					type: "number",
					min: 0,
					value: String(props.state.peopleCount),
					onChange: (event) => emit("update:state", setSharePeopleCount(props.state, Number(event.target.value)))
				})]));
				return (0, vue.h)(OjDialog, {
					open: props.open,
					title: props.title,
					confirmLabel: props.confirmLabel,
					cancelLabel: props.cancelLabel,
					teleport: props.teleport,
					onConfirm: () => emit("confirm", resolveShare(props.state)),
					onCancel: () => emit("cancel"),
					"onUpdate:open": (open) => emit("update:open", open)
				}, { default: () => (0, vue.h)("div", { class: "oj-share" }, body) });
			};
		}
	});
	//#endregion
	//#region src/vue/drop-zone.ts
	var EMPTY_LABELS = {};
	/**
	* `OjDropZone`（03 §3 F 组）：拖放导入 + 整页遮罩 + 类型校验 + 多文件 + 粘贴图片。
	*
	* 三个"不做就会错"的点：
	*   - **按 `DataTransfer.types` 分支**（03 §8.9）。文件、`text/html`、`text/plain` 是三种载荷，
	*     不分支会把"从网页拖一段文字"判成"格式不支持的文件"，提示方向完全相反。
	*     文本分支默认关闭（`textPayload`），否则拖选区内文字也会弹出导入遮罩。
	*   - **整页遮罩用计数器进出**。`dragenter` / `dragleave` 在子元素间移动时会成对触发，
	*     只看单个事件会让遮罩疯狂闪；只有计数归零（或 `relatedTarget === null` 离开窗口）才收起。
	*   - **拒绝要说出原因**。`type`（格式不支持）与 `count`（一次只能一个）是两句话，
	*     混成"导入失败"会让用户改错方向。
	*
	* 全页监听而不是只监听根元素：文档编辑器的拖放目标是画布/文档区，不是这个包裹层；
	* 遮罩本身 `pointer-events: none`，不会挡住 `drop`。代价要写在明面上——**一个页面只应有的一个实例**：
	* 同页挂两个会各自收到同一次 drop / paste（需要区分时由宿主拆页面，或把整个应用包进一个实例）。
	*/
	var OjDropZone = (0, vue.defineComponent)({
		name: "OjDropZone",
		props: {
			accept: {
				type: Object,
				default: () => ({})
			},
			disabled: {
				type: Boolean,
				default: false
			},
			/** 遮罩主文案（"松开以导入"）。 */
			title: {
				type: String,
				required: true
			},
			/** 遮罩副文案（"支持 .docx / .pdf，最多 5 个"），由宿主拼好。 */
			hint: {
				type: String,
				default: ""
			},
			/** 打开文件选择框的按钮文案；留空则不出现按钮。 */
			browseLabel: {
				type: String,
				default: ""
			},
			/** 两类拒绝的原因文案，按种类给（组件不拼句子）。 */
			rejectLabels: {
				type: Object,
				default: () => EMPTY_LABELS
			},
			/** 拒绝提示保留多久（ms）；`0` 表示留到下一次成功导入。 */
			messageDuration: {
				type: Number,
				default: 4e3
			},
			/** 是否接管 `text/html` / `text/plain` 拖放（富文本导入、纯文本插入）。 */
			textPayload: {
				type: Boolean,
				default: false
			}
		},
		emits: [
			"files",
			"reject",
			"insert"
		],
		setup(props, { emit, slots }) {
			const active = (0, vue.ref)(false);
			const message = (0, vue.ref)("");
			const input = (0, vue.ref)(null);
			let depth = 0;
			let timer;
			function clearTimer() {
				if (timer === void 0) return;
				clearTimeout(timer);
				timer = void 0;
			}
			function arm() {
				clearTimer();
				if (props.messageDuration <= 0) return;
				timer = setTimeout(() => {
					message.value = "";
					timer = void 0;
				}, props.messageDuration);
			}
			function reject(reason) {
				var _props$rejectLabels$r;
				const text = (_props$rejectLabels$r = props.rejectLabels[reason]) !== null && _props$rejectLabels$r !== void 0 ? _props$rejectLabels$r : "";
				message.value = text;
				arm();
				emit("reject", reason);
			}
			function deliver(files) {
				const selection = selectDropped(files.map((file) => ({
					name: file.name,
					type: file.type,
					file
				})), props.accept);
				if (selection.accepted.length > 0) {
					message.value = "";
					clearTimer();
					emit("files", selection.accepted.map((entry) => entry.file));
				}
				if (selection.rejected !== void 0) reject(selection.rejected);
			}
			/** 这一次拖放要不要接管：文件总是接管；文本只在显式开启时接管。 */
			function interested(types) {
				const kind = classifyTransfer(types);
				if (kind === "files") return true;
				return props.textPayload && kind !== "none";
			}
			function reset() {
				depth = 0;
				active.value = false;
			}
			function onDragEnter(event) {
				var _event$dataTransfer$t, _event$dataTransfer;
				if (props.disabled) return;
				if (!interested((_event$dataTransfer$t = (_event$dataTransfer = event.dataTransfer) === null || _event$dataTransfer === void 0 ? void 0 : _event$dataTransfer.types) !== null && _event$dataTransfer$t !== void 0 ? _event$dataTransfer$t : [])) return;
				depth += 1;
				active.value = true;
			}
			function onDragOver(event) {
				if (props.disabled) return;
				if (!active.value) {
					var _event$dataTransfer$t2, _event$dataTransfer2;
					if (!interested((_event$dataTransfer$t2 = (_event$dataTransfer2 = event.dataTransfer) === null || _event$dataTransfer2 === void 0 ? void 0 : _event$dataTransfer2.types) !== null && _event$dataTransfer$t2 !== void 0 ? _event$dataTransfer$t2 : [])) return;
					depth = 1;
					active.value = true;
				}
				event.preventDefault();
				if (event.dataTransfer !== null) event.dataTransfer.dropEffect = "copy";
			}
			function onDragLeave(event) {
				if (event.relatedTarget === null) {
					reset();
					return;
				}
				depth = Math.max(0, depth - 1);
				if (depth === 0) active.value = false;
			}
			function onDrop(event) {
				reset();
				if (props.disabled) return;
				const transfer = event.dataTransfer;
				if (transfer === null) return;
				const kind = classifyTransfer(transfer.types);
				if (kind === "none") return;
				event.preventDefault();
				if (kind === "files") {
					deliver(Array.from(transfer.files));
					return;
				}
				if (!props.textPayload) return;
				const payload = {
					html: transfer.getData("text/html"),
					text: transfer.getData("text/plain")
				};
				if (payload.html === "" && payload.text === "") return;
				emit("insert", payload);
			}
			/** 粘贴只接管带文件的剪贴板（截图、复制的图片）；纯文本必须原样留给宿主。 */
			function onPaste(event) {
				var _event$clipboardData;
				if (props.disabled) return;
				const files = (_event$clipboardData = event.clipboardData) === null || _event$clipboardData === void 0 ? void 0 : _event$clipboardData.files;
				if (files === void 0 || files.length === 0) return;
				event.preventDefault();
				deliver(Array.from(files));
			}
			function onPick(event) {
				const element = event.target;
				const files = element.files;
				if (files !== null && files.length > 0) deliver(Array.from(files));
				element.value = "";
			}
			const acceptAttribute = (0, vue.computed)(() => {
				var _props$accept$types;
				return ((_props$accept$types = props.accept.types) !== null && _props$accept$types !== void 0 ? _props$accept$types : []).join(",");
			});
			const multiple = (0, vue.computed)(() => props.accept.multiple !== false);
			(0, vue.onMounted)(() => {
				if (typeof window === "undefined") return;
				window.addEventListener("dragenter", onDragEnter);
				window.addEventListener("dragover", onDragOver);
				window.addEventListener("dragleave", onDragLeave);
				window.addEventListener("drop", onDrop);
				window.addEventListener("dragend", reset);
				window.addEventListener("paste", onPaste);
			});
			(0, vue.onBeforeUnmount)(() => {
				if (typeof window === "undefined") return;
				window.removeEventListener("dragenter", onDragEnter);
				window.removeEventListener("dragover", onDragOver);
				window.removeEventListener("dragleave", onDragLeave);
				window.removeEventListener("drop", onDrop);
				window.removeEventListener("dragend", reset);
				window.removeEventListener("paste", onPaste);
				clearTimer();
			});
			return () => {
				var _slots$default;
				return (0, vue.h)("div", {
					class: "oj-drop-zone",
					"data-active": active.value ? "" : void 0,
					"data-disabled": props.disabled ? "" : void 0
				}, [
					(0, vue.h)("div", { class: "oj-drop-zone__body" }, (_slots$default = slots.default) === null || _slots$default === void 0 ? void 0 : _slots$default.call(slots)),
					props.browseLabel === "" ? null : (0, vue.h)("button", {
						type: "button",
						class: "oj-button oj-drop-zone__browse",
						"data-size": "mini",
						disabled: props.disabled,
						onClick: () => {
							var _input$value;
							return (_input$value = input.value) === null || _input$value === void 0 ? void 0 : _input$value.click();
						}
					}, props.browseLabel),
					(0, vue.h)("input", {
						ref: input,
						class: "oj-drop-zone__input",
						type: "file",
						tabindex: -1,
						"aria-hidden": "true",
						accept: acceptAttribute.value === "" ? void 0 : acceptAttribute.value,
						multiple: multiple.value ? "" : void 0,
						onChange: onPick
					}),
					message.value === "" ? null : (0, vue.h)("p", {
						class: "oj-drop-zone__message",
						role: "status"
					}, message.value),
					active.value ? (0, vue.h)("div", { class: "oj-drop-zone__overlay" }, [(0, vue.h)("div", { class: "oj-drop-zone__card" }, [(0, vue.h)("strong", { class: "oj-drop-zone__title" }, props.title), props.hint === "" ? null : (0, vue.h)("span", { class: "oj-drop-zone__hint" }, props.hint)])]) : null
				]);
			};
		}
	});
	//#endregion
	//#region src/shell/versions.ts
	var IDLE_RESTORE = { status: "idle" };
	/** 新的在前；时间相同保持原有顺序（`Array.prototype.sort` 是稳定排序）。 */
	function sortVersions(entries) {
		return [...entries].sort((left, right) => right.at - left.at);
	}
	/** 请求恢复：进入"待确认"。同一条重复请求返回原对象。 */
	function requestRestore(state, entryId) {
		if (state.status === "confirming" && state.entryId === entryId) return state;
		return {
			status: "confirming",
			entryId
		};
	}
	function cancelRestore(state) {
		return state.status === "idle" ? state : IDLE_RESTORE;
	}
	/** 用户点了"确认恢复"：进入执行态，组件据此上抛 `restore`。 */
	function confirmRestore(state) {
		if (state.status !== "confirming") return state;
		return {
			status: "restoring",
			entryId: state.entryId
		};
	}
	function restoreEntryId(state) {
		return state.status === "idle" ? void 0 : state.entryId;
	}
	//#endregion
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
			const restore = (0, vue.ref)(IDLE_RESTORE);
			function startRename(entry) {
				var _entry$name;
				renamingId.value = entry.id;
				draft.value = (_entry$name = entry.name) !== null && _entry$name !== void 0 ? _entry$name : "";
			}
			function cancelRename() {
				renamingId.value = null;
			}
			function commitRename() {
				var _props$entries$find$n, _props$entries$find;
				const id = renamingId.value;
				if (id === null) return;
				renamingId.value = null;
				const original = (_props$entries$find$n = (_props$entries$find = props.entries.find((entry) => entry.id === id)) === null || _props$entries$find === void 0 ? void 0 : _props$entries$find.name) !== null && _props$entries$find$n !== void 0 ? _props$entries$find$n : "";
				const name = draft.value.trim();
				if (name === original) return;
				emit("rename", id, name);
			}
			function askRestore(id) {
				restore.value = requestRestore(restore.value, id);
			}
			function cancel() {
				restore.value = cancelRestore(restore.value);
			}
			function confirm() {
				const id = restoreEntryId(confirmRestore(restore.value));
				restore.value = IDLE_RESTORE;
				if (id !== void 0) emit("restore", id);
			}
			return () => {
				const entries = sortVersions(props.entries);
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
	//#region src/vue/registry.ts
	/**
	* 名称 → 组件表（02 §4.2 / §4.3 的地基）。
	*
	* 为什么是**显式表**而不是从导出里推导：`OJ.create('oj-table-grid-picker')` 与
	* `<div data-oj="table-grid-picker">` 里的字符串是**公开契约**，写错一个字母就是运行时报
	* "找不到组件"。推导出来的名字一旦因为重构改了组件变量名就静默变化，而这层映射是给
	* 没有 TS 的 jQuery 用户用的——他们拿不到任何编译期提示。
	*
	* 键统一带 `oj-` 前缀；`resolveOjComponent` 同时接受不带前缀的简写（PRD 的 `data-oj="ribbon"`
	* 就是这么写的），两种写法在文档里都出现，不能只认一种。
	*/
	var OJ_COMPONENTS = {
		"oj-ai-panel": OjAiPanel,
		"oj-alignment-picker": OjAlignmentPicker,
		"oj-border-picker": OjBorderPicker,
		"oj-gallery": OjGallery,
		"oj-style-gallery": OjStyleGallery,
		"oj-code-block": OjCodeBlock,
		"oj-comment-thread": OjCommentThread,
		"oj-drop-zone": OjDropZone,
		"oj-file-name-header": OjFileNameHeader,
		"oj-presence-avatars": OjPresenceAvatars,
		"oj-review-panel": OjReviewPanel,
		"oj-color-picker": OjColorPicker,
		"oj-command-button": OjCommandButton,
		"oj-command-launcher": OjCommandLauncher,
		"oj-command-palette": OjCommandPalette,
		"oj-context-menu": OjContextMenu,
		"oj-dialog": OjDialog,
		"oj-dock-panel": OjDockPanel,
		"oj-drag-context": OjDragContext,
		"oj-dropdown": OjDropdown,
		"oj-dropdown-button": OjDropdownButton,
		"oj-file-tree": OjFileTree,
		"oj-font-picker": OjFontPicker,
		"oj-font-size-field": OjFontSizeField,
		"oj-line-spacing-picker": OjLineSpacingPicker,
		"oj-number-field": OjNumberField,
		"oj-pane-group": OjPaneGroup,
		"oj-hotkey": OjHotkey,
		"oj-icon": OjIcon,
		"oj-locale-provider": OjLocaleProvider,
		"oj-locale-switcher": OjLocaleSwitcher,
		"oj-popper": OjPopper,
		"oj-portal": OjPortal,
		"oj-ribbon": OjRibbon,
		"oj-ribbon-gallery": OjRibbonGallery,
		"oj-ribbon-group": OjRibbonGroup,
		"oj-ribbon-tab": OjRibbonTab,
		"oj-ruler": OjRuler,
		"oj-search-replace-bar": OjSearchReplaceBar,
		"oj-share-dialog": OjShareDialog,
		"oj-signature-pad": OjSignaturePad,
		"oj-splitter": OjSplitter,
		"oj-split-button": OjSplitButton,
		"oj-stamp": OjStamp,
		"oj-symbol-picker": OjSymbolPicker,
		"oj-status-bar": OjStatusBar,
		"oj-table-grid-picker": OjTableGridPicker,
		"oj-tabs": OjTabs,
		"oj-toggle-button": OjToggleButton,
		"oj-toolbar": OjToolbar,
		"oj-upload-progress": OjUploadProgress,
		"oj-version-history": OjVersionHistory,
		"oj-virtual-list": OjVirtualList,
		"oj-tooltip": OjTooltip,
		"oj-trigger": OjTrigger,
		"oj-watermark": OjWatermark,
		"oj-zoom-control": OjZoomControl
	};
	function resolveOjComponent(name) {
		var _OJ_COMPONENTS$key;
		const key = name.trim().toLowerCase();
		if (key.length === 0) return void 0;
		return (_OJ_COMPONENTS$key = OJ_COMPONENTS[key]) !== null && _OJ_COMPONENTS$key !== void 0 ? _OJ_COMPONENTS$key : OJ_COMPONENTS[`oj-${key}`];
	}
	/** 给文档与 web-types 生成用：稳定排序，避免每次构建产出不同的 diff */
	function ojComponentNames() {
		return Object.keys(OJ_COMPONENTS).sort();
	}
	//#endregion
	//#region src/vue/create.ts
	var defaults = {};
	function configure(options) {
		defaults = {
			...defaults,
			...options
		};
	}
	/** 只给测试用：清掉全局默认，避免用例之间互相污染 */
	function resetConfigure() {
		defaults = {};
	}
	var EVENT_PREFIX = "on";
	function toEventProp(name) {
		if (name.length === 0) return EVENT_PREFIX;
		return `${EVENT_PREFIX}${name.charAt(0).toUpperCase()}${name.slice(1)}`;
	}
	function resolveAnchor(anchor) {
		if (anchor === void 0) return void 0;
		if (typeof anchor === "string") {
			const el = document.querySelector(anchor);
			if (el === null) throw new Error(`[office-ui] create 的 anchor 找不到：${anchor}`);
			return el;
		}
		return anchor;
	}
	function create(name, options = {}) {
		var _options$theme, _options$density, _options$on, _options$i18n;
		if (typeof document === "undefined") throw new Error("[office-ui] create 只能在浏览器里调用（SSR 请用组件本身）");
		const component = resolveOjComponent(name);
		if (component === void 0) throw new Error(`[office-ui] 未知组件「${name}」。用 OfficeUI.components（或 ojComponentNames()）看已注册的名字`);
		const el = document.createElement("div");
		el.setAttribute("data-oj-instance", name);
		const theme = (_options$theme = options.theme) !== null && _options$theme !== void 0 ? _options$theme : defaults.theme;
		const density = (_options$density = options.density) !== null && _options$density !== void 0 ? _options$density : defaults.density;
		if (theme !== void 0) el.setAttribute("data-oj-theme", theme);
		if (density !== void 0) el.setAttribute("data-oj-density", density);
		const anchor = resolveAnchor(options.anchor);
		if (anchor === void 0) document.body.appendChild(el);
		else anchor.after(el);
		const props = (0, vue.reactive)({ ...options.props });
		for (const [event, handler] of Object.entries((_options$on = options.on) !== null && _options$on !== void 0 ? _options$on : {})) props[toEventProp(event)] = handler;
		const i18n = (_options$i18n = options.i18n) !== null && _options$i18n !== void 0 ? _options$i18n : defaults.i18n;
		const root = { setup() {
			return () => (0, vue.h)(component, props);
		} };
		const app = (0, vue.createApp)(i18n === void 0 ? root : { setup() {
			return () => (0, vue.h)(OjLocaleProvider, {
				i18n,
				syncDocument: false
			}, () => (0, vue.h)(root));
		} });
		app.mount(el);
		let destroyed = false;
		return {
			el,
			name,
			setProps(next) {
				if (destroyed) return;
				Object.assign(props, next);
			},
			destroy() {
				if (destroyed) return;
				destroyed = true;
				app.unmount();
				el.remove();
			}
		};
	}
	//#endregion
	//#region src/vue/hydrate.ts
	/**
	* 声明式水合（02 §4.3）：扫描 `[data-oj]`，把每个空容器变成一个真组件实例。
	*
	* 这是最贴近 jQuery 生态的用法——HTML 里写属性，脚本里一行 `OJ.hydrate()`。
	* 两条写法并存，都必须支持：
	*
	*   <div data-oj="ribbon" data-oj-props='{"tabs":["开始","插入"]}' data-oj-locale="ja-JP"></div>
	*   <div data-oj="table-grid-picker" data-oj-prop-max-rows="10"
	*        data-oj-prop-on-select="window.pickTable"></div>
	*
	* **JSON 写在 HTML 属性里是高频出错点**（引号嵌套、单引号被吞）。所以解析失败时
	* 不是静默跳过，而是 `console.error` 带上出错元素本身，人能一眼找到是哪一行。
	*/
	var HYDRATED = "data-oj-hydrated";
	var PROP_PREFIX = "data-oj-prop-";
	var EVENT_SEGMENT = "on";
	/** 属性值只在"确实是个 JSON 字面量"时才转换；`加粗` 这种普通文案必须原样保留 */
	function coerce(raw) {
		const text = raw.trim();
		if (text.length === 0) return "";
		if (!/^(?:true|false|null|-?\d|\[|\{|")/.test(text)) return raw;
		try {
			return JSON.parse(text);
		} catch (_unused) {
			return raw;
		}
	}
	/** `window.pickTable` / `App.pick` → 真函数；找不到就返回 undefined（由调用方决定要不要警告） */
	function resolveGlobal(path) {
		const segments = path.split(".").filter(Boolean);
		let current = globalThis;
		for (const segment of segments) {
			if (current === null || typeof current !== "object") return void 0;
			current = current[segment];
		}
		return typeof current === "function" ? current : void 0;
	}
	function setPath(target, path, value) {
		let cursor = target;
		for (const segment of path.slice(0, -1)) {
			const next = cursor[segment];
			if (next === null || typeof next !== "object") cursor[segment] = {};
			cursor = cursor[segment];
		}
		const last = path[path.length - 1];
		if (last !== void 0) cursor[last] = value;
	}
	function hydrate(root, options = {}) {
		if (typeof document === "undefined") throw new Error("[office-ui] hydrate 只能在浏览器里调用");
		let scope = document;
		if (typeof root === "string") {
			const found = document.querySelector(root);
			if (found === null) {
				console.warn(`[office-ui] hydrate 的根节点找不到：${root}`);
				return [];
			}
			scope = found;
		} else if (root !== void 0) scope = root;
		const candidates = [...scope.querySelectorAll("[data-oj]")];
		if (scope instanceof Element && scope.matches("[data-oj]")) candidates.unshift(scope);
		const instances = [];
		for (const el of candidates) {
			var _el$getAttribute$trim, _el$getAttribute;
			const name = (_el$getAttribute$trim = (_el$getAttribute = el.getAttribute("data-oj")) === null || _el$getAttribute === void 0 ? void 0 : _el$getAttribute.trim()) !== null && _el$getAttribute$trim !== void 0 ? _el$getAttribute$trim : "";
			if (name.length === 0) continue;
			if (el.hasAttribute(HYDRATED)) continue;
			const props = {};
			const on = {};
			const rawProps = el.getAttribute("data-oj-props");
			if (rawProps !== null && rawProps.trim().length > 0) try {
				const parsed = JSON.parse(rawProps);
				if (parsed !== null && typeof parsed === "object" && !Array.isArray(parsed)) Object.assign(props, parsed);
				else throw new Error("data-oj-props 必须是一个对象字面量");
			} catch (error) {
				console.error(`[office-ui] ${name} 的 data-oj-props 解析失败：${error.message}\n  元素：${el.outerHTML.slice(0, 160)}`);
				continue;
			}
			for (const attr of el.getAttributeNames()) {
				var _el$getAttribute2;
				if (!attr.startsWith(PROP_PREFIX)) continue;
				const path = attr.slice(13).split("-").filter(Boolean);
				const value = (_el$getAttribute2 = el.getAttribute(attr)) !== null && _el$getAttribute2 !== void 0 ? _el$getAttribute2 : "";
				if (path[0] === EVENT_SEGMENT) {
					const event = path.slice(1).join("-");
					const handler = resolveGlobal(value);
					if (handler === void 0) {
						console.warn(`[office-ui] ${name} 的 ${attr}="${value}" 不是可调用的全局函数`);
						continue;
					}
					if (event.length > 0) on[event] = handler;
					continue;
				}
				setPath(props, path, coerce(value));
			}
			try {
				const instance = create(name, {
					...options,
					anchor: el,
					props,
					on
				});
				el.setAttribute(HYDRATED, "");
				instances.push(instance);
			} catch (error) {
				console.error(`[office-ui] ${name} 水合失败：${error.message}`);
			}
		}
		return instances;
	}
	//#endregion
	exports.OJ_COMPONENTS = OJ_COMPONENTS;
	exports.OJ_DRAG_CONTEXT = OJ_DRAG_CONTEXT;
	exports.OjAiPanel = OjAiPanel;
	exports.OjAlignmentPicker = OjAlignmentPicker;
	exports.OjBorderPicker = OjBorderPicker;
	exports.OjCodeBlock = OjCodeBlock;
	exports.OjColorPicker = OjColorPicker;
	exports.OjCommandButton = OjCommandButton;
	exports.OjCommandLauncher = OjCommandLauncher;
	exports.OjCommandPalette = OjCommandPalette;
	exports.OjCommentThread = OjCommentThread;
	exports.OjContextMenu = OjContextMenu;
	exports.OjDialog = OjDialog;
	exports.OjDockPanel = OjDockPanel;
	exports.OjDragContext = OjDragContext;
	exports.OjDropZone = OjDropZone;
	exports.OjDropdown = OjDropdown;
	exports.OjDropdownButton = OjDropdownButton;
	exports.OjFileNameHeader = OjFileNameHeader;
	exports.OjFileTree = OjFileTree;
	exports.OjFontPicker = OjFontPicker;
	exports.OjFontSizeField = OjFontSizeField;
	exports.OjGallery = OjGallery;
	exports.OjHotkey = OjHotkey;
	exports.OjIcon = OjIcon;
	exports.OjLineSpacingPicker = OjLineSpacingPicker;
	exports.OjLocaleProvider = OjLocaleProvider;
	exports.OjLocaleSwitcher = OjLocaleSwitcher;
	exports.OjNumberField = OjNumberField;
	exports.OjPaneGroup = OjPaneGroup;
	exports.OjPopper = OjPopper;
	exports.OjPortal = OjPortal;
	exports.OjPresenceAvatars = OjPresenceAvatars;
	exports.OjReviewPanel = OjReviewPanel;
	exports.OjRibbon = OjRibbon;
	exports.OjRibbonGallery = OjRibbonGallery;
	exports.OjRibbonGroup = OjRibbonGroup;
	exports.OjRibbonTab = OjRibbonTab;
	exports.OjRuler = OjRuler;
	exports.OjSearchReplaceBar = OjSearchReplaceBar;
	exports.OjShareDialog = OjShareDialog;
	exports.OjSignaturePad = OjSignaturePad;
	exports.OjSplitButton = OjSplitButton;
	exports.OjSplitter = OjSplitter;
	exports.OjStamp = OjStamp;
	exports.OjStatusBar = OjStatusBar;
	exports.OjStyleGallery = OjStyleGallery;
	exports.OjSymbolPicker = OjSymbolPicker;
	exports.OjTableGridPicker = OjTableGridPicker;
	exports.OjTabs = OjTabs;
	exports.OjToggleButton = OjToggleButton;
	exports.OjToolbar = OjToolbar;
	exports.OjTooltip = OjTooltip;
	exports.OjTrigger = OjTrigger;
	exports.OjUploadProgress = OjUploadProgress;
	exports.OjVersionHistory = OjVersionHistory;
	exports.OjVirtualList = OjVirtualList;
	exports.OjWatermark = OjWatermark;
	exports.OjZoomControl = OjZoomControl;
	exports.configure = configure;
	exports.create = create;
	exports.hydrate = hydrate;
	exports.ojComponentNames = ojComponentNames;
	exports.resetConfigure = resetConfigure;
	exports.resolveOjComponent = resolveOjComponent;
	exports.useLocale = useLocale;
	exports.useOjDragContext = useOjDragContext;
});
