import { blockPlain, isTextblockType, nodeAt, spliceChildren, textblock } from "./tree.js";
//#region src/nodes/horizontal-rule.ts
/**
* 分隔线节点，对齐 Tiptap `HorizontalRule`（`@tiptap/extension-horizontal-rule`）。
*
* 不 import `@tiptap/*`，也不操作 ProseMirror transaction。这里只保留那条节点对外可观察的约定：
* 块级 `hr`、`setHorizontalRule` 之后光标落在规则后、文末没有节点时补 `nextNodeType`、
* 行首 `---` / `—-` / `___ ` / `*** ` 变成节点。真正的编辑器仍由宿主执行
* `commands.setHorizontalRule()`，见 `tiptapEditorHost`。
*/
var HORIZONTAL_RULE_NAME = "horizontalRule";
var HORIZONTAL_RULE_GROUP = "block";
/** Markdown 词法名。渲染结果是 `---`。 */
var HORIZONTAL_RULE_MARKDOWN_TOKEN = "hr";
var HORIZONTAL_RULE_MARKDOWN = "---";
/**
* 与 Tiptap `nodeInputRule` 的 `find` 相同。
* 第二支是 U+2014 EM DASH 再加一个连字符。
*/
var HORIZONTAL_RULE_INPUT = /^(?:---|[\u2014]-|___\s|\*\*\*\s)$/;
var DEFAULT_OPTIONS = {
	HTMLAttributes: {},
	nextNodeType: "paragraph"
};
function horizontalRuleOptions(partial) {
	return {
		HTMLAttributes: partial?.HTMLAttributes ?? DEFAULT_OPTIONS.HTMLAttributes,
		nextNodeType: partial?.nextNodeType && partial.nextNodeType.length > 0 ? partial.nextNodeType : DEFAULT_OPTIONS.nextNodeType
	};
}
function isHorizontalRuleInput(text) {
	return HORIZONTAL_RULE_INPUT.test(text);
}
var ATTR_NAME = /^[A-Za-z_:][\w:.-]*$/;
function safeName(name) {
	return ATTR_NAME.test(name) && !/^on/i.test(name);
}
/** 后者覆盖前者。事件处理属性名会被丢掉。 */
function mergeAttributes(...sources) {
	const out = {};
	for (const source of sources) {
		if (!source) continue;
		for (const [key, value] of Object.entries(source)) {
			if (!safeName(key)) continue;
			out[key] = value;
		}
	}
	return out;
}
function escapeAttr(value) {
	return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}
