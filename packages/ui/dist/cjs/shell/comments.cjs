//#region src/shell/comments.ts
/**
* 追加回复。**不改变解决状态**：已解决的线程收到回复仍是已解决，
* 想重开得显式点"重新打开"——反过来（自动重开）会让"我回复一句确认"变成一次状态回退。
*
* 空文本直接返回原对象（引用不变）：上游 `watch` 不会因为一次空提交重渲染。
*/
function addReply(thread, reply) {
	if (reply.text.trim().length === 0) return thread;
	return {
		...thread,
		replies: [...thread.replies, reply]
	};
}
/** 切换解决状态。传 `resolved` 而不是"翻转"，因为协同下两次点击可能基于同一个旧状态。 */
function setResolved(thread, resolved) {
	if (thread.resolved === resolved) return thread;
	return {
		...thread,
		resolved
	};
}
function commentCounts(threads) {
	let open = 0;
	let replies = 0;
	for (const thread of threads) {
		if (!thread.resolved) open += 1;
		replies += thread.replies.length;
	}
	return {
		total: threads.length,
		open,
		resolved: threads.length - open,
		replies
	};
}
/** 侧栏筛选。不认识的取值按 `all` 处理：筛选器是 UI 状态，不该因为一个脏值让列表整个空掉。 */
function filterThreads(threads, filter) {
	if (filter === "open") return threads.filter((thread) => !thread.resolved);
	if (filter === "resolved") return threads.filter((thread) => thread.resolved);
	return [...threads];
}
/**
* 下一条未解决批注的 id（侧栏"下一个批注"按钮用）。
*
* 到末尾**不环绕**：环绕会让"已看完最后一条"变成"跳回第一条"，用户不知道看完了。
* 全部已解决时返回 `undefined`，让按钮自己灰掉。
*/
function nextOpenThread(threads, currentId, direction = 1) {
	const open = threads.filter((thread) => !thread.resolved);
	if (open.length === 0) return void 0;
	const index = open.findIndex((thread) => thread.id === currentId);
	if (index === -1) return direction === 1 ? open[0]?.id : open[open.length - 1]?.id;
	return open[index + direction]?.id;
}
//#endregion
exports.addReply = addReply;
exports.commentCounts = commentCounts;
exports.filterThreads = filterThreads;
exports.nextOpenThread = nextOpenThread;
exports.setResolved = setResolved;
