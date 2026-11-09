const require_drop_zone = require("./drop-zone.cjs");
//#region src/shell/drag-context.ts
/**
* 拖放协议：区分**内部拖拽**与**外部拖入**（03 §3 D 组 `OjDragDropContext`，§8.9 类型协商）。
*
* 不看 MIME 就统一处理，是本项目里最容易犯的错：
*   - 把"拖动文档里选中的一段字"当成"拖进来一个文件"，弹"只收 .docx"；
*   - 把"从桌面拖进来的文件"当成内部拖动，直接插进正文变成一段二进制乱码。
*
* 判定靠一个私有 MIME 标记：内部拖拽在 `dragstart` 里写进 `DRAG_MARKER`，
* 外部来源不可能带这个类型。相比"记住鼠标按下了"之类的猜测，这是唯一稳定的信号。
*/
/** 内部拖拽标记。私有 MIME 不会被任何外部应用发出。 */
var DRAG_MARKER = "application/x-oj-drag";
/** 内部拖拽写入的内容：标记 + 宿主数据 + 可选富文本兜底（拖到别的应用时还能用）。 */
function writeInternalDrag(transfer, payload) {
	transfer.setData(DRAG_MARKER, payload.id);
	if (payload.html !== void 0) transfer.setData("text/html", payload.html);
	if (payload.text !== void 0) transfer.setData("text/plain", payload.text);
}
function safeGetData(transfer, format) {
	try {
		return transfer.getData(format);
	} catch {
		return "";
	}
}
/**
* 读一次拖放载荷。`types` 里带标记就是内部拖拽，此时不再当文件处理——
* 内部拖拽同样会带 `text/html`，只看那些类型永远分不开。
*/
function readTransfer(transfer) {
	const files = [...transfer.files];
	const internal = transfer.types.some((type) => type.trim().toLowerCase() === DRAG_MARKER);
	return {
		kind: internal ? "internal" : require_drop_zone.classifyTransfer(transfer.types),
		files,
		html: safeGetData(transfer, "text/html"),
		text: safeGetData(transfer, "text/plain"),
		data: internal ? safeGetData(transfer, DRAG_MARKER) : ""
	};
}
/** MIME 规则（含通配）能否命中这次拖拽。拖入阶段拿不到文件名，只能按类型先判。 */
function mimeMatches(types, rules) {
	const actual = types.map((type) => type.trim().toLowerCase());
	return rules.some((rule) => {
		const value = rule.trim().toLowerCase();
		const slash = value.indexOf("/");
		if (slash <= 0) return false;
		if (value.endsWith("/*")) {
			const prefix = value.slice(0, slash + 1);
			return actual.some((type) => type.startsWith(prefix));
		}
		return actual.includes(value);
	});
}
/**
* 这次拖拽是否归我们处理。
*
* 文件分支的规则很别扭但必须这样：`accept.types` 里只有扩展名（`.docx`）时，
* 拖入阶段**没有文件名**，只能放行，等 `drop` 再靠 `selectDropped` 判；
* 反过来若按"扩展名不匹配 MIME"直接拒绝，用户会看到遮罩根本不出现，也就再没法导入。
* 含 `/` 的规则（`application/pdf`、`image/*`）则必须命中，能提前挡掉明显不对的拖拽。
*/
function negotiateTransfer(types, accept = {}) {
	if (types.some((type) => type.trim().toLowerCase() === "application/x-oj-drag")) return true;
	const kind = require_drop_zone.classifyTransfer(types);
	if (kind === "files") {
		const mimeRules = (accept.types ?? []).filter((rule) => rule.includes("/"));
		if (mimeRules.length === 0) return true;
		return mimeMatches(types, mimeRules);
	}
	if (kind === "none") return false;
	return accept.text === true;
}
//#endregion
exports.DRAG_MARKER = DRAG_MARKER;
exports.negotiateTransfer = negotiateTransfer;
exports.readTransfer = readTransfer;
exports.writeInternalDrag = writeInternalDrag;
