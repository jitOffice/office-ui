//#region src/shell/number-field.ts
function normalizeStep(step) {
	if (step === void 0 || !Number.isFinite(step) || step <= 0) return 1;
	return step;
}
function normalizePrecision(precision) {
	if (precision === void 0 || !Number.isFinite(precision) || precision <= 0) return 0;
	return Math.min(Math.floor(precision), 6);
}
/** 按精度取整。用 `Number(x.toFixed(n))` 而不是 `Math.round(x * 10^n) / 10^n`，后者有浮点尾数。 */
function roundTo(value, precision) {
	const digits = normalizePrecision(precision);
	if (!Number.isFinite(value)) return 0;
	return Number(value.toFixed(digits));
}
/**
* 夹进 `[min, max]`。`min > max`（配置写反）时**以 min 为准**：
* 宁可显示下限，也不要把 `NaN` 或越界值写回使用方的状态。
*/
function clampNumber(value, bounds = {}) {
	const rounded = roundTo(value, bounds.precision);
	const { min, max } = bounds;
	if (min !== void 0 && Number.isFinite(min) && rounded < min) return roundTo(min, bounds.precision);
	if (max !== void 0 && Number.isFinite(max) && rounded > max) return roundTo(max, bounds.precision);
	return rounded;
}
/**
* 步进一次并夹取。
*
* 从上限往下减时先减到上限再减 step：值本来就在界外（使用方传了脏数据）时，
* 用户点一下减号应该**立刻回到合法区间**，而不是在界外一格一格挪。
*/
function stepNumber(value, direction, bounds = {}) {
	return clampNumber(roundTo(clampNumber(value, bounds) + direction * normalizeStep(bounds.step), bounds.precision), bounds);
}
/**
* 解析用户输入。返回 `undefined` 表示"不提交，回退到当前值"。
*
* 认这些：`12`、` 12 `、`12px`（单位由调用方决定，这里只取数字）、`-3`、`+3`、`1.5`、`1,5`（欧洲键盘）。
* 不认：空串、`-`、`12abc`、`1e3`（指数写法在字号/行距里没有意义，放进来只会让人误以为支持）。
*/
function parseNumberDraft(text) {
	const trimmed = text.trim().replace(",", ".");
	if (trimmed.length === 0) return void 0;
	const match = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:px|pt|%|em|rem|cm|mm|in)?$/i.exec(trimmed);
	if (match === null) return void 0;
	const numeric = match[0].replace(/[a-z%]+$/i, "");
	const value = Number(numeric);
	return Number.isFinite(value) ? value : void 0;
}
//#endregion
export { clampNumber, parseNumberDraft, roundTo, stepNumber };
