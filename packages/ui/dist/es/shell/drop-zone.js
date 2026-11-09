//#region src/shell/drop-zone.ts
/**
* 按 `DataTransfer.types` 判断载荷种类。`types` 是**小写**的 MIME 列表，不是文件名。
*
* 顺序即优先级：文件优先于富文本，富文本优先于纯文本（前者信息更全）。
* 同时带 `text/html` 与 `text/plain` 是浏览器对富文本的常规做法，取 html 才不会丢掉格式。
*/
function classifyTransfer(types) {
	let html = false;
	let text = false;
	for (const entry of types) {
		const value = entry.trim().toLowerCase();
		if (value === "files" || value === "application/x-moz-file") return "files";
		if (value === "text/html") html = true;
		else if (value === "text/plain") text = true;
	}
	return html ? "html" : text ? "text" : "none";
}
/** 扩展名（小写、带点）。没有扩展名或点在开头（`.gitignore`）时返回空串。 */
function extensionOf(name) {
	const index = name.lastIndexOf(".");
	if (index <= 0 || index === name.length - 1) return "";
	return name.slice(index).toLowerCase();
}
/** 单个文件是否被受理。`accept.types` 为空/未给时一律受理。 */
function acceptsFile(file, accept) {
	const types = accept.types ?? [];
	if (types.length === 0) return true;
	const extension = extensionOf(file.name);
	const mime = (file.type ?? "").toLowerCase();
	for (const entry of types) {
		const rule = entry.trim().toLowerCase();
		if (rule.length === 0) continue;
		if (rule.startsWith(".")) {
			if (extension === rule) return true;
			continue;
		}
		if (rule.endsWith("/*")) {
			if (mime.startsWith(rule.slice(0, -1))) return true;
			continue;
		}
		if (mime === rule) return true;
	}
	return false;
}
/**
* 一次拖放的整体判定。`multiple: false` 时**只收第一个**，其余算数量超限。
*
* 不把"多选"当格式错误：这两种拒绝在界面上要给的提示完全不同
* （"这个格式不支持" vs "一次只能传一个"），混成一条会让用户改错方向。
*/
function selectDropped(files, accept) {
	const multiple = accept.multiple !== false;
	const accepted = [];
	let rejected;
	for (const file of files) {
		if (!acceptsFile(file, accept)) {
			rejected = "type";
			continue;
		}
		if (!multiple && accepted.length >= 1) {
			if (rejected === void 0) rejected = "count";
			continue;
		}
		accepted.push(file);
	}
	return {
		accepted,
		rejected
	};
}
//#endregion
export { acceptsFile, classifyTransfer, extensionOf, selectDropped };
