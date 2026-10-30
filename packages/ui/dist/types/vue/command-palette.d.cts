import type { PropType } from 'vue';
import type { OjPaletteItem } from '../palette.cjs';
/**
 * `OjCommandPalette`（03 §3 B 组）：`Ctrl+/` 或 `Ctrl+P` 唤起的命令搜索。
 *
 * 搜索排序在 `palette.ts`（零依赖、有单测），这里只管浮层与键盘：
 *   - `role="dialog"` + 焦点陷阱 + 关闭归还焦点，全部复用 `OjPortal`；
 *   - 输入框是 `combobox`，高亮项通过 `aria-activedescendant` 报给读屏；
 *   - **IME 合成期间不抢 `Enter`**（03 §5 第 7 条）：中日文用户正在选词时回车，
 *     意图是"确认这个词"，不是"执行第一条命令"。
 */
export declare const OjCommandPalette: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    open: {
        type: BooleanConstructor;
        required: true;
    };
    items: {
        type: PropType<readonly OjPaletteItem[]>;
        required: true;
    };
    /** 受控查询词；不给则组件自己记（仍会发 `update:query`） */
    query: {
        type: PropType<string | undefined>;
        default: undefined;
    };
    label: {
        type: StringConstructor;
        default: string;
    };
    placeholder: {
        type: StringConstructor;
        default: string;
    };
    emptyLabel: {
        type: StringConstructor;
        default: string;
    };
}>, () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}> | null, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, ("select" | "update:open" | "update:query")[], "select" | "update:open" | "update:query", import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    open: {
        type: BooleanConstructor;
        required: true;
    };
    items: {
        type: PropType<readonly OjPaletteItem[]>;
        required: true;
    };
    /** 受控查询词；不给则组件自己记（仍会发 `update:query`） */
    query: {
        type: PropType<string | undefined>;
        default: undefined;
    };
    label: {
        type: StringConstructor;
        default: string;
    };
    placeholder: {
        type: StringConstructor;
        default: string;
    };
    emptyLabel: {
        type: StringConstructor;
        default: string;
    };
}>> & Readonly<{
    onSelect?: (...args: any[]) => any;
    "onUpdate:open"?: (...args: any[]) => any;
    "onUpdate:query"?: (...args: any[]) => any;
}>, {
    query: string | undefined;
    label: string;
    placeholder: string;
    emptyLabel: string;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
