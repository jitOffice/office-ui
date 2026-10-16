//#region src/tooltip.ts
function defaultSchedule(fn, ms) {
	const id = setTimeout(fn, ms);
	return () => clearTimeout(id);
}
function createTooltipMachine(options = {}) {
	const delay = options.delay ?? 400;
	const schedule = options.schedule ?? defaultSchedule;
	let open = false;
	let pending = null;
	function setOpen(next) {
		if (open === next) return;
		open = next;
		options.onChange?.(open);
	}
	function cancel() {
		pending?.();
		pending = null;
	}
	return {
		get open() {
			return open;
		},
		enter() {
			if (open || pending) return;
			pending = schedule(() => {
				pending = null;
				setOpen(true);
			}, delay);
		},
		leave() {
			cancel();
			setOpen(false);
		},
		show() {
			cancel();
			setOpen(true);
		},
		hide() {
			cancel();
			setOpen(false);
		},
		dispose() {
			cancel();
		}
	};
}
//#endregion
exports.createTooltipMachine = createTooltipMachine;
