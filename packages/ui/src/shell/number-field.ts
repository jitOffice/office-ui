/**
 * 数值输入的模型（03 §3 `OjNumberField` 一类控件的共用部分）。
 *
 * 抽成纯函数而不是写在组件里，是因为数值框的坑全在边界上，而边界在浏览器里最难复现：
 *   - 用户输入 `"12px"`、`"1,5"`、`""`、`"-"` 时该提交什么；
 *   - `min` 大于 `max`（配置写错）时不能把界面卡死；
 *   - 小数位数不能靠 `toFixed` 现算，否则 `0.1 + 0.2` 会变成 `0.30000000000000004` 写回输入框。
 *
 * 这些都能在 `node --test` 里断言，不需要 DOM。
 */

export interface NumberBounds {
  min?: number | undefined
  max?: number | undefined
  /** 每次步进的量，非法值按 1 处理。 */
  step?: number | undefined
  /** 小数位数（0 = 整数）。负数按 0 处理。 */
  precision?: number | undefined
}

function normalizeStep(step: number | undefined): number {
  if (step === undefined || !Number.isFinite(step) || step <= 0) return 1
  return step
}

function normalizePrecision(precision: number | undefined): number {
  if (precision === undefined || !Number.isFinite(precision) || precision <= 0) return 0
  return Math.min(Math.floor(precision), 6)
}

/** 按精度取整。用 `Number(x.toFixed(n))` 而不是 `Math.round(x * 10^n) / 10^n`，后者有浮点尾数。 */
export function roundTo(value: number, precision: number | undefined): number {
  const digits = normalizePrecision(precision)
  if (!Number.isFinite(value)) return 0
  return Number(value.toFixed(digits))
}

/**
 * 夹进 `[min, max]`。`min > max`（配置写反）时**以 min 为准**：
 * 宁可显示下限，也不要把 `NaN` 或越界值写回使用方的状态。
 */
export function clampNumber(value: number, bounds: NumberBounds = {}): number {
  const rounded = roundTo(value, bounds.precision)
  const { min, max } = bounds
  if (min !== undefined && Number.isFinite(min) && rounded < min) return roundTo(min, bounds.precision)
  if (max !== undefined && Number.isFinite(max) && rounded > max) return roundTo(max, bounds.precision)
  return rounded
}

/**
 * 步进一次并夹取。
 *
 * 从上限往下减时先减到上限再减 step：值本来就在界外（使用方传了脏数据）时，
 * 用户点一下减号应该**立刻回到合法区间**，而不是在界外一格一格挪。
 */
export function stepNumber(value: number, direction: 1 | -1, bounds: NumberBounds = {}): number {
  const safe = clampNumber(value, bounds)
  const step = normalizeStep(bounds.step)
  const next = safe + direction * step
  return clampNumber(roundTo(next, bounds.precision), bounds)
}

/**
 * 解析用户输入。返回 `undefined` 表示"不提交，回退到当前值"。
 *
 * 认这些：`12`、` 12 `、`12px`（单位由调用方决定，这里只取数字）、`-3`、`+3`、`1.5`、`1,5`（欧洲键盘）。
 * 不认：空串、`-`、`12abc`、`1e3`（指数写法在字号/行距里没有意义，放进来只会让人误以为支持）。
 */
export function parseNumberDraft(text: string): number | undefined {
  // 只裁首尾空白，**不**吞掉内部空格：`"1 2"` 是两次误触，按 12 提交会让用户莫名其妙
  const trimmed = text.trim().replace(',', '.')
  if (trimmed.length === 0) return undefined
  const match = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:px|pt|%|em|rem|cm|mm|in)?$/i.exec(trimmed)
  if (match === null) return undefined
  const numeric = match[0].replace(/[a-z%]+$/i, '')
  const value = Number(numeric)
  return Number.isFinite(value) ? value : undefined
}
