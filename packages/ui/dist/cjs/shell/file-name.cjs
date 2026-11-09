//#region src/shell/file-name.ts
/** Windows 保留字符（不含 `\0`，它在 JS 字符串里根本进不来）。 */
var ILLEGAL = /[\\/:*?"<>|]/;
/** Windows 保留设备名。大小写不敏感，且带扩展名也是保留的（`CON.txt` 同样建不出来）。 */
var RESERVED = /* @__PURE__ */ new Set([
	"con",
	"prn",
	"aux",
	"nul",
	...Array.from({ length: 9 }, (_, index) => `com${index + 1}`),
	...Array.from({ length: 9 }, (_, index) => `lpt${index + 1}`)
]);
/**
* 校验文件名。返回 `undefined` 表示可用。
*
* 首尾空白先裁掉再判空：`"  "` 是用户想清空名字的常见中间态，它必须报 `empty` 而不是"可用"。
* `.` 与 `..` 归到 `reserved`：它们在所有平台上都不是合法文件名，但也不是"空"。
*/
function fileNameProblem(name) {
	const trimmed = name.trim();
	if (trimmed.length === 0) return "empty";
	if (trimmed === "." || trimmed === "..") return "reserved";
	if (ILLEGAL.test(trimmed)) return "illegal";
	const stem = trimmed.split(".")[0]?.toLowerCase() ?? "";
	if (RESERVED.has(stem)) return "reserved";
}
/**
* 重命名结果。**与原值相同视为成功且返回原名**（不是"没变化所以失败"）：
* 用户回车确认一个没改的名字，界面应该退出编辑态，而不是弹错误。
*/
function renameFile(current, next) {
	const trimmed = next.trim();
	if (trimmed === current) return {
		ok: true,
		name: current
	};
	const problem = fileNameProblem(trimmed);
	if (problem !== void 0) return {
		ok: false,
		problem
	};
	return {
		ok: true,
		name: trimmed
	};
}
/**
* 保存态是否处于"还没落盘"的状态。
*
* 标题栏要据此显示小圆点/星号，而 `saving` 也算未落盘：显示成"已保存"再改回来，
* 用户会看到状态闪两下，误以为保存失败了两次。
*/
function isDirty(state) {
	return state !== "saved";
}
//#endregion
exports.fileNameProblem = fileNameProblem;
exports.isDirty = isDirty;
exports.renameFile = renameFile;
