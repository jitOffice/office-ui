/**
 * 边框模型（03 §3 / M2 `OjBorderPicker`）。
 *
 * 三个维度（线型 / 线宽 / 颜色）必须一起归一，否则会出现"选了无边框，但颜色还高亮着"的界面：
 * `none` 时宽度与颜色在语义上不存在，归一化后要显式表达这一点（`width: 0`）。
 *
 * 线宽是 **px 数值**而不是枚举字符串：文档格式存的是数值，组件只是提供几个常用档位。
 */
export type BorderStyle = 'none' | 'solid' | 'dashed' | 'dotted' | 'double';
export interface BorderValue {
    readonly style: BorderStyle;
    readonly width: number;
    readonly color: string;
}
export declare const BORDER_STYLES: readonly BorderStyle[];
/** Word 的常用线宽档（pt 换算后的近似值），含 0.5 这种细线。 */
export declare const BORDER_WIDTHS: readonly number[];
export declare const BORDER_COLORS: readonly string[];
export declare const DEFAULT_BORDER: BorderValue;
export declare const BORDER_WIDTH_RANGE: {
    readonly min: 0;
    readonly max: 12;
};
/**
 * 归一化三个维度。
 *
 * 规则：
 *   - `style: 'none'` 时宽度归 0（语义上"没有线"，留着 1px 会让下游导出工具画出细线）；
 *   - 宽度夹进 `[0, 12]` 并保留两位小数（0.75 这类值是合法档位）；
 *   - 颜色不合法就回退默认色，而不是保留一个渲染不出来的字符串。
 */
export declare function normalizeBorder(value: Partial<BorderValue> | undefined): BorderValue;
/**
 * 生成 CSS 值，供预览块与"应用到选区"两条路共用（两套字符串迟早会不一致）。
 * 入参收 `Partial`：预览时经常只想换一个维度（`{ ...current, style: 'none' }`），
 * 内部统一走 `normalizeBorder`，调用方不必先自己补齐三个字段。
 */
export declare function borderCss(value: Partial<BorderValue> | undefined): string;
/** 线宽档位文案：`1` 而不是 `1.00`。 */
export declare function formatBorderWidth(width: number): string;
