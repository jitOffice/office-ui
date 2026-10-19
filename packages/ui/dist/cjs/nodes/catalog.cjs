const require_horizontal_rule = require("./horizontal-rule.cjs");
//#region src/nodes/catalog.ts
/**
* 节点扩展目录。形状对齐 Tiptap 的 Node：
* https://tiptap.dev/docs/editor/extensions/nodes
*
* 每个节点声明 name、group、content、parseHTML、命令名、快捷键和输入规则。
* 这里不 import `@tiptap/*`。命令真正改文档的函数在 `document.ts`。
*/
var none = {};
var documentNode = {
	name: "doc",
	group: "block",
	content: "block+",
	parseHTML: [],
	renderTag: "div",
	commands: [],
	shortcuts: none
};
var paragraphNode = {
	name: "paragraph",
	group: "block",
	content: "inline*",
	parseHTML: [{ tag: "p" }],
	renderTag: "p",
	commands: ["setParagraph"],
	shortcuts: none
};
var textNode = {
	name: "text",
	group: "inline",
	content: "",
	parseHTML: [],
	renderTag: "",
	commands: [],
	shortcuts: none
};
var headingNode = {
	name: "heading",
	group: "block",
	content: "inline*",
	defining: true,
	parseHTML: [
		{ tag: "h1" },
		{ tag: "h2" },
		{ tag: "h3" },
		{ tag: "h4" },
		{ tag: "h5" },
		{ tag: "h6" }
	],
	renderTag: "h1",
	commands: ["setHeading", "toggleHeading"],
	shortcuts: {
		"Mod-Alt-1": "toggleHeading",
		"Mod-Alt-2": "toggleHeading",
		"Mod-Alt-3": "toggleHeading",
		"Mod-Alt-4": "toggleHeading",
		"Mod-Alt-5": "toggleHeading",
		"Mod-Alt-6": "toggleHeading"
	},
	input: /^(#{1,6})\s$/
};
var blockquoteNode = {
	name: "blockquote",
	group: "block",
	content: "block+",
	defining: true,
	parseHTML: [{ tag: "blockquote" }],
	renderTag: "blockquote",
	commands: [
		"setBlockquote",
		"toggleBlockquote",
		"unsetBlockquote"
	],
	shortcuts: { "Mod-Shift-b": "toggleBlockquote" },
	input: /^\s*>\s$/
};
var bulletListNode = {
	name: "bulletList",
	group: "block",
	content: "listItem+",
	parseHTML: [{ tag: "ul" }],
	renderTag: "ul",
	commands: ["toggleBulletList"],
	shortcuts: { "Mod-Shift-8": "toggleBulletList" },
	input: /^\s*[-+*]\s$/
};
var orderedListNode = {
	name: "orderedList",
	group: "block",
	content: "listItem+",
	parseHTML: [{ tag: "ol" }],
	renderTag: "ol",
	commands: ["toggleOrderedList"],
	shortcuts: { "Mod-Shift-7": "toggleOrderedList" },
	input: /^(\d+)\.\s$/
};
var listItemNode = {
	name: "listItem",
	group: "block",
	content: "paragraph block*",
	defining: true,
	parseHTML: [{ tag: "li" }],
	renderTag: "li",
	commands: [],
	shortcuts: none
};
var codeBlockNode = {
	name: "codeBlock",
	group: "block",
	content: "text*",
	defining: true,
	parseHTML: [{ tag: "pre" }],
	renderTag: "pre",
	commands: ["setCodeBlock", "toggleCodeBlock"],
	shortcuts: { "Mod-Alt-c": "toggleCodeBlock" },
	input: /^```([a-z]+)?[\s\n]$/
};
var hardBreakNode = {
	name: "hardBreak",
	group: "inline",
	content: "",
	atom: true,
	parseHTML: [{ tag: "br" }],
	renderTag: "br",
	commands: ["setHardBreak"],
	shortcuts: {
		"Shift-Enter": "setHardBreak",
		"Mod-Enter": "setHardBreak"
	}
};
var horizontalRuleNode = {
	name: "horizontalRule",
	group: "block",
	content: "",
	atom: true,
	parseHTML: [{ tag: "hr" }],
	renderTag: "hr",
	commands: ["setHorizontalRule"],
	shortcuts: none,
	input: require_horizontal_rule.HORIZONTAL_RULE_INPUT,
	markdownToken: "hr",
	markdown: "---"
};
var imageNode = {
	name: "image",
	group: "block",
	content: "",
	atom: true,
	parseHTML: [{ tag: "img" }],
	renderTag: "img",
	commands: ["setImage"],
	shortcuts: none
};
/** 与 Tiptap StarterKit 的节点集合对应，另加 image。 */
var starterNodes = [
	documentNode,
	paragraphNode,
	textNode,
	headingNode,
	blockquoteNode,
	bulletListNode,
	orderedListNode,
	listItemNode,
	codeBlockNode,
	hardBreakNode,
	horizontalRuleNode,
	imageNode
];
function nodeExtension(name) {
	return starterNodes.find((node) => node.name === name);
}
/** 把光标前的文本交给各节点的 input。先匹配的规则生效。 */
function matchNodeInput(before) {
	const heading = headingNode.input?.exec(before);
	const marks = heading?.[1];
	if (heading && marks) return {
		node: "heading",
		consume: before.length,
		level: marks.length
	};
	if (blockquoteNode.input?.test(before)) return {
		node: "blockquote",
		consume: before.length
	};
	if (bulletListNode.input?.test(before)) return {
		node: "bulletList",
		consume: before.length
	};
	if (orderedListNode.input?.test(before)) return {
		node: "orderedList",
		consume: before.length
	};
	if (codeBlockNode.input?.test(before)) return {
		node: "codeBlock",
		consume: before.length
	};
	if (horizontalRuleNode.input?.test(before)) return {
		node: "horizontalRule",
		consume: before.length
	};
	return null;
}
//#endregion
exports.blockquoteNode = blockquoteNode;
exports.bulletListNode = bulletListNode;
exports.codeBlockNode = codeBlockNode;
exports.documentNode = documentNode;
exports.hardBreakNode = hardBreakNode;
exports.headingNode = headingNode;
exports.horizontalRuleNode = horizontalRuleNode;
exports.imageNode = imageNode;
exports.listItemNode = listItemNode;
exports.matchNodeInput = matchNodeInput;
exports.nodeExtension = nodeExtension;
exports.orderedListNode = orderedListNode;
exports.paragraphNode = paragraphNode;
exports.starterNodes = starterNodes;
exports.textNode = textNode;
