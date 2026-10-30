import type { PropType } from 'vue';
import type { OjLocaleLike } from './locale.ts';
/**
 * `OjLocaleSwitcher`（04 §6.1、03 §6 M1「语言切换器」）。
 *
 * 用原生 `<select>` 而不是自绘下拉：它自带 IME、读屏的角色语义、移动端的原生选择器，
 * 自绘在这里换不到任何东西。样式只负责把它压到状态栏 / 工具条那一行的高度与配色。
 *
 * 受控与非受控的区别只在"谁去改运行时"：
 *   - 没给 `modelValue`：组件自己 `useLocale().use(name)`，一个字都不用配就能切语言；
 *   - 给了 `modelValue`：只发事件，由宿主决定何时 `i18n.use()`——宿主可能在切换前先存一次偏好设置。
 * 两种都发 `update:modelValue` 与 `change`（`change` 只由用户操作触发，03 §2）。
 */
export declare const OjLocaleSwitcher: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    /** 显式语言表。不给就用 Provider 注册表里的（按 `name` 字典序，由运行时排好） */
    locales: {
        type: PropType<readonly OjLocaleLike[] | undefined>;
        default: undefined;
    };
    /** 受控值：当前语言 `name` */
    modelValue: {
        type: PropType<string | undefined>;
        default: undefined;
    };
    /** 可访问名。不给则取 `oj.common.language`（切语言后跟着变） */
    label: {
        type: PropType<string | undefined>;
        default: undefined;
    };
    disabled: {
        type: BooleanConstructor;
        default: boolean;
    };
}>, () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}> | null, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, ("change" | "update:modelValue")[], "change" | "update:modelValue", import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    /** 显式语言表。不给就用 Provider 注册表里的（按 `name` 字典序，由运行时排好） */
    locales: {
        type: PropType<readonly OjLocaleLike[] | undefined>;
        default: undefined;
    };
    /** 受控值：当前语言 `name` */
    modelValue: {
        type: PropType<string | undefined>;
        default: undefined;
    };
    /** 可访问名。不给则取 `oj.common.language`（切语言后跟着变） */
    label: {
        type: PropType<string | undefined>;
        default: undefined;
    };
    disabled: {
        type: BooleanConstructor;
        default: boolean;
    };
}>> & Readonly<{
    onChange?: (...args: any[]) => any;
    "onUpdate:modelValue"?: (...args: any[]) => any;
}>, {
    locales: readonly OjLocaleLike[] | undefined;
    modelValue: string | undefined;
    label: string | undefined;
    disabled: boolean;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
