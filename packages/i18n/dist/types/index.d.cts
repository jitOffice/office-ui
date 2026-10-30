/**
 * `@jitoffice/i18n` 根入口：语言包形状、取值运行时、`Intl` 封装。
 *
 * 无框架依赖（ADR-0005）：`OjLocaleProvider` / `useLocale` 属于 `@jitoffice/ui` 的 Vue 层，
 * 这里只提供它们要挂上去的那个 `subscribe`。
 *
 * 语言包按需引入请用 `@jitoffice/i18n/locales/zh-CN` 子路径：
 * 从根入口一次性 import 四种语言，等于强迫只用中文的宿主也为日文与英文付体积。
 */
export { createI18n } from './store.cjs';
export { parseMessage, render, slotsOf } from './message.cjs';
export type { Choice, MessageNode, MessageSlot, PluralForm, RenderContext } from './message.cjs';
export type { OjDateFormat, OjDirection, OjI18n, OjI18nOptions, OjLocale, OjLocaleFormats, OjMessageLike, OjMessageRef, OjMessageValue, OjMessageValues, OjMessages, OjNumberFormat, OjTokenLang, } from './types.cjs';
export type { IntlKey, IntlValues, MessageValues } from './generated/keys.cjs';
