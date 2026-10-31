//#region src/shell/gallery.ts
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
