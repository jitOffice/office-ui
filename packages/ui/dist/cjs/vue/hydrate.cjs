const require_create = require("./create.cjs");
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
	} catch {
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
		const name = el.getAttribute("data-oj")?.trim() ?? "";
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
			if (!attr.startsWith(PROP_PREFIX)) continue;
			const path = attr.slice(13).split("-").filter(Boolean);
			const value = el.getAttribute(attr) ?? "";
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
			const instance = require_create.create(name, {
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
exports.hydrate = hydrate;
