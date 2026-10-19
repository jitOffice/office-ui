/** 画布缩放。步进 10，夹在 50% 与 200% 之间。 */
export declare const ZOOM_MIN = 50;
export declare const ZOOM_MAX = 200;
export declare const ZOOM_STEP = 10;
export declare function clampZoom(value: number): number;
export declare function stepZoom(value: number, direction: 1 | -1): number;
