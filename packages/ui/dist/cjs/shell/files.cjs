//#region src/shell/files.ts
function filterTree(nodes, query) {
	const needle = query.trim().toLowerCase();
	if (needle.length === 0) return nodes.map((node) => node);
	const walk = (node) => {
		if (node.name.toLowerCase().includes(needle)) return node;
		const children = node.children?.map(walk).filter((item) => item !== null);
		if (children && children.length > 0) return {
			...node,
			children
		};
		return null;
	};
	return nodes.map(walk).filter((item) => item !== null);
}
function toggleId(open, id) {
	return open.includes(id) ? open.filter((item) => item !== id) : [...open, id];
}
//#endregion
exports.filterTree = filterTree;
exports.toggleId = toggleId;
