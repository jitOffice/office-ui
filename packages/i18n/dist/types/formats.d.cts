/**
 * 数字与日期格式化：全部委托 `Intl`，不引 dayjs / date-fns（ADR-0004）。
 *
 * 日期走自研 pattern 渲染而不是 `Intl.DateTimeFormat` 的 `dateStyle`，原因是语言包里存的是
 * **格式串**（`'YYYY年M月D日'`、`'H時m分'`，抄 Arco 的判断：格式属于语言不属于组件），
 * 而 `dateStyle` 只给得出 full/long/medium/short 四档，钉不出「10月9日」不带"年"、
 * 也钉不出「2026年10月9日 14時5分」的空格与汉字混排。
 */
import type { OjDateFormat, OjLocale, OjNumberFormat } from './types.cjs';
/** 数字格式化器读取的是**当前**语言，所以切语言后无需重建，也不会出现"文案日文、数字中国分组"。 */
export declare function createNumberFormat(getLocale: () => OjLocale): OjNumberFormat;
export declare function createDateFormat(getLocale: () => OjLocale): OjDateFormat;
