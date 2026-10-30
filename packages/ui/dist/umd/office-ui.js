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
	/**
	* 网格陈列的方向键模型（03 §3 B 组 `OjRibbonGallery`）。
	*
	* 单独抽出来是因为"上下左右在网格里怎么走"是最容易写歪的一段：写成按 `columns`
	* 硬算行列，碰到最后一行不满就会算出不存在的下标；写成纯 `+1/-1`，上下键又变成
	* 左右键的别名。这里统一按**下标**算，并且永远夹在 `[0, count-1]` 里。
	*/
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
		"oj-code-block": OjCodeBlock,
		"oj-command-button": OjCommandButton,
		"oj-command-launcher": OjCommandLauncher,
		"oj-command-palette": OjCommandPalette,
		"oj-context-menu": OjContextMenu,
		"oj-dialog": OjDialog,
		"oj-dropdown": OjDropdown,
		"oj-dropdown-button": OjDropdownButton,
		"oj-file-tree": OjFileTree,
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
		"oj-signature-pad": OjSignaturePad,
		"oj-split-button": OjSplitButton,
		"oj-stamp": OjStamp,
		"oj-status-bar": OjStatusBar,
		"oj-table-grid-picker": OjTableGridPicker,
		"oj-tabs": OjTabs,
		"oj-toggle-button": OjToggleButton,
		"oj-toolbar": OjToolbar,
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
	exports.OjAiPanel = OjAiPanel;
	exports.OjCodeBlock = OjCodeBlock;
	exports.OjCommandButton = OjCommandButton;
	exports.OjCommandLauncher = OjCommandLauncher;
	exports.OjCommandPalette = OjCommandPalette;
	exports.OjContextMenu = OjContextMenu;
	exports.OjDialog = OjDialog;
	exports.OjDropdown = OjDropdown;
	exports.OjDropdownButton = OjDropdownButton;
	exports.OjFileTree = OjFileTree;
	exports.OjHotkey = OjHotkey;
	exports.OjIcon = OjIcon;
	exports.OjLocaleProvider = OjLocaleProvider;
	exports.OjLocaleSwitcher = OjLocaleSwitcher;
	exports.OjPopper = OjPopper;
	exports.OjPortal = OjPortal;
	exports.OjRibbon = OjRibbon;
	exports.OjRibbonGallery = OjRibbonGallery;
	exports.OjRibbonGroup = OjRibbonGroup;
	exports.OjRibbonTab = OjRibbonTab;
	exports.OjRuler = OjRuler;
	exports.OjSearchReplaceBar = OjSearchReplaceBar;
	exports.OjSignaturePad = OjSignaturePad;
	exports.OjSplitButton = OjSplitButton;
	exports.OjStamp = OjStamp;
	exports.OjStatusBar = OjStatusBar;
	exports.OjTableGridPicker = OjTableGridPicker;
	exports.OjTabs = OjTabs;
	exports.OjToggleButton = OjToggleButton;
	exports.OjToolbar = OjToolbar;
	exports.OjTooltip = OjTooltip;
	exports.OjTrigger = OjTrigger;
	exports.OjWatermark = OjWatermark;
	exports.OjZoomControl = OjZoomControl;
	exports.configure = configure;
	exports.create = create;
	exports.hydrate = hydrate;
	exports.ojComponentNames = ojComponentNames;
	exports.resetConfigure = resetConfigure;
	exports.resolveOjComponent = resolveOjComponent;
	exports.useLocale = useLocale;
});
