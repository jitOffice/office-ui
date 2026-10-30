/**
 * 网格陈列的方向键模型（03 §3 B 组 `OjRibbonGallery`）。
 *
 * 单独抽出来是因为"上下左右在网格里怎么走"是最容易写歪的一段：写成按 `columns`
 * 硬算行列，碰到最后一行不满就会算出不存在的下标；写成纯 `+1/-1`，上下键又变成
 * 左右键的别名。这里统一按**下标**算，并且永远夹在 `[0, count-1]` 里。
 */
/** 返回移动后的下标。`columns` 非法（0、负数、NaN）时按 1 列处理，不抛异常。 */
export declare function galleryNeighbor(columns: number, count: number, index: number, key: string): number;
