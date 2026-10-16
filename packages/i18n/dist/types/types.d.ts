/**
 * `@jitoffice/i18n` 公开类型（04 §6）。
 *
 * 零依赖是硬约束：这里既不 import vue，也不 import `@jitoffice/shared`。
 * `OjMessageLike` 与 shared 的 `OjMessage` 结构相同，靠 TS 的结构类型天然互通，
 * 不需要为了一个类型引用把两个基础包绑成依赖环。
 */
import type { IntlKey, MessageValues } from './generated/keys.ts';
/** tokens 的语言档位。`zh` 是基底（en 与它同值，见 01 §7），不是"只有中文能用"。 */
export type OjTokenLang = 'zh' | 'zh-TW' | 'ja';
export type OjDirection = 'ltr' | 'rtl';
export type OjMessageValue = string | number;
export type OjMessageValues = Record<string, OjMessageValue>;
/** 与命令注册表的 `OjMessage` 同形：裸文案或 i18n 引用。 */
export interface OjMessageRef {
    key: string;
    params?: OjMessageValues;
}
export type OjMessageLike = string | OjMessageRef;
export interface OjLocaleFormats {
    /** 自研 pattern 渲染，不走 Intl 的 dateStyle：语言包要能精确控制「2026年10月9日」这类写法。 */
    date: string;
    time: string;
    dateTime: string;
    /** 0 = 周日。与 `Intl.Locale.weekInfo.firstDay` 同义，但基线内核缺这个 API，所以直接存值。 */
    weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6;
}
export interface OjMessages {
    oj: {
        common: {
            confirm: string;
            cancel: string;
            close: string;
            clear: string;
            more: string;
            loading: string;
            empty: string;
            yes: string;
            no: string;
            inputPlaceholder: string;
            selectPlaceholder: string;
        };
        tableGridPicker: {
            label: string;
            size: string;
            insertDialog: string;
            exceedMax: string;
            rows: string;
            cols: string;
        };
        ribbon: {
            collapse: string;
            expand: string;
            moreCommands: string;
            keyTipsHint: string;
            showAll: string;
        };
        colorPicker: {
            themeColors: string;
            standardColors: string;
            recent: string;
            custom: string;
            noColor: string;
            auto: string;
            moreColors: string;
            eyedropper: string;
        };
        fontPicker: {
            recent: string;
            all: string;
            chinese: string;
            latin: string;
            notInstalled: string;
            preview: string;
        };
        validation: {
            required: string;
            numberOnly: string;
            range: string;
            maxLength: string;
            invalidColor: string;
        };
        command: {
            bold: string;
            horizontalRule: string;
            insertTable: string;
        };
    };
}
/**
 * 一语言一对象（04 §6.1）：文案、日期格式、字体档位同源切换，切语言是一次赋值而不是三处联动。
 * 包内**不得有副作用**（不注册 dayjs、不改 document），副作用属于 Vue 层的 `OjLocaleProvider`。
 */
export interface OjLocale {
    /** 写进 `document.documentElement.lang` 的值，同时是 tokens 语言覆写层要匹配的值。 */
    name: string;
    /** 喂给 `Intl.*` 的 BCP-47 标签。与 name 分开是因为 name 可能只到语系（`ja`）。 */
    intl: string;
    /** 语言切换器显示名，用该语言自身的写法。 */
    label: string;
    /**
     * tokens 的语言档位（04 §6.1 里叫 `fontStack`）。改名原因：这一档决定的不只是字体栈，
     * 还有基准字号、行高、字距、`line-break`——canvas 消费方要靠 `createTokens({ lang })`
     * 拿到**同一层**，叫 fontStack 会让人以为它只管 family。
     */
    tokenLang: OjTokenLang;
    direction: OjDirection;
    formats: OjLocaleFormats;
    messages: OjMessages;
}
export interface OjNumberFormat {
    decimal(value: number, fractionDigits?: number): string;
    integer(value: number): string;
    percent(value: number, fractionDigits?: number): string;
    currency(value: number, code: string): string;
}
export interface OjDateFormat {
    date(value: Date | number): string;
    time(value: Date | number): string;
    dateTime(value: Date | number): string;
    /** 按显式 pattern 渲染，供表格单元格这类"格式来自列定义"的场景使用。 */
    pattern(pattern: string, value: Date | number): string;
    /**
     * 星期名。日历表头用 `short`（日 `月`、英 `Mon`），详情用 `long`（日 `月曜日`、英 `Monday`）。
     * 刻意不做成 pattern token：day.js 里 `W/WW` 是周序号、`dd/ddd/dddd` 才是星期，
     * 任一种映射都会让熟悉 day.js 的人读错我们的格式串。
     */
    weekday(value: Date | number, kind?: 'narrow' | 'short' | 'long'): string;
    readonly weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6;
}
export interface OjI18nOptions {
    /** 初始语言。传字符串时必须在 `locales` 里能找到，找不到直接抛。 */
    locale: OjLocale | string;
    locales?: readonly OjLocale[];
    /** 打开后缺 key、缺值会额外告警；生产模式仍返回可辨识的原文，但不写 console。 */
    dev?: boolean;
}
export interface OjI18n {
    readonly locale: OjLocale;
    /** 当前 `html[lang]` 值，等价于 `locale.name`。 */
    readonly lang: string;
    /** 运行期补挂语言包（懒加载语言用）。返回注销函数。 */
    register(locale: OjLocale): () => void;
    has(name: string): boolean;
    /** 切换语言。未知 name 抛错——静默回退英文会产出中英混排界面，比缺翻译更糟。 */
    use(next: OjLocale | string): void;
    /** 已注册语言，按 `name` 字典序，供语言切换器渲染。 */
    list(): OjLocale[];
    t<K extends IntlKey>(key: K, values?: MessageValues<K>): string;
    /** 任意 key 的取值：业务文案与内置文案共用一条路径，未命中时原样返回 key。 */
    translate(key: string, values?: OjMessageValues): string;
    /** 命令注册表的 `resolve` 适配器。 */
    resolve(message: OjMessageLike): string;
    readonly number: OjNumberFormat;
    readonly date: OjDateFormat;
    subscribe(listener: (locale: OjLocale) => void): () => void;
    dispose(): void;
}
