import type { ComputedRef, PropType, VNodeChild } from 'vue';
/**
 * `OjLocaleProvider` / `useLocale`（04 §6.1，03 §6 M1）。
 *
 * **为什么不 `import '@jitoffice/i18n'`**：`ui` 的 `dependencies` 必须为空（契约 1 / ADR-0004），
 * 而 i18n 是宿主可选引入的运行时。这里收**结构类型**，真实的 `createI18n()` 返回值天然满足
 * `OjLocaleRuntime`，不需要为了一个类型引用把两个包绑成依赖环。与 `OjEditorHost` 收注册表、
 * `OjCommandButton` 收 source 是同一个手法（ADR-0005）。
 *
 * **为什么切语言要写 `document.documentElement.lang`**：它不只是给读屏看的——tokens 的语言覆写层
 * 选择器就是 `html[lang|="ja"]`（01 §7、`packages/tokens/dist/index.css`）。少写这一步，
 * 文案换了而字体栈、基准字号、行高、`line-break` 全留在旧语言上，是最难被发现的那类"切了一半"。
 *
 * **为什么卸载要归还**：文档站的 demo 与 iframe 会把本库挂在**宿主自己的页面**里。
 * 一个组件卸载后仍把全局 `lang` 停在 `ja`，宿主整页排版都会跟着变。归还只在"当前值仍是我们写的"
 * 时发生——宿主中途自己改过，就不该被我们覆盖回去。
 */
/** 语言包的最小结构：真实的 `OjLocale` 字段更多，但这里只需要这几项。 */
export interface OjLocaleLike {
    /** 写进 `html[lang]` 的值，同时是 tokens 语言覆写层匹配的值。 */
    name: string;
    /** BCP-47，喂给 `Intl.*` */
    intl?: string | undefined;
    /** 切换器里显示的名字，用该语言自身的写法（`日本語` 而不是 `Japanese`） */
    label?: string | undefined;
    tokenLang?: string | undefined;
    direction?: 'ltr' | 'rtl' | undefined;
}
/** i18n 运行时里本层用到的那部分。`OjI18n` 结构上满足它。 */
export interface OjLocaleRuntime {
    readonly locale: OjLocaleLike;
    readonly lang: string;
    use(next: OjLocaleLike | string): void;
    list(): OjLocaleLike[];
    translate(key: string, values?: Record<string, string | number>): string;
    subscribe(listener: (locale: OjLocaleLike) => void): () => void;
}
export interface OjLocaleContext {
    /** 有没有 `OjLocaleProvider`。没有时 `t()` 退回 fallback，而不是抛错——UMD 用户可能压根不用 i18n */
    readonly provided: boolean;
    readonly locale: ComputedRef<OjLocaleLike | undefined>;
    readonly lang: ComputedRef<string>;
    /**
     * 取文案。`fallback` 是**组件自带的默认文案**：没有 Provider、或语言包里没有这条 key 时用它，
     * 这样"零配置直接 `<OjRibbon>`"仍然能显示中文，而不是满屏 key。
     */
    t(key: string, fallback?: string, values?: Record<string, string | number>): string;
    use(next: OjLocaleLike | string): void;
    list(): OjLocaleLike[];
}
/**
 * 取当前语言上下文。必须在 `setup()` 里调用。
 *
 * 返回值是**快照 + 订阅**的结果：语言切换时 `lang` / `locale` 这两个 computed 会变，
 * 于是用到它们的渲染函数自然重渲染。刻意不用 `reactive(runtime)` 包一层——
 * 那会把一个框架无关的外部对象整体代理掉（身份变了、内部 Map/闭包也不可代理）。
 */
export declare function useLocale(): OjLocaleContext;
export declare const OjLocaleProvider: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    i18n: {
        type: PropType<OjLocaleRuntime>;
        required: true;
    };
    /**
     * 是否同步 `html[lang]` / `html[dir]`。默认同步；给 `false` 是给"一个页面里嵌两个语言区"的场景
     * （此时语言只影响组件文案，页面的 `lang` 由宿主自己决定）。
     */
    syncDocument: {
        type: BooleanConstructor;
        default: boolean;
    };
}>, () => VNodeChild, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    i18n: {
        type: PropType<OjLocaleRuntime>;
        required: true;
    };
    /**
     * 是否同步 `html[lang]` / `html[dir]`。默认同步；给 `false` 是给"一个页面里嵌两个语言区"的场景
     * （此时语言只影响组件文案，页面的 `lang` 由宿主自己决定）。
     */
    syncDocument: {
        type: BooleanConstructor;
        default: boolean;
    };
}>> & Readonly<{}>, {
    syncDocument: boolean;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
