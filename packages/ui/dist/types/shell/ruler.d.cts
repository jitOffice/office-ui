/** 标尺刻度。1cm 按 96dpi 换算，再乘当前缩放。 */
export interface RulerTick {
    offset: number;
    label: string;
}
export declare function rulerTicks(lengthPx: number, zoomPercent: number): RulerTick[];
/** A4 短边在 96dpi 下的像素宽度，供纸张容器使用。 */
export declare const A4_WIDTH_PX = 794;
export declare function pageWidth(zoomPercent: number): number;
