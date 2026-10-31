/**
 * 符号表（03 §3 / M2 `OjSymbolPicker`）。
 *
 * **只收 Unicode 文本**，不引自绘图形/表情包：00 §4 红线 2/3 —— 表情与旗帜类资产
 * （openmoji 的 CC-BY-SA、twemoji 的 CC-BY 资产）与 Apache-2.0 结合作品时的授权链是断的，
 * 而"符号"用字体渲染完全够用。这也是 `OjSymbolPicker` 与"图标选择器"的区别：
 * 前者插入字符，后者插入组件。
 *
 * `name` 是 a11y 名字（英文、给读屏），显示名与分组标题都由使用方通过 props 提供——
 * 组件库里写死中文标题，日文界面上就永远翻不掉。
 */
export interface SymbolItem {
    readonly char: string;
    /** 给读屏念的名字（英文）；不参与显示。 */
    readonly name: string;
}
export interface SymbolGroup {
    readonly id: string;
    readonly symbols: readonly SymbolItem[];
}
export declare const SYMBOL_GROUPS: readonly SymbolGroup[];
/**
 * 按名字过滤。空查询返回原表（保持分组结构，调用方据此渲染标题）。
 * 同时接受直接输入字符：用户已经知道要插哪个符号时，比记名字快。
 */
export declare function filterSymbols(groups: readonly SymbolGroup[], query: string): SymbolGroup[];
/** 摊平成一维（键盘导航按下标走，分组只是视觉）。 */
export declare function flattenSymbols(groups: readonly SymbolGroup[]): SymbolItem[];
