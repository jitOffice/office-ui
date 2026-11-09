//#region src/shell/review.ts
var REVIEW_KINDS = [
	"insert",
	"delete",
	"format"
];
function match(change, filter) {
	const kind = filter.kind ?? "all";
	const authorId = filter.authorId ?? "all";
	if (kind !== "all" && change.kind !== kind) return false;
	if (authorId !== "all" && change.author.id !== authorId) return false;
	return true;
}
/** 按种类/作者筛选，保持原有顺序（顺序即文档位置，重排会让"下一个修订"跳着走）。 */
function filterChanges(changes, filter) {
	return changes.filter((change) => match(change, filter));
}
/** 移除一条已决策的修订。找不到时返回原对象（引用不变，避免无意义重渲染）。 */
function decideChange(changes, id) {
	const index = changes.findIndex((change) => change.id === id);
	if (index === -1) return changes;
	return [...changes.slice(0, index), ...changes.slice(index + 1)];
}
/**
* 批量决策：删除**当前筛选结果**里的全部修订。
*
* 语义按"当前所见"而不是"全部"：用户在"只看张三"的筛选下点"全部接受"，
* 期望的是把张三的这几条处理掉；连别人的一起处理是数据事故。
*/
function decideAll(changes, filter) {
	return changes.filter((change) => !match(change, filter));
}
function reviewCounts(changes) {
	const counts = {
		total: changes.length,
		insert: 0,
		delete: 0,
		format: 0
	};
	for (const change of changes) counts[change.kind] += 1;
	return counts;
}
/** 列表里出现过的作者（按首次出现顺序），给筛选下拉用。 */
function changeAuthors(changes) {
	const seen = /* @__PURE__ */ new Map();
	for (const change of changes) if (!seen.has(change.author.id)) seen.set(change.author.id, change.author);
	return [...seen.values()];
}
//#endregion
export { REVIEW_KINDS, changeAuthors, decideAll, decideChange, filterChanges, reviewCounts };
