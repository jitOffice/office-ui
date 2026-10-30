/**
 * i18n 运行时：语言表 + 当前语言 + 取值（04 §6.3）。
 *
 * 框架无关：只暴露 `subscribe`，Vue 层的 `OjLocaleProvider` / `useLocale` 建在它上面，
 * jQuery 与 Node 直接用（ADR-0005）。这里**不碰 document**——写 `html[lang]` 是 Provider 的副作用，
 * 否则同一个包在 SSR 里就炸了。
 */
import type { OjI18n, OjI18nOptions } from './types.cjs';
export declare function createI18n(options: OjI18nOptions): OjI18n;
