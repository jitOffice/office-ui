//#region src/shell/gallery.ts
/**
* 网格陈列的方向键模型（03 §3 B 组 `OjRibbonGallery`）。
*
* 单独抽出来是因为"上下左右在网格里怎么走"是最容易写歪的一段：写成按 `columns`
* 硬算行列，碰到最后一行不满就会算出不存在的下标；写成纯 `+1/-1`，上下键又变成
* 左右键的别名。这里统一按**下标**算，并且永远夹在 `[0, count-1]` 里。
*/
/** 返回移动后的下标。`columns` 非法（0、负数、NaN）时按 1 列处理，不抛异常。 */
function galleryNeighbor(columns, count, index, key) {
	if (count <= 0) return 0;
	const cols = Number.isFinite(columns) && columns >= 1 ? Math.floor(columns) : 1;
	const current = Math.min(Math.max(Number.isFinite(index) ? Math.floor(index) : 0, 0), count - 1);
	if (key === "ArrowRight") return Math.min(current + 1, count - 1);
	if (key === "ArrowLeft") return Math.max(current - 1, 0);
	if (key === "ArrowDown") return Math.min(current + cols, count - 1);
	if (key === "ArrowUp") return Math.max(current - cols, 0);
	if (key === "Home") return 0;
	if (key === "End") return count - 1;
	return current;
}
//#endregion
export { galleryNeighbor };
