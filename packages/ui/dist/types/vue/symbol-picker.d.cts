import type { PropType } from 'vue';
import type { SymbolGroup } from '../shell/symbols.cjs';
/**
 * `OjSymbolPicker`（03 §3 / M2）：插入 Unicode 符号。
 *
 * 与其它 picker 的区别：它**没有 modelValue**。选符号是"插入动作"（`select`），
 * 不是"选一个持久状态"——把插入做成受控值，会让连续插两个符号时第二个把第一个覆盖掉。
 *
 * 分组标题由使用方给（`groupLabels`）：组件库里写死中文标题，日文界面就永远翻不掉。
 */
export declare const OjSymbolPicker: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    groups: {
        type: PropType<readonly SymbolGroup[]>;
        default: () => readonly SymbolGroup[];
    };
    label: {
        type: StringConstructor;
        required: true;
    };
    /** 搜索框占位文案（语言相关）。 */
    placeholder: {
        type: StringConstructor;
        default: string;
    };
    /** 分组 id → 显示名；缺省不渲染标题。 */
    groupLabels: {
        type: PropType<Readonly<Record<string, string>>>;
        default: () => {};
    };
    /** 网格列数，键盘左右移动按它算。 */
    columns: {
        type: NumberConstructor;
        default: number;
    };
}>, () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, "select"[], "select", import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    groups: {
        type: PropType<readonly SymbolGroup[]>;
        default: () => readonly SymbolGroup[];
    };
    label: {
        type: StringConstructor;
        required: true;
    };
    /** 搜索框占位文案（语言相关）。 */
    placeholder: {
        type: StringConstructor;
        default: string;
    };
    /** 分组 id → 显示名；缺省不渲染标题。 */
    groupLabels: {
        type: PropType<Readonly<Record<string, string>>>;
        default: () => {};
    };
    /** 网格列数，键盘左右移动按它算。 */
    columns: {
        type: NumberConstructor;
        default: number;
    };
}>> & Readonly<{
    onSelect?: (...args: any[]) => any;
}>, {
    groups: readonly SymbolGroup[];
    placeholder: string;
    groupLabels: Readonly<Record<string, string>>;
    columns: number;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
