//#region src/nodes/tree.ts
var TEXTBLOCKS = /* @__PURE__ */ new Set([
	"paragraph",
	"heading",
	"codeBlock"
]);
function isTextblockType(type) {
	return TEXTBLOCKS.has(type);
}
function createDocument(text = "") {
	return {
		doc: {
			type: "doc",
			content: [textblock("paragraph", text)]
		},
		selection: {
			kind: "text",
			path: [0],
			offset: text.length
		}
	};
}
function textblock(type, text, attrs) {
	const content = text.length > 0 ? [{
		type: "text",
		text
	}] : [];
	return attrs ? {
		type,
		attrs,
		content
	} : {
		type,
		content
	};
}
/** 文本块的可见文字。硬换行算作一个换行符。 */
function blockPlain(node) {
	if (node.type === "text") return node.text ?? "";
	if (node.type === "hardBreak") return "\n";
	if (!isTextblockType(node.type)) return "";
	return (node.content ?? []).map((child) => blockPlain(child)).join("");
}
function nodeAt(root, path) {
	let current = root;
	for (const index of path) {
		const next = current.content?.[index];
		if (!next) return null;
		current = next;
	}
	return current;
}
function spliceChildren(root, parentPath, index, deleteCount, insert) {
	if (parentPath.length === 0) {
		const content = [...root.content ?? []];
		content.splice(index, deleteCount, ...insert);
		return {
			...root,
			content
		};
	}
	const [head, ...rest] = parentPath;
	if (head === void 0) return root;
	const content = [...root.content ?? []];
	const child = content[head];
	if (!child) return root;
	content[head] = spliceChildren(child, rest, index, deleteCount, insert);
	return {
		...root,
		content
	};
}
/** 按阅读顺序收集文本块。块与块之间用换行符隔开，和 `plainText` 一致。 */
function textblocks(root) {
	const hits = [];
	let cursor = 0;
	const walk = (node, path) => {
		if (isTextblockType(node.type)) {
			const text = blockPlain(node);
			hits.push({
				path,
				node,
				start: cursor,
				end: cursor + text.length
			});
			cursor += text.length + 1;
			return;
		}
		node.content?.forEach((child, index) => walk(child, [...path, index]));
	};
	walk(root, []);
	return hits;
}
function plainText(doc) {
	return textblocks(doc.doc).map((hit) => blockPlain(hit.node)).join("\n");
}
function withPlain(doc, plain) {
	const hits = textblocks(doc.doc);
	const parts = plain.split("\n");
	if (parts.length !== hits.length) return doc;
	let root = doc.doc;
	hits.forEach((hit, index) => {
		const text = parts[index] ?? "";
		const parentPath = hit.path.slice(0, -1);
		const at = hit.path[hit.path.length - 1];
		if (at === void 0) return;
		root = spliceChildren(root, parentPath, at, 1, [textblock(hit.node.type, text, hit.node.attrs)]);
	});
	return {
		...doc,
		doc: root
	};
}
//#endregion
export { blockPlain, createDocument, isTextblockType, nodeAt, plainText, spliceChildren, textblock, textblocks, withPlain };
