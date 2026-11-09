//#region src/shell/versions.ts
var IDLE_RESTORE = { status: "idle" };
/** 新的在前；时间相同保持原有顺序（`Array.prototype.sort` 是稳定排序）。 */
function sortVersions(entries) {
	return [...entries].sort((left, right) => right.at - left.at);
}
function latestVersion(entries) {
	return sortVersions(entries)[0];
}
/** 建条目：时间非数字归 0（宁可排在最后，也不要整列顺序变成随机）。 */
function createVersion(input) {
	return {
		id: input.id,
		at: Number.isFinite(input.at) ? input.at : 0,
		author: input.author.trim(),
		...input.name === void 0 ? {} : { name: input.name },
		...input.summary === void 0 ? {} : { summary: input.summary }
	};
}
/**
* 重命名。空白名字等于"去掉名字"，退回自动版本——
* 清空输入框却留下一个空标题的条目，用户会以为重命名失败了。
*/
function renameVersion(entries, id, name) {
	const trimmed = name.trim();
	let changed = false;
	const next = entries.map((entry) => {
		if (entry.id !== id) return entry;
		if ((entry.name ?? "") === trimmed) return entry;
		changed = true;
		if (trimmed === "") return {
			id: entry.id,
			at: entry.at,
			author: entry.author,
			...entry.summary === void 0 ? {} : { summary: entry.summary }
		};
		return {
			...entry,
			name: trimmed
		};
	});
	return changed ? next : entries;
}
function deleteVersion(entries, id) {
	const next = entries.filter((entry) => entry.id !== id);
	return next.length === entries.length ? entries : next;
}
/** 请求恢复：进入"待确认"。同一条重复请求返回原对象。 */
function requestRestore(state, entryId) {
	if (state.status === "confirming" && state.entryId === entryId) return state;
	return {
		status: "confirming",
		entryId
	};
}
function cancelRestore(state) {
	return state.status === "idle" ? state : IDLE_RESTORE;
}
/** 用户点了"确认恢复"：进入执行态，组件据此上抛 `restore`。 */
function confirmRestore(state) {
	if (state.status !== "confirming") return state;
	return {
		status: "restoring",
		entryId: state.entryId
	};
}
function restoreEntryId(state) {
	return state.status === "idle" ? void 0 : state.entryId;
}
//#endregion
export { IDLE_RESTORE, cancelRestore, confirmRestore, createVersion, deleteVersion, latestVersion, renameVersion, requestRestore, restoreEntryId, sortVersions };
