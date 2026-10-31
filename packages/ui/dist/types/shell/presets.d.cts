/**
 * 档位表与"最近档位"（03 §3 `OjFontSizeField` / `OjLineSpacingPicker`）。
 *
 * 字号档位**必须与 token 一致**：`--oj-fs-12`~`--oj-fs-32` 那八档就是设计给的可用值，
 * 组件里再自造一套（比如加上 15px）会让"用户选的 15px"在 `ja` 档位下没有对应 token，
 * 于是又变成一次写死。这里把档位写成常量，并由用例与 token 表对账。
 *
 * 行距用**倍数**而不是 px：Word/WPS 的行距单位是"多倍行距"，存 px 会随字号变化而失真。
 */
/** 与 `packages/tokens` 的 `fs.*` 一一对应（顺序即下拉里的顺序）。 */
export declare const FONT_SIZE_PRESETS: readonly number[];
/** Word 的常用档位：单倍、1.15、1.5、双倍。 */
export declare const LINE_SPACING_PRESETS: readonly number[];
/** 字号上下限：低于 1px 或高于 999px 的输入是误操作，不是需求。 */
export declare const FONT_SIZE_RANGE: {
    readonly min: 1;
    readonly max: 999;
};
/** 行距上下限：0 会让行叠在一起，10 倍以上没有排版意义。 */
export declare const LINE_SPACING_RANGE: {
    readonly min: 0.5;
    readonly max: 10;
};
/** 离 `value` 最近的档位。空表返回 `value` 本身（调用方没给档位就不该被改值）。 */
export declare function nearestPreset(presets: readonly number[], value: number): number;
/**
 * 在档位表里前进/后退一档。
 *
 * 当前值不在表里时（用户手输过 17px），先落到**最近的档位**再走一步：
 * 直接 `indexOf` 得到 -1 会让"下箭头"跳到第一档，用户会觉得方向反了。
 */
export declare function stepPreset(presets: readonly number[], value: number, direction: 1 | -1): number;
/** 行距显示成 `1.5` / `1` / `1.15`：去掉无意义的尾零，但不把 1.50 显示成 1.5 以外的东西。 */
export declare function formatLineSpacing(value: number): string;
/** 字号显示成 `14`（单位由使用方在其后补，语言不同单位写法也不同）。 */
export declare function formatFontSize(value: number): string;
