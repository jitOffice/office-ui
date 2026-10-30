import type { OjLocale } from '../types.cjs';
/**
 * 英语。`tokenLang` 是 `'zh'` 而不是新增一档：tokens 的基底栈（Inter → system-ui → 中文栈）
 * 对纯拉丁文本本就命中前两个族，字号/行高/字距也与基底一致，所以 `en` 不是 token 维度（01 §7）。
 * 这一档真正代表的不是"中文"，而是"没有覆写"。
 */
declare const enUS: OjLocale;
export = enUS;
