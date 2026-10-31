/**
 * 字体模型（03 §3 / M2 `OjFontPicker`）。
 *
 * 字体栈引用 token（`var(--oj-font-sans)`），而不是把 `"Inter Variable", ...` 抄一遍：
 * 字体栈是本项目里最长的一串值，抄一份到组件里就一定会和 token 漂开，
 * 而漂开的表现是"某些字重突然变合成加粗"。
 *
 * 四个选项分别对应 token 的四条栈：正文（sans）、等宽（mono）、等宽 CJK（mono-cjk）、
 * 文档正文（doc，衬线——Office 场景必须有）。
 */
export interface FontOption {
    readonly id: string;
    /** 列表里的显示名（不翻译：字体族名本身就是专有名词）。 */
    readonly label: string;
    /** CSS font-family 值，通常是 `var(--oj-font-*)`。 */
    readonly stack: string;
}
export declare const FONT_OPTIONS: readonly FontOption[];
/** 按 id 或显示名做子串过滤（忽略大小写与首尾空白）。空查询返回全部。 */
export declare function filterFonts(fonts: readonly FontOption[], query: string): FontOption[];
/** 从字体表里找一项；找不到返回 `undefined`（调用方据此决定要不要回退）。 */
export declare function findFont(fonts: readonly FontOption[], id: string): FontOption | undefined;
/** 键盘上下移动：到两端就停住，不环绕（环绕会让用户在列表底部误以为是顶部）。 */
export declare function stepFont(fonts: readonly FontOption[], id: string, direction: 1 | -1): string;