function readAttributes(source) {
	const attrs = {};
	const re = /([A-Za-z_:][\w:.-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
	let matched = 0;
	for (const match of source.matchAll(re)) {
		matched += match[0].length;
		const name = match[1];
		if (!name || !safeName(name)) continue;
		attrs[name] = match[2] ?? match[3] ?? match[4] ?? "";
	}
	const leftovers = source.replace(/\s/g, "");
	if (matched !== leftovers.length && source.trim().length > 0) {
		if (source.replace(re, "").trim().length > 0) return null;
	}
	return attrs;
}
/** `parseHTML: [{ tag: 'hr' }]`。只接受单独一个 hr 标签。 */
function parseHorizontalRuleHTML(html) {
	const match = /^<hr\b([^>]*)>$/i.exec(html.trim());
	if (!match) return null;
	let raw = (match[1] ?? "").trim();
	if (raw.endsWith("/")) raw = raw.slice(0, -1).trim();
	const htmlAttributes = readAttributes(raw);
	if (!htmlAttributes) return null;
	return {
		type: "horizontalRule",
		htmlAttributes
	};
}
/** `renderHTML`：选项上的 HTMLAttributes 打底，节点自己的属性覆盖。 */
function renderHorizontalRule(node, options) {
	const attrs = mergeAttributes(horizontalRuleOptions(options).HTMLAttributes, node.htmlAttributes);
	const body = Object.entries(attrs).map(([key, value]) => `${key}="${escapeAttr(value)}"`).join(" ");
	return body.length === 0 ? "<hr>" : `<hr ${body}>`;
}
function renderHorizontalRuleMarkdown() {
	return "---";
}
function parseHorizontalRuleMarkdown(token) {
	return token === "hr";
}
function ruleNode(options) {
	const attrs = mergeAttributes(options.HTMLAttributes);
	return Object.keys(attrs).length > 0 ? {
		type: "horizontalRule",
		attrs
	} : { type: "horizontalRule" };
}
function nextTextblock(typeName) {
	if (typeName === "heading") return textblock("heading", "", { level: 1 });
	return textblock("paragraph", "");
}
function finish(root, parentPath, hrIndex, options) {
	const content = (parentPath.length === 0 ? root : nodeAt(root, parentPath))?.content ?? [];
	const next = content[hrIndex + 1];
	if (next && isTextblockType(next.type)) return {
		doc: root,
		selection: {
			kind: "text",
			path: [...parentPath, hrIndex + 1],
			offset: 0
		}
	};
	if (next) return {
		doc: root,
		selection: {
			kind: "node",
			path: [...parentPath, hrIndex + 1],
			offset: 0
		}
	};
	return {
		doc: spliceChildren(root, parentPath, content.length, 0, [nextTextblock(options.nextNodeType)]),
		selection: {
			kind: "text",
			path: [...parentPath, content.length],
			offset: 0
		}
	};
}
/**
* `setHorizontalRule()`。
* 文本光标把当前文本块拆开，规则插在中间；节点选区则插在选中块之后。
* 后面已有文本块时，光标进到那个块的开头；后面是别的块时改成节点选区；
* 后面什么都没有时补 `nextNodeType`（默认段落）。
*/
function setHorizontalRule(doc, options) {
	const resolved = horizontalRuleOptions(options);
	const hr = ruleNode(resolved);
	if ((doc.doc.content ?? []).length === 0) return finish(spliceChildren(doc.doc, [], 0, 0, [hr]), [], 0, resolved);
	const path = doc.selection.path;
	const index = path[path.length - 1];
	const parentPath = path.slice(0, -1);
	if (index === void 0) return doc;
	const siblings = (parentPath.length === 0 ? doc.doc : nodeAt(doc.doc, parentPath))?.content ?? [];
	const at = Math.min(siblings.length - 1, Math.max(0, index));
	const current = siblings[at];
	if (doc.selection.kind === "node" || !current || !isTextblockType(current.type)) return finish(spliceChildren(doc.doc, parentPath, at + 1, 0, [hr]), parentPath, at + 1, resolved);
	const text = blockPlain(current);
	const offset = Math.min(text.length, Math.max(0, doc.selection.offset));
	const left = text.slice(0, offset);
	const right = text.slice(offset);
	const middle = [];
	if (left.length > 0) middle.push(textblock(current.type, left, current.attrs));
	const hrIndex = at + middle.length;
	middle.push(hr);
	if (right.length > 0) middle.push(textblock(current.type, right, current.attrs));
	return finish(spliceChildren(doc.doc, parentPath, at, 1, middle), parentPath, hrIndex, resolved);
}
/**
* 输入规则。光标在文本块末尾，且光标前的整段匹配 `HORIZONTAL_RULE_INPUT` 时，
* 用分隔线换掉这一段，光标规则与 `setHorizontalRule` 相同。
*/
function applyHorizontalRuleInput(doc, options) {
	if (doc.selection.kind !== "text") return null;
	const path = doc.selection.path;
	const current = nodeAt(doc.doc, path);
	if (!current || !isTextblockType(current.type)) return null;
	const text = blockPlain(current);
	if (doc.selection.offset !== text.length || !isHorizontalRuleInput(text)) return null;
	const index = path[path.length - 1];
	if (index === void 0) return null;
	const resolved = horizontalRuleOptions(options);
	const parentPath = path.slice(0, -1);
	return finish(spliceChildren(doc.doc, parentPath, index, 1, [ruleNode(resolved)]), parentPath, index, resolved);
}
//#endregion
export { HORIZONTAL_RULE_GROUP, HORIZONTAL_RULE_INPUT, HORIZONTAL_RULE_MARKDOWN, HORIZONTAL_RULE_MARKDOWN_TOKEN, HORIZONTAL_RULE_NAME, applyHorizontalRuleInput, horizontalRuleOptions, isHorizontalRuleInput, mergeAttributes, parseHorizontalRuleHTML, parseHorizontalRuleMarkdown, renderHorizontalRule, renderHorizontalRuleMarkdown, setHorizontalRule };
