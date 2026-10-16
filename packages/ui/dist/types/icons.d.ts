/**
 * E1 的三枚自绘图标。只发 SVG 字符串，不发图标字体（prd/00 许可红线）。
 * 其余办公图标仍走后续的 `@jitoffice/icons` 构建管线，不在这一枚里凑数。
 */
export declare const icons: {
    readonly 'oj-format-bold': string;
    readonly 'oj-insert-table': string;
    readonly 'oj-horizontal-rule': string;
};
export type OjIconName = keyof typeof icons;
export declare function iconMarkup(name: string): string | undefined;
