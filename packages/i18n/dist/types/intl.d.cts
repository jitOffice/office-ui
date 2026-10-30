/**
 * `Intl` 实例缓存。
 *
 * `Intl.*Format` 的构造成本远高于调用成本（内部要解析标签并装载数据表），
 * 而单元格渲染是"每屏上千次同参数格式化"，不缓存就是 60fps 场景里的主要开销来源。
 * 缓存键必须含完整选项，否则 `{maximumFractionDigits: 2}` 会污染 `{style:'percent'}`。
 */
export declare function cachedNumberFormat(locale: string, options: Intl.NumberFormatOptions): Intl.NumberFormat;
/**
 * 基线内核（信创环境的旧 Firefox ESR / 旧 Chromium）不保证有 `Intl.PluralRules`，
 * 缺失时退化为"1 单数、其余复数"——中英日三语在这个退化下结果都正确。
 */
export declare function pluralCategory(locale: string, value: number): string;
export declare function cachedPartFormat(locale: string, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat;
/** 取 `formatToParts` 里的单个字段，拿不到时返回 undefined 而不是抛。 */
export declare function part(locale: string, options: Intl.DateTimeFormatOptions, date: Date, type: string): string;
