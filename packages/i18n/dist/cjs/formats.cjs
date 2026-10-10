const require_intl = require("./intl.cjs");
//#region src/formats.ts
/**
* 数字与日期格式化：全部委托 `Intl`，不引 dayjs / date-fns（ADR-0004）。
*
* 日期走自研 pattern 渲染而不是 `Intl.DateTimeFormat` 的 `dateStyle`，原因是语言包里存的是
* **格式串**（`'YYYY年M月D日'`、`'H時m分'`，抄 Arco 的判断：格式属于语言不属于组件），
* 而 `dateStyle` 只给得出 full/long/medium/short 四档，钉不出「10月9日」不带"年"、
* 也钉不出「2026年10月9日 14時5分」的空格与汉字混排。
*/
var TOKEN_AT = new RegExp(`^(?:YYYY|YY|MMMM|MMM|MM|M|DD|D|HH|H|hh|h|mm|m|ss|s|A|a)`);
function pad2(value) {
	return value < 10 ? `0${value}` : String(value);
}
function formatPattern(getLocale, pattern, date) {
	const { intl } = getLocale();
	let out = "";
	let i = 0;
	while (i < pattern.length) {
		const ch = pattern[i];
		if (ch === "'") {
			if (pattern[i + 1] === "'") {
				out += "'";
				i += 2;
				continue;
			}
			const end = pattern.indexOf("'", i + 1);
			if (end === -1) throw new Error(`日期格式串引号未闭合：${pattern}`);
			out += pattern.slice(i + 1, end);
			i = end + 1;
			continue;
		}
		const token = pattern.slice(i).match(TOKEN_AT)?.[0];
		if (!token) {
			out += ch;
			i += 1;
			continue;
		}
		out += tokenValue(token, date, intl);
		i += token.length;
	}
	return out;
}
function tokenValue(token, date, intl) {
	const hours = date.getHours();
	const minutes = date.getMinutes();
	switch (token) {
		case "YYYY": return String(date.getFullYear());
		case "YY": return pad2(date.getFullYear() % 100);
		case "MMMM": return require_intl.part(intl, { month: "long" }, date, "month");
		case "MMM": return require_intl.part(intl, { month: "short" }, date, "month");
		case "MM": return pad2(date.getMonth() + 1);
		case "M": return String(date.getMonth() + 1);
		case "DD": return pad2(date.getDate());
		case "D": return String(date.getDate());
		case "HH": return pad2(hours);
		case "H": return String(hours);
		case "hh": return pad2(hours % 12 || 12);
		case "h": return String(hours % 12 || 12);
		case "mm": return pad2(minutes);
		case "m": return String(minutes);
		case "ss": return pad2(date.getSeconds());
		case "s": return String(date.getSeconds());
		case "A": return require_intl.part(intl, {
			hour: "numeric",
			hour12: true
		}, date, "dayPeriod").toUpperCase();
		case "a": return require_intl.part(intl, {
			hour: "numeric",
			hour12: true
		}, date, "dayPeriod").toLowerCase();
		default: throw new Error(`未实现的日期格式 token：${token}`);
	}
}
/** 数字格式化器读取的是**当前**语言，所以切语言后无需重建，也不会出现"文案日文、数字中国分组"。 */
function createNumberFormat(getLocale) {
	const fixed = (value, digits, extra) => {
		const options = { ...extra };
		if (digits !== void 0) {
			options.minimumFractionDigits = digits;
			options.maximumFractionDigits = digits;
		}
		return require_intl.cachedNumberFormat(getLocale().intl, options).format(value);
	};
	return {
		decimal: (value, digits) => fixed(value, digits, {}),
		integer: (value) => fixed(value, 0, {}),
		percent: (value, digits = 0) => fixed(value, digits, { style: "percent" }),
		currency: (value, code) => fixed(value, void 0, {
			style: "currency",
			currency: code
		})
	};
}
function createDateFormat(getLocale) {
	const toTime = (value) => value instanceof Date ? value : new Date(value);
	return {
		date: (value) => formatPattern(getLocale, getLocale().formats.date, toTime(value)),
		time: (value) => formatPattern(getLocale, getLocale().formats.time, toTime(value)),
		dateTime: (value) => formatPattern(getLocale, getLocale().formats.dateTime, toTime(value)),
		pattern: (pattern, value) => formatPattern(getLocale, pattern, toTime(value)),
		weekday: (value, kind = "short") => require_intl.part(getLocale().intl, { weekday: kind }, toTime(value), "weekday"),
		get weekStartsOn() {
			return getLocale().formats.weekStartsOn;
		}
	};
}
//#endregion
exports.createDateFormat = createDateFormat;
exports.createNumberFormat = createNumberFormat;
