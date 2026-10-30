//#region src/icon-registry.ts
/** kebab-case，且不能落在内置命名空间里。 */
var NAME_PATTERN = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
var RESERVED_PREFIX = "oj-";
var FORBIDDEN = [
	{
		pattern: /<script/i,
		reason: "含 <script>"
	},
	{
		pattern: /\son[a-z]+\s*=/i,
		reason: "含内联事件处理器（onload= 这类）"
	},
	{
		pattern: /javascript:/i,
		reason: "含 javascript: 协议"
	},
	{
		pattern: /<foreignobject/i,
		reason: "含 <foreignObject>（可嵌入任意 HTML）"
	},
	{
		pattern: /<image\b/i,
		reason: "含 <image>（外链图片，离线环境会挂住首帧）"
	},
	{
		pattern: /(?:xlink:)?href\s*=\s*["']?\s*(?:https?:)?\/\//i,
		reason: "含外链 href"
	}
];
var registry = /* @__PURE__ */ new Map();
/**
* 校验一份图标 markup。返回 `undefined` 表示可用；否则返回给人看的问题描述。
* 独立导出是为了让它能在零依赖的 `node --test` 里被逐条断言（不加载 vue）。
*/
function iconMarkupProblem(name, markup) {
	if (typeof name !== "string" || !NAME_PATTERN.test(name)) return `名字 "${name}" 不是 kebab-case（只允许小写字母、数字、连字符，且不以数字开头）`;
	if (name.startsWith(RESERVED_PREFIX)) return `名字 "${name}" 占用了内置命名空间（oj-* 由 @jitoffice/icons 提供，业务图标请换个前缀）`;
	if (typeof markup !== "string") return `"${name}" 的 markup 不是字符串`;
	const trimmed = markup.trim();
	if (!trimmed.toLowerCase().startsWith("<svg")) return `"${name}" 的 markup 不是以 <svg 开头`;
	if (!trimmed.toLowerCase().endsWith("</svg>")) return `"${name}" 的 markup 不是以 </svg> 结尾`;
	const roots = trimmed.match(/<svg[\s>]/gi)?.length ?? 0;
	if (roots !== 1) return `"${name}" 的 markup 含 ${roots} 个 <svg>，必须是单个图标`;
	if (!/\sviewBox\s*=\s*["'][^"']+["']/i.test(trimmed)) return `"${name}" 的 markup 缺 viewBox`;
	for (const { pattern, reason } of FORBIDDEN) if (pattern.test(trimmed)) return `"${name}" 的 markup ${reason}`;
}
function assert(name, markup) {
	const problem = iconMarkupProblem(name, markup);
	if (problem !== void 0) throw new Error(`[OjIcon] 注册失败：${problem}`);
}
/** 注册单枚图标。同名覆盖（主题/微前端替换用）。 */
function registerIcon(name, markup) {
	assert(name, markup);
	registry.set(name, markup.trim());
}
/** 批量注册。**先整体校验再写入**：一条不合格时不留半套注册结果。 */
function registerIcons(table) {
	for (const [name, markup] of Object.entries(table)) assert(name, markup);
	for (const [name, markup] of Object.entries(table)) registry.set(name, markup.trim());
}
/** 注销。返回是否真的删掉了（重复注销不该当成错误）。 */
function unregisterIcon(name) {
	return registry.delete(name);
}
/** 已注册的业务图标名（不含内置的三十枚）。 */
function registeredIconNames() {
	return [...registry.keys()];
}
/** 清空。测试与"整站换一套图标"用。 */
function resetRegisteredIcons() {
	registry.clear();
}
function registeredIconMarkup(name) {
	return registry.get(name);
}
//#endregion
exports.iconMarkupProblem = iconMarkupProblem;
exports.registerIcon = registerIcon;
exports.registerIcons = registerIcons;
exports.registeredIconMarkup = registeredIconMarkup;
exports.registeredIconNames = registeredIconNames;
exports.resetRegisteredIcons = resetRegisteredIcons;
exports.unregisterIcon = unregisterIcon;
