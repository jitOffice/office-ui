//#region src/editor-host.ts
var ENABLED = Object.freeze({ enabled: true });
/**
* 测试与 demo 用的内存宿主。
*
* 两条 `format.*` 规则按实参分流，因为这两类命令在 UI 上是两种控件：
*   - 实参是字符串/数字 → **值型命令**（字号、颜色、边框…），记进 `value`，不动 `active`；
*   - 其它（含无实参）→ **布尔命令**，翻转 `active`。
*
* 早先一版对所有 `format.*` 一律翻转 `active`，于是"把字号设成 16"会让字号控件显示成"已选中"，
* 而真正该变的是 `value`。这类错误只在有了值型命令之后才现形。
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
			if (id.startsWith("format.")) {
				const current = read(id);
				if (typeof arg === "string" || typeof arg === "number") states.set(id, {
					...current,
					value: arg
				});
				else states.set(id, {
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
exports.createMemoryEditor = createMemoryEditor;
