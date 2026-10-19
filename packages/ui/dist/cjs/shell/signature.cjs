//#region src/shell/signature.ts
function startStroke(strokes, point) {
	return [...strokes, { points: [point] }];
}
function extendStroke(strokes, point) {
	const last = strokes[strokes.length - 1];
	if (!last) return startStroke(strokes, point);
	return [...strokes.slice(0, -1), { points: [...last.points, point] }];
}
function strokePath(stroke) {
	const first = stroke.points[0];
	if (!first) return "";
	const rest = stroke.points.slice(1).map((point) => `L ${point.x} ${point.y}`);
	return [`M ${first.x} ${first.y}`, ...rest].join(" ");
}
//#endregion
exports.extendStroke = extendStroke;
exports.startStroke = startStroke;
exports.strokePath = strokePath;
