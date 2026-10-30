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
	if (raw === " ") return "space";
	const lower = raw.trim().toLowerCase();
	return KEY_ALIASES[lower] ?? lower;
}
/** 平台推断只看字符串，方便测试。空串按 linux 处理（最保守的一档）。 */
function platformFrom(source) {
	if (/mac|iphone|ipad|ipod/i.test(source)) return "mac";
	if (/win/i.test(source)) return "win";
	return "linux";
}
/** 运行时平台。拿不到 `navigator` 时按 linux——宁可显示 Ctrl，也不要显示一个假 ⌘。 */
function detectPlatform() {
	const nav = globalThis.navigator;
	return platformFrom(`${nav?.platform ?? ""} ${nav?.userAgent ?? ""}`);
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
	const spec = parseHotkey(binding, platform);
	if (spec === void 0) return binding;
	const key = KEY_LABELS[spec.key] ?? (spec.key.length === 1 ? spec.key.toUpperCase() : spec.key);
	if (platform === "mac") return `${spec.ctrl ? "⌃" : ""}${spec.alt ? "⌥" : ""}${spec.shift ? "⇧" : ""}${spec.meta ? "⌘" : ""}${key}`;
	const parts = [];
	if (spec.ctrl) parts.push("Ctrl");
	if (spec.alt) parts.push("Alt");
	if (spec.shift) parts.push("Shift");
	if (spec.meta) parts.push("Win");
	parts.push(key);
	return parts.join("+");
}
function canonical(spec) {
	return `${spec.ctrl ? "C" : ""}${spec.alt ? "A" : ""}${spec.shift ? "S" : ""}${spec.meta ? "M" : ""}:${spec.key}`;
}
function keysOf(binding) {
	const keys = binding.keys;
	if (keys === void 0) return [];
	return typeof keys === "string" ? [keys] : [...keys];
}
/**
* 冲突检测。同一个命令把同一条快捷键写两遍不算冲突——冲突是**两个命令抢一个键**，
* 报出来的第一条就是"后注册的把先注册的盖掉了"。
*/
function hotkeyConflicts(bindings, platform) {
	const seen = /* @__PURE__ */ new Map();
	for (const binding of bindings) for (const key of keysOf(binding)) {
		const spec = parseHotkey(key, platform);
		if (spec === void 0) continue;
		const id = canonical(spec);
		const entry = seen.get(id);
		if (entry === void 0) {
			seen.set(id, {
				label: formatHotkey(key, platform),
				ids: [binding.id]
			});
			continue;
		}
		if (!entry.ids.includes(binding.id)) entry.ids.push(binding.id);
	}
	return [...seen.values()].filter((entry) => entry.ids.length > 1).map((entry) => ({
		label: entry.label,
		ids: entry.ids
	}));
}
//#endregion
exports.detectPlatform = detectPlatform;
exports.formatHotkey = formatHotkey;
exports.hotkeyConflicts = hotkeyConflicts;
exports.matchHotkey = matchHotkey;
exports.normalizeKey = normalizeKey;
exports.parseHotkey = parseHotkey;
exports.platformFrom = platformFrom;
