(function(global, factory) {
	typeof exports === "object" && typeof module !== "undefined" ? factory(exports) : typeof define === "function" && define.amd ? define(["exports"], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, factory(global.OfficeUII18n = {}));
})(this, function(exports) {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
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
			const matched = pattern.slice(i).match(TOKEN_AT);
			const token = matched === null || matched === void 0 ? void 0 : matched[0];
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
			case "MMMM": return part(intl, { month: "long" }, date, "month");
			case "MMM": return part(intl, { month: "short" }, date, "month");
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
			case "A": return part(intl, {
				hour: "numeric",
				hour12: true
			}, date, "dayPeriod").toUpperCase();
			case "a": return part(intl, {
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
			return cachedNumberFormat(getLocale().intl, options).format(value);
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
			weekday: (value, kind = "short") => part(getLocale().intl, { weekday: kind }, toTime(value), "weekday"),
			get weekStartsOn() {
				return getLocale().formats.weekStartsOn;
			}
		};
	}
	//#endregion
	//#region src/message.ts
	/**
	* 消息语法解析与渲染（04 §6.2 规则 5）。
	*
	* 支持三种形态：`{name}` 插值、`{n, plural, one {…} other {…}}`、`{x, select, a {…} other {…}}`，
	* 分支体可再嵌指令，所以是递归下降而不是正则。复数走 `Intl.PluralRules`，不引格式化库。
	*
	* 语法错误在**构造期**抛出而不是渲染期：消息源都是我们自己的语言包，测试会把四份包
	* 全量 parse 一遍，因此线上不可能遇到坏语法；把错误留到渲染期只会变成"界面空白"。
	*/
	var PLURAL_CATEGORIES = /* @__PURE__ */ new Set([
		"zero",
		"one",
		"two",
		"few",
		"many",
		"other"
	]);
	var EXACT_KEY = /^=-?\d+$/;
	function isSpace(ch) {
		return ch === " " || ch === "	" || ch === "\n" || ch === "\r";
	}
	function skipSpace(source, cur) {
		while (cur.i < source.length && isSpace(source[cur.i])) cur.i += 1;
	}
	function parseMessage(source) {
		return parseSequence(source, { i: 0 }, false, false);
	}
	/**
	* 读到 `}` 时：顶层的 `}}` 是字面量转义，分支内的单个 `}` 是分支结束。
	* 两条规则不能同时生效——`…characters}}` 里前一个 `}` 必须闭合分支，否则分支永远闭不上。
	* 分支结束时不消费 `}`，交给 `parseChoices` 校验后吃掉，两层各自负责自己的闭合。
	*/
	function parseSequence(source, cur, inBranch, inPlural) {
		const out = [];
		let literal = "";
		const flush = () => {
			if (literal !== "") {
				out.push({
					kind: "text",
					value: literal
				});
				literal = "";
			}
		};
		while (cur.i < source.length) {
			const ch = source[cur.i];
			const next = source[cur.i + 1];
			if (ch === "{") {
				if (next === "{") {
					literal += "{";
					cur.i += 2;
					continue;
				}
				cur.i += 1;
				flush();
				out.push(parseSlot(source, cur));
				continue;
			}
			if (ch === "}") {
				if (!inBranch && next === "}") {
					literal += "}";
					cur.i += 2;
					continue;
				}
				if (!inBranch) throw new Error(`消息语法错误：「${source}」有未配对的 }`);
				flush();
				return out;
			}
			if (ch === "#" && inPlural) {
				flush();
				out.push({ kind: "count" });
				cur.i += 1;
				continue;
			}
			literal += ch;
			cur.i += 1;
		}
		if (inBranch) throw new Error(`消息语法错误：「${source}」的分支缺少 }`);
		flush();
		return out;
	}
	/** 名字里出现 `{` 只可能是上一层语法错误，不能当普通字符吞掉，否则错误会漂到更深处。 */
	function readName(source, cur, stop) {
		const from = cur.i;
		while (cur.i < source.length) {
			const ch = source[cur.i];
			if (stop.includes(ch)) break;
			if (ch === "{") throw new Error(`消息语法错误：「${source}」第 ${cur.i} 位出现未闭合的 {`);
			cur.i += 1;
		}
		return source.slice(from, cur.i).trim();
	}
	function parseSlot(source, cur) {
		const name = readName(source, cur, ",}");
		if (name === "") throw new Error(`消息语法错误：「${source}」第 ${cur.i} 位的槽位名为空`);
		if (cur.i >= source.length) throw new Error(`消息语法错误：「${source}」的槽位 {${name} 未闭合`);
		if (source[cur.i] === "}") {
			cur.i += 1;
			return {
				kind: "arg",
				name
			};
		}
		cur.i += 1;
		const form = readName(source, cur, ",}");
		if (form !== "plural" && form !== "select") throw new Error(`消息语法错误：不支持的指令「${form}」，只支持 plural 与 select`);
		if (source[cur.i] !== ",") throw new Error(`消息语法错误：{${name}, ${form} 缺少分支`);
		cur.i += 1;
		const choices = parseChoices(source, cur, name, form);
		if (source[cur.i] !== "}") throw new Error(`消息语法错误：{${name}, ${form} 未闭合`);
		cur.i += 1;
		return {
			kind: "select",
			form,
			name,
			choices
		};
	}
	function parseChoices(source, cur, name, form) {
		const out = [];
		const seen = /* @__PURE__ */ new Set();
		for (;;) {
			skipSpace(source, cur);
			if (cur.i >= source.length) throw new Error(`消息语法错误：{${name}, ${form}} 未闭合`);
			if (source[cur.i] === "}") break;
			const key = readName(source, cur, "{");
			if (key === "") throw new Error(`消息语法错误：{${name}, ${form} 第 ${cur.i} 位缺少分支键`);
			if (form === "plural" && !EXACT_KEY.test(key) && !PLURAL_CATEGORIES.has(key)) throw new Error(`消息语法错误：plural 分支键「${key}」非法，应为 =数字 或 ${[...PLURAL_CATEGORIES].join("/")}`);
			if (seen.has(key)) throw new Error(`消息语法错误：{${name}, ${form} 分支键「${key}」重复`);
			seen.add(key);
			skipSpace(source, cur);
			if (source[cur.i] !== "{") throw new Error(`消息语法错误：{${name}, ${form} 的分支「${key}」缺少 { }`);
			cur.i += 1;
			const body = parseSequence(source, cur, true, form === "plural");
			if (source[cur.i] !== "}") throw new Error(`消息语法错误：{${name}, ${form} 的分支「${key}」未闭合`);
			cur.i += 1;
			out.push({
				key,
				body
			});
		}
		if (form === "plural" && !out.some((c) => c.key === "other")) throw new Error(`消息语法错误：{${name}, plural} 必须有 other 分支`);
		return out;
	}
	/** 供生成器提取每个 key 需要的占位符；嵌套分支里的槽位同样收集。 */
	function slotsOf(nodes, into = []) {
		for (const node of nodes) if (node.kind === "arg") into.push({
			name: node.name,
			kind: "arg"
		});
		else if (node.kind === "select") {
			into.push({
				name: node.name,
				kind: node.form
			});
			for (const choice of node.choices) slotsOf(choice.body, into);
		}
		return into;
	}
	/**
	* `count` 是 plural 分支里的 `#`，值由上一层 `renderSelect` 显式传进来。
	* 不用"往 values 里塞一个魔法键"的做法：那条路会让调用方传入的同名参数被覆盖，
	* 也让 `slotsOf` 与渲染结果对不上。
	*/
	function renderNodes(nodes, ctx, count) {
		let out = "";
		for (const node of nodes) switch (node.kind) {
			case "text":
				out += node.value;
				break;
			case "count":
				out += count === void 0 ? "" : cachedNumberFormat(ctx.intl, {}).format(Number(count));
				break;
			case "arg": {
				var _ctx$values;
				const value = (_ctx$values = ctx.values) === null || _ctx$values === void 0 ? void 0 : _ctx$values[node.name];
				out += value === void 0 ? missing(node.name, ctx) : String(value);
				break;
			}
			case "select": out += renderSelect(node, ctx, count);
		}
		return out;
	}
	function missing(name, ctx) {
		if (ctx.dev) console.warn(`[i18n] ${ctx.key} 缺少参数「${name}」`);
		return `{${name}}`;
	}
	function renderSelect(node, ctx, count) {
		var _ctx$values2;
		const value = (_ctx$values2 = ctx.values) === null || _ctx$values2 === void 0 ? void 0 : _ctx$values2[node.name];
		if (value === void 0) return missing(node.name, ctx);
		const other = node.choices.find((c) => c.key === "other");
		let chosen;
		if (node.form === "select") {
			var _node$choices$find;
			chosen = (_node$choices$find = node.choices.find((c) => c.key === String(value))) !== null && _node$choices$find !== void 0 ? _node$choices$find : other;
		} else {
			var _ref, _node$choices$find2;
			const num = typeof value === "number" ? value : Number(value);
			chosen = Number.isFinite(num) ? (_ref = (_node$choices$find2 = node.choices.find((c) => c.key === `=${num}`)) !== null && _node$choices$find2 !== void 0 ? _node$choices$find2 : node.choices.find((c) => c.key === pluralCategory(ctx.intl, num))) !== null && _ref !== void 0 ? _ref : other : other;
		}
		if (!chosen) {
			if (ctx.dev) console.warn(`[i18n] ${ctx.key} 的 ${node.form} 缺 other 分支，值「${String(value)}」无处匹配`);
			return String(value);
		}
		return renderNodes(chosen.body, ctx, node.form === "plural" ? value : count);
	}
	function render(nodes, ctx) {
		return renderNodes(nodes, ctx, void 0);
	}
	//#endregion
	//#region src/store.ts
	/**
	* i18n 运行时：语言表 + 当前语言 + 取值（04 §6.3）。
	*
	* 框架无关：只暴露 `subscribe`，Vue 层的 `OjLocaleProvider` / `useLocale` 建在它上面，
	* jQuery 与 Node 直接用（ADR-0005）。这里**不碰 document**——写 `html[lang]` 是 Provider 的副作用，
	* 否则同一个包在 SSR 里就炸了。
	*/
	var nodeCache = /* @__PURE__ */ new Map();
	function compile(source) {
		let nodes = nodeCache.get(source);
		if (!nodes) {
			nodes = parseMessage(source);
			nodeCache.set(source, nodes);
		}
		return nodes;
	}
	/**
	* 用 `hasOwnProperty.call` 而不是 `Object.hasOwn`：后者是 ES2022，落在 B2 的
	* Chromium 86 候选基线之外，而这条路径每次取文案都会走。
	*/
	function lookup(root, key) {
		let node = root;
		for (const seg of key.split(".")) {
			if (typeof node !== "object" || node === null || !Object.prototype.hasOwnProperty.call(node, seg)) return;
			node = node[seg];
		}
		return node;
	}
	function createI18n(options) {
		var _options$dev, _options$locales;
		const dev = (_options$dev = options.dev) !== null && _options$dev !== void 0 ? _options$dev : false;
		const registry = /* @__PURE__ */ new Map();
		const listeners = /* @__PURE__ */ new Set();
		let disposed = false;
		for (const locale of (_options$locales = options.locales) !== null && _options$locales !== void 0 ? _options$locales : []) registry.set(locale.name, locale);
		const requested = typeof options.locale === "string" ? registry.get(options.locale) : options.locale;
		if (!requested) {
			const known = [...registry.keys()].join(", ") || "（空）";
			throw new Error(`[i18n] 初始语言「${String(options.locale)}」未注册，已注册：${known}`);
		}
		if (!registry.has(requested.name)) registry.set(requested.name, requested);
		let current = requested;
		const number = createNumberFormat(() => current);
		const date = createDateFormat(() => current);
		function value(key, values) {
			const raw = lookup(current.messages, key);
			if (typeof raw !== "string") {
				if (dev && key.startsWith("oj.")) console.warn(`[i18n] ${current.name} 缺少文案 ${key}`);
				return key;
			}
			return render(compile(raw), {
				values,
				intl: current.intl,
				key,
				dev
			});
		}
		function notify() {
			if (disposed) return;
			for (const listener of [...listeners]) listener(current);
		}
		return {
			get locale() {
				return current;
			},
			get lang() {
				return current.name;
			},
			register(locale) {
				const previous = registry.get(locale.name);
				if (previous && previous !== locale && dev) console.warn(`[i18n] 语言包 ${locale.name} 被替换`);
				registry.set(locale.name, locale);
				return () => {
					if (registry.get(locale.name) !== locale) return;
					if (previous) registry.set(locale.name, previous);
					else registry.delete(locale.name);
				};
			},
			has(name) {
				return registry.has(name);
			},
			use(next) {
				const locale = typeof next === "string" ? registry.get(next) : next;
				if (!locale) {
					const known = [...registry.keys()].join(", ") || "（空）";
					throw new Error(`[i18n] 语言「${String(next)}」未注册，已注册：${known}`);
				}
				if (!registry.has(locale.name)) registry.set(locale.name, locale);
				if (locale === current) return;
				current = locale;
				notify();
			},
			list() {
				return [...registry.values()].sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
			},
			t(key, values) {
				return value(key, values);
			},
			translate(key, values) {
				return value(key, values);
			},
			resolve(message) {
				return typeof message === "string" ? message : value(message.key, message.params);
			},
			number,
			date,
			subscribe(listener) {
				listeners.add(listener);
				return () => {
					listeners.delete(listener);
				};
			},
			dispose() {
				listeners.clear();
				disposed = true;
			}
		};
	}
	//#endregion
	exports.createI18n = createI18n;
	exports.parseMessage = parseMessage;
	exports.render = render;
	exports.slotsOf = slotsOf;
});
