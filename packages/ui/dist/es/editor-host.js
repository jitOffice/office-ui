//#region src/editor-host.ts
var ENABLED = Object.freeze({ enabled: true });
/**
* 测试与 demo 用的内存宿主。`format.bold` 被执行时翻转 `active`，用来证明按钮能跟上选区。
*/
function createMemoryEditor(initial = {}) {
	const states = new Map(Object.entries(initial));
	const calls = [];
	const listeners = /* @__PURE__ */ new Set();
	function read(id) {
		return states.get(id) ?? ENABLED;
	}
	function notify() {
		for (const listener of [...listeners]) listener();
	}
	const host = {
		can: (id) => read(id).enabled !== false,
		state: (id) => read(id),
		exec: (id, arg) => {
			calls.push({
				id,
				arg
			});
			if (!host.can(id)) return false;
			if (id === "format.bold") {
				const current = read(id);
				states.set(id, {
					...current,
					active: current.active !== true
				});
				notify();
			}
			return true;
		},
		subscribe: (listener) => {
			listeners.add(listener);
			return () => listeners.delete(listener);
		}
	};
	return {
		host,
		calls,
		set(id, patch) {
			states.set(id, {
				...read(id),
				...patch
			});
			notify();
		}
	};
}
//#endregion
export { createMemoryEditor };
