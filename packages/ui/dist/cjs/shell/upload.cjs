//#region src/shell/upload.ts
function bytes(value) {
	if (value === void 0 || !Number.isFinite(value)) return 0;
	return Math.max(0, Math.floor(value));
}
function createUpload(input) {
	return {
		id: input.id,
		name: input.name,
		size: bytes(input.size),
		loaded: 0,
		state: "queued",
		attempts: 0
	};
}
/** 开始上传。已经结束或正在传的项返回原对象，避免宿主重复触发。 */
function startUpload(item) {
	if (item.state === "uploading" || item.state === "done" || item.state === "failed") return item;
	return {
		id: item.id,
		name: item.name,
		size: item.size,
		loaded: item.loaded,
		state: "uploading",
		attempts: item.attempts
	};
}
/**
* 推进进度。只有 `uploading` 接受推进：暂停期间到达的分片回报必须丢掉，
* 否则界面会在"已暂停"上继续涨进度，用户以为暂停没生效。
*/
function advanceUpload(item, loaded) {
	if (item.state !== "uploading") return item;
	const next = Math.min(bytes(loaded), item.size);
	if (next < item.loaded) return item;
	if (next >= item.size) return {
		...item,
		loaded: item.size,
		state: "done"
	};
	if (next === item.loaded) return item;
	return {
		...item,
		loaded: next
	};
}
function pauseUpload(item) {
	if (item.state !== "uploading") return item;
	return {
		...item,
		state: "paused"
	};
}
/** 继续：暂停 → 上传中。失败项要走 `retryUpload`，两者语义不同（一个续传、一个重试）。 */
function resumeUpload(item) {
	if (item.state !== "paused") return item;
	return {
		...item,
		state: "uploading"
	};
}
/** 记一次失败。已传字节保留，重试时从断点继续。 */
function failUpload(item, error) {
	if (item.state !== "uploading") return item;
	return error === void 0 ? {
		...item,
		state: "failed",
		attempts: item.attempts + 1
	} : {
		...item,
		state: "failed",
		attempts: item.attempts + 1,
		error
	};
}
function retryUpload(item) {
	if (item.state !== "failed") return item;
	return {
		id: item.id,
		name: item.name,
		size: item.size,
		loaded: item.loaded,
		state: "uploading",
		attempts: item.attempts
	};
}
/** 0..1。大小为 0 的项没有"进度"，只有"完成没完成"。 */
function uploadPercent(item) {
	if (item.size <= 0) return item.state === "done" ? 1 : 0;
	return Math.min(1, Math.max(0, item.loaded / item.size));
}
/**
* 下一个要发的分片。
*
* `start` 取当前分片的起点而不是 `loaded`：半个分片拼不起来，重发整片是幂等的。
* 非上传态或已传完返回 `undefined`——调用方据此停下发送循环，而不是靠 `0 字节` 判断。
*/
function nextChunk(item, chunkSize) {
	if (item.state !== "uploading" && item.state !== "paused") return void 0;
	if (!Number.isFinite(chunkSize) || chunkSize <= 0) return void 0;
	if (item.loaded >= item.size) return void 0;
	const size = Math.floor(chunkSize);
	const index = Math.floor(item.loaded / size);
	const start = index * size;
	return {
		index,
		start,
		end: Math.min(item.size, start + size)
	};
}
function uploadSummary(items) {
	let done = 0;
	let failed = 0;
	let active = 0;
	let loaded = 0;
	let size = 0;
	for (const item of items) {
		if (item.state === "done") done += 1;
		else if (item.state === "failed") failed += 1;
		else active += 1;
		loaded += item.loaded;
		size += item.size;
	}
	const percent = size > 0 ? loaded / size : items.length > 0 && done === items.length ? 1 : 0;
	return {
		count: items.length,
		done,
		failed,
		active,
		loaded,
		size,
		percent
	};
}
//#endregion
exports.advanceUpload = advanceUpload;
exports.createUpload = createUpload;
exports.failUpload = failUpload;
exports.nextChunk = nextChunk;
exports.pauseUpload = pauseUpload;
exports.resumeUpload = resumeUpload;
exports.retryUpload = retryUpload;
exports.startUpload = startUpload;
exports.uploadPercent = uploadPercent;
exports.uploadSummary = uploadSummary;
