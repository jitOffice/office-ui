//#region src/intl.ts
/**
* `Intl` 实例缓存。
*
* `Intl.*Format` 的构造成本远高于调用成本（内部要解析标签并装载数据表），
* 而单元格渲染是"每屏上千次同参数格式化"，不缓存就是 60fps 场景里的主要开销来源。
* 缓存键必须含完整选项，否则 `{maximumFractionDigits: 2}` 会污染 `{style:'percent'}`。
*/
var numberCache = /* @__PURE__ */ new Map();
var pluralCache = /* @__PURE__ */ new Map();
var partCache = /* @__PURE__ */ new Map();
function cachedNumberFormat(locale, options) {
	const key = `${locale}|${JSON.stringify(options)}`;
	let fmt = numberCache.get(key);
	if (!fmt) {
		fmt = new Intl.NumberFormat(locale, options);
		numberCache.set(key, fmt);
	}
	return fmt;
}
/**
* 基线内核（信创环境的旧 Firefox ESR / 旧 Chromium）不保证有 `Intl.PluralRules`，
* 缺失时退化为"1 单数、其余复数"——中英日三语在这个退化下结果都正确。
*/
function pluralCategory(locale, value) {
	if (typeof Intl.PluralRules !== "function") return Math.abs(value) === 1 ? "one" : "other";
	let rules = pluralCache.get(locale);
	if (!rules) {
		rules = new Intl.PluralRules(locale);
		pluralCache.set(locale, rules);
	}
	return rules.select(value);
}
function cachedPartFormat(locale, options) {
	const key = `${locale}|${JSON.stringify(options)}`;
	let fmt = partCache.get(key);
	if (!fmt) {
		fmt = new Intl.DateTimeFormat(locale, options);
		partCache.set(key, fmt);
	}
	return fmt;
}
/** 取 `formatToParts` 里的单个字段，拿不到时返回 undefined 而不是抛。 */
function part(locale, options, date, type) {
	for (const p of cachedPartFormat(locale, options).formatToParts(date)) if (p.type === type) return p.value;
	return "";
}
//#endregion
export { cachedNumberFormat, cachedPartFormat, part, pluralCategory };
