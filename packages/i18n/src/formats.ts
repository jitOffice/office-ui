/**
 * 数字与日期格式化：全部委托 `Intl`，不引 dayjs / date-fns（ADR-0004）。
 *
 * 日期走自研 pattern 渲染而不是 `Intl.DateTimeFormat` 的 `dateStyle`，原因是语言包里存的是
 * **格式串**（`'YYYY年M月D日'`、`'H時m分'`，抄 Arco 的判断：格式属于语言不属于组件），
 * 而 `dateStyle` 只给得出 full/long/medium/short 四档，钉不出「10月9日」不带"年"、
 * 也钉不出「2026年10月9日 14時5分」的空格与汉字混排。
 */

import { cachedNumberFormat, part } from './intl.ts'
import type { OjDateFormat, OjLocale, OjNumberFormat } from './types.ts'

/**
 * 交替顺序即最长匹配优先：`MMMM` 必须排在 `MM` 前，`hh` 必须排在 `h` 前。
 * 锚点必须写成 `^(?:…)`：`^A|B` 里的 `^` 只管得到 `A`，`B` 会在串内任意位置命中，
 * 于是它前面的字面量被整段跳过（`2026年M月D日` 会渲染成 `2026101099日`）。
 *
 * 方言是 day.js 的子集（`YYYY MM DD HH mm ss A`），不实现周序号（day.js 的 `W`）、
 * era（`N`）与时间戳（`X`）。星期名走 `weekday()` 方法而不是 pattern token：
 * day.js 用 `dd/ddd/dddd` 表示星期、用 `W/WW` 表示周序号，硬塞一个 `W` 进格式串
 * 会让每个熟悉 day.js 的贡献者都读错它。
 */
const TOKENS = 'YYYY|YY|MMMM|MMM|MM|M|DD|D|HH|H|hh|h|mm|m|ss|s|A|a'
const TOKEN_AT = new RegExp(`^(?:${TOKENS})`)

function pad2(value: number): string {
  return value < 10 ? `0${value}` : String(value)
}

function formatPattern(getLocale: () => OjLocale, pattern: string, date: Date): string {
  const { intl } = getLocale()
  let out = ''
  let i = 0
  while (i < pattern.length) {
    const ch = pattern[i] as string

    if (ch === "'") {
      // `''` 是字面单引号；`'…'` 之间的一切原样输出，供 `D 'de' MMMM` 这类写法使用。
      if (pattern[i + 1] === "'") {
        out += "'"
        i += 2
        continue
      }
      const end = pattern.indexOf("'", i + 1)
      if (end === -1) throw new Error(`日期格式串引号未闭合：${pattern}`)
      out += pattern.slice(i + 1, end)
      i = end + 1
      continue
    }

    const matched = pattern.slice(i).match(TOKEN_AT)
    const token = matched?.[0]
    if (!token) {
      out += ch
      i += 1
      continue
    }
    out += tokenValue(token, date, intl)
    i += token.length
  }
  return out
}

function tokenValue(token: string, date: Date, intl: string): string {
  const hours = date.getHours()
  const minutes = date.getMinutes()
  switch (token) {
    case 'YYYY':
      return String(date.getFullYear())
    case 'YY':
      return pad2(date.getFullYear() % 100)
    case 'MMMM':
      return part(intl, { month: 'long' }, date, 'month')
    case 'MMM':
      return part(intl, { month: 'short' }, date, 'month')
    case 'MM':
      return pad2(date.getMonth() + 1)
    case 'M':
      return String(date.getMonth() + 1)
    case 'DD':
      return pad2(date.getDate())
    case 'D':
      return String(date.getDate())
    case 'HH':
      return pad2(hours)
    case 'H':
      return String(hours)
    case 'hh':
      return pad2(hours % 12 || 12)
    case 'h':
      return String(hours % 12 || 12)
    case 'mm':
      return pad2(minutes)
    case 'm':
      return String(minutes)
    case 'ss':
      return pad2(date.getSeconds())
    case 's':
      return String(date.getSeconds())
    case 'A':
      return part(intl, { hour: 'numeric', hour12: true }, date, 'dayPeriod').toUpperCase()
    case 'a':
      return part(intl, { hour: 'numeric', hour12: true }, date, 'dayPeriod').toLowerCase()
    default:
      throw new Error(`未实现的日期格式 token：${token}`)
  }
}

/** 数字格式化器读取的是**当前**语言，所以切语言后无需重建，也不会出现"文案日文、数字中国分组"。 */
export function createNumberFormat(getLocale: () => OjLocale): OjNumberFormat {
  const fixed = (value: number, digits: number | undefined, extra: Intl.NumberFormatOptions): string => {
    const options: Intl.NumberFormatOptions = { ...extra }
    if (digits !== undefined) {
      options.minimumFractionDigits = digits
      options.maximumFractionDigits = digits
    }
    return cachedNumberFormat(getLocale().intl, options).format(value)
  }

  return {
    decimal: (value, digits) => fixed(value, digits, {}),
    integer: (value) => fixed(value, 0, {}),
    percent: (value, digits = 0) => fixed(value, digits, { style: 'percent' }),
    currency: (value, code) => fixed(value, undefined, { style: 'currency', currency: code }),
  }
}

export function createDateFormat(getLocale: () => OjLocale): OjDateFormat {
  const toTime = (value: Date | number): Date => (value instanceof Date ? value : new Date(value))
  return {
    date: (value) => formatPattern(getLocale, getLocale().formats.date, toTime(value)),
    time: (value) => formatPattern(getLocale, getLocale().formats.time, toTime(value)),
    dateTime: (value) => formatPattern(getLocale, getLocale().formats.dateTime, toTime(value)),
    pattern: (pattern, value) => formatPattern(getLocale, pattern, toTime(value)),
    // 星期名交给 Intl：各语言的缩写形态（`Fri` / `金` / `周五`）由 CLDR 决定，自己列表会漂。
    weekday: (value, kind = 'short') => part(getLocale().intl, { weekday: kind }, toTime(value), 'weekday'),
    // 用 getter 而不是快照：`weekStartsOn` 必须是切换后的值，否则日历表头会停在旧语言的起始日。
    get weekStartsOn() {
      return getLocale().formats.weekStartsOn
    },
  }
}
