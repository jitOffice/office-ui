//#region src/popper.ts
function placePopper(options) {
	const gap = options.gap ?? 4;
	const padding = options.padding ?? 8;
	const { anchor, popup, viewport } = options;
	const preferred = options.placement ?? "bottom-start";
	let placement = preferred;
	let y = preferred === "bottom-start" ? anchor.y + anchor.height + gap : anchor.y - gap - popup.height;
	const bottom = anchor.y + anchor.height + gap;
	const top = anchor.y - gap - popup.height;
	const bottomOverflows = bottom + popup.height > viewport.height - padding;
	const topOverflows = top < padding;
	if (preferred === "bottom-start" && bottomOverflows && !topOverflows) {
		placement = "top-start";
		y = top;
	} else if (preferred === "top-start" && topOverflows && !bottomOverflows) {
		placement = "bottom-start";
		y = bottom;
	}
	const maxX = Math.max(padding, viewport.width - padding - popup.width);
	const maxY = Math.max(padding, viewport.height - padding - popup.height);
	const x = Math.min(Math.max(anchor.x, padding), maxX);
	y = Math.min(Math.max(y, padding), maxY);
	return {
		x,
		y,
		placement
	};
}
//#endregion
exports.placePopper = placePopper;
