const require_locale = require("./locale.cjs");
const require_registry = require("./registry.cjs");
let vue = require("vue");
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
	if (typeof document === "undefined") throw new Error("[office-ui] create 只能在浏览器里调用（SSR 请用组件本身）");
	const component = require_registry.resolveOjComponent(name);
	if (component === void 0) throw new Error(`[office-ui] 未知组件「${name}」。用 OfficeUI.components（或 ojComponentNames()）看已注册的名字`);
	const el = document.createElement("div");
	el.setAttribute("data-oj-instance", name);
	const theme = options.theme ?? defaults.theme;
	const density = options.density ?? defaults.density;
	if (theme !== void 0) el.setAttribute("data-oj-theme", theme);
	if (density !== void 0) el.setAttribute("data-oj-density", density);
	const anchor = resolveAnchor(options.anchor);
	if (anchor === void 0) document.body.appendChild(el);
	else anchor.after(el);
	const props = (0, vue.reactive)({ ...options.props });
	for (const [event, handler] of Object.entries(options.on ?? {})) props[toEventProp(event)] = handler;
	const i18n = options.i18n ?? defaults.i18n;
	const root = { setup() {
		return () => (0, vue.h)(component, props);
	} };
	const app = (0, vue.createApp)(i18n === void 0 ? root : { setup() {
		return () => (0, vue.h)(require_locale.OjLocaleProvider, {
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
exports.configure = configure;
exports.create = create;
exports.resetConfigure = resetConfigure;
