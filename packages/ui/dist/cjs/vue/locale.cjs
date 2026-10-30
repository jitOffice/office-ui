const require_icons = require("../icons.cjs");
let vue = require("vue");
//#region src/vue/locale.ts
var LOCALE_KEY = Symbol("oj-locale");
/** `import.meta.env` 只在函数里读：CJS/UMD 产物里模块顶层碰 `import.meta` 会直接抛。 */
function devEnv() {
	return require_icons.isDevEnv({
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
			return fallback ?? key;
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
			stop?.();
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
			stop?.();
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
				return text === key ? fallback ?? key : text;
			},
			use(next) {
				props.i18n.use(next);
			},
			list() {
				return props.i18n.list();
			}
		};
		(0, vue.provide)(LOCALE_KEY, context);
		return () => slots.default?.();
	}
});
//#endregion
exports.OjLocaleProvider = OjLocaleProvider;
exports.useLocale = useLocale;
