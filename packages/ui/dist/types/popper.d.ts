/** 浮层相对锚点矩形的定位。只做「下方优先、放不下翻到上方、水平方向夹进视口」。 */
export interface Box {
    x: number;
    y: number;
    width: number;
    height: number;
}
export type PopperPlacement = 'bottom-start' | 'top-start';
export interface PopperPosition {
    x: number;
    y: number;
    placement: PopperPlacement;
}
export interface PlacePopperOptions {
    anchor: Box;
    popup: Pick<Box, 'width' | 'height'>;
    viewport: Pick<Box, 'width' | 'height'>;
    placement?: PopperPlacement;
    gap?: number;
    padding?: number;
}
export declare function placePopper(options: PlacePopperOptions): PopperPosition;
