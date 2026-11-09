//#region src/shell/people.ts
/**
* 头像色板档数：4 档（品牌 / 成功 / 警告 / 危险四组"浅底 + 同色字"）。
*
* 不按色阶（`--oj-brand-3..9`）取 8 档：色阶在暗色主题里是**反向**的
* （浅色下 brand-3 是浅蓝、暗色下 brand-3 是深蓝），"浅底 + 深字"的配对会整体翻转，
* 于是同一套规则在暗色下变成"深底 + 深字"。用语义色（`--oj-bg-*-subtle` / `--oj-text-*`）
* 让主题自己保证对比度，代价是只有 4 档——4 档足够区分同桌的几个人。
*/
var AVATAR_TONES = 4;
/**
* 头像上的首字母。
*
* 拉丁名取首尾两词首字母（`Ada Lovelace` → `AL`），单字取首字符，中日韩整名取**首字**——
* 取末字会让"张伟 / 王伟"这类名字在头像上撞成同一个字。
*
* 中日韩名字中间带空格（`王 伟`）时仍只取一个字：这类空格是排版习惯，不是"两个词"，
* 取两个字符在圆形头像里会挤成一团。
*
* 用 `[...name]` 而不是 `name[0]`：emoji 与部分 CJK 扩展字是代理对，按 UTF-16 切会切出半个字符。
*/
var CJK = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uac00-\ud7af]/;
function initialsOf(name) {
	const parts = name.trim().split(/\s+/).filter((part) => part.length > 0);
	if (parts.length === 0) return "";
	const first = [...parts[0]][0] ?? "";
	if (parts.length === 1 || CJK.test(first)) return first.toUpperCase();
	return (first + ([...parts[parts.length - 1]][0] ?? "")).toUpperCase();
}
/**
* 色板序号：稳定哈希，同一 `id` 永远同一档。
*
* 不用 `charCodeAt(0)` 取模：`user-1`/`user-2`… 这类 id 的首字符全一样，会全部撞到同一档；
* djb2 变体对"前缀相同、尾号不同"的 id 分布足够散。
*/
function avatarTone(person) {
	if (person.tone !== void 0 && Number.isInteger(person.tone)) return (person.tone % 4 + 4) % 4;
	let hash = 5381;
	for (let index = 0; index < person.id.length; index += 1) hash = (hash << 5) + hash + person.id.charCodeAt(index) >>> 0;
	return hash % 4;
}
/**
* 头像堆叠：超过 `max` 个就折叠，**折叠数不含"更多"按钮自身**（按钮显示 `overflow` 个人）。
*
* `max` 为 0 时返回空 + 全折叠：调用方据此在窄侧栏里把整组隐藏掉，而不是渲染一个 `+5` 再也没地方展开。
* `max` 非整数或负数按 0 处理——`max` 常常来自"容器宽度算出来的档数"，算错时应该什么都不画，而不是画非整数个。
*/
function stackPeople(people, max) {
	const limit = Number.isFinite(max) && max > 0 ? Math.floor(max) : 0;
	if (limit === 0) return {
		visible: [],
		overflow: people.length
	};
	if (people.length <= limit) return {
		visible: [...people],
		overflow: 0
	};
	const shown = Math.max(limit - 1, 0);
	return {
		visible: people.slice(0, shown),
		overflow: people.length - shown
	};
}
//#endregion
exports.AVATAR_TONES = AVATAR_TONES;
exports.avatarTone = avatarTone;
exports.initialsOf = initialsOf;
exports.stackPeople = stackPeople;
