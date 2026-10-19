//#region src/shell/search.ts
function searchHits(text, query) {
	if (query.find.length === 0) return [];
	const source = query.matchCase ? text : text.toLowerCase();
	const needle = query.matchCase ? query.find : query.find.toLowerCase();
	const hits = [];
	let from = 0;
	while (from <= source.length) {
		const at = source.indexOf(needle, from);
		if (at < 0) break;
		hits.push({
			start: at,
			end: at + needle.length
		});
		from = at + Math.max(needle.length, 1);
	}
	return hits;
}
function replaceOne(text, hit, replacement) {
	return text.slice(0, hit.start) + replacement + text.slice(hit.end);
}
function replaceAll(text, query) {
	const hits = searchHits(text, query);
	let out = "";
	let cursor = 0;
	for (const hit of hits) {
		out += text.slice(cursor, hit.start) + query.replace;
		cursor = hit.end;
	}
	return {
		text: out + text.slice(cursor),
		count: hits.length
	};
}
/** 没有命中时返回 -1。 */
function neighbor(index, count, direction) {
	if (count <= 0) return -1;
	return ((index < 0 ? direction > 0 ? -1 : 0 : index) + direction + count) % count;
}
//#endregion
exports.neighbor = neighbor;
exports.replaceAll = replaceAll;
exports.replaceOne = replaceOne;
exports.searchHits = searchHits;
