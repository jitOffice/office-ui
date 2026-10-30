//#region src/trigger.ts
var defaultScheduler = {
	setTimeout: (task, ms) => globalThis.setTimeout(task, ms),
	clearTimeout: (handle) => globalThis.clearTimeout(handle)
};
function createTriggerMachine(options = {}) {
	const modes = new Set(options.modes ?? ["click"]);
	const openDelay = options.openDelay ?? 0;
	const closeDelay = options.closeDelay ?? 120;
	const scheduler = options.scheduler ?? defaultScheduler;
	let timer;
	let open = false;
	function cancel() {
		if (timer === void 0) return;
		scheduler.clearTimeout(timer);
		timer = void 0;
	}
	function apply(next, reason) {
		cancel();
		if (next === open) return;
		open = next;
		if (open) options.onOpen?.();
		else options.onClose?.(reason);
	}
	function later(ms, task) {
		cancel();
		if (ms <= 0) {
			task();
			return;
		}
		timer = scheduler.setTimeout(() => {
			timer = void 0;
			task();
		}, ms);
	}
	return {
		isOpen: () => open,
		/** 指针进入触发器（或触发器获得焦点时的 hover 语义） */
		enter() {
			if (modes.has("hover")) later(openDelay, () => apply(true, "leave"));
		},
		leave() {
			if (modes.has("hover")) later(closeDelay, () => apply(false, "leave"));
		},
		/**
		* 指针进入面板：只取消待关闭，不动 open。
		* 这是 closeDelay 存在的全部理由——从触发器到面板之间必然有一段空白。
		*/
		panelEnter() {
			cancel();
		},
		panelLeave() {
			if (modes.has("hover")) later(closeDelay, () => apply(false, "panel-leave"));
		},
		press() {
			if (modes.has("click")) apply(!open, "press");
		},
		focusIn() {
			if (modes.has("focus")) apply(true, "leave");
		},
		focusOut() {
			if (modes.has("focus")) later(closeDelay, () => apply(false, "blur"));
		},
		escape() {
			apply(false, "escape");
		},
		close(reason = "manual") {
			apply(false, reason);
		},
		/**
		* 跟上外部真值（`v-model:open`）。
		*
		* 不跟的话，外部把面板关掉之后机器内部还记着 `open === true`，
		* 下一次 `press()` 会算成"关闭"，用户点两下才打开。
		*/
		sync(value) {
			cancel();
			open = value;
		},
		dispose() {
			cancel();
		}
	};
}
//#endregion
export { createTriggerMachine };
