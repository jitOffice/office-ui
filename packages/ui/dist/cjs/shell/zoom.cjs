//#region src/shell/zoom.ts
/** 画布缩放。步进 10，夹在 50% 与 200% 之间。 */
var ZOOM_MIN = 50;
var ZOOM_MAX = 200;
var ZOOM_STEP = 10;
function clampZoom(value) {
	if (!Number.isFinite(value)) return 100;
	return Math.min(200, Math.max(50, Math.round(value)));
}
function stepZoom(value, direction) {
	return clampZoom(clampZoom(value) + direction * 10);
}
//#endregion
exports.ZOOM_MAX = ZOOM_MAX;
exports.ZOOM_MIN = ZOOM_MIN;
exports.ZOOM_STEP = ZOOM_STEP;
exports.clampZoom = clampZoom;
exports.stepZoom = stepZoom;
