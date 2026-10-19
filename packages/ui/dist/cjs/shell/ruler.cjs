//#region src/shell/ruler.ts
/** 标尺刻度。1cm 按 96dpi 换算，再乘当前缩放。 */
var PX_PER_CM = 96 / 2.54;
function rulerTicks(lengthPx, zoomPercent) {
	if (lengthPx <= 0 || zoomPercent <= 0) return [];
	const step = PX_PER_CM * (zoomPercent / 100);
	const ticks = [];
	const count = Math.floor(lengthPx / step);
	for (let index = 0; index <= count; index += 1) ticks.push({
		offset: Math.round(index * step),
		label: String(index)
	});
	return ticks;
}
/** A4 短边在 96dpi 下的像素宽度，供纸张容器使用。 */
var A4_WIDTH_PX = 794;
function pageWidth(zoomPercent) {
	return Math.round(794 * (zoomPercent / 100));
}
//#endregion
exports.A4_WIDTH_PX = A4_WIDTH_PX;
exports.pageWidth = pageWidth;
exports.rulerTicks = rulerTicks;
