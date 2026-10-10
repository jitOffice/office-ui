//#region src/commands/registry.ts
var NO_STATE = Object.freeze({ enabled: true });
function sameState(a, b) {
	if (a === void 0 || b === void 0) return a === b;
	return a.enabled === b.enabled && a.active === b.active && a.indeterminate === b.indeterminate && a.value === b.value && a.label === b.label;
}
function defaultSchedule(task) {
	const raf = globalThis.requestAnimationFrame;
	if (typeof raf === "function") raf(task);
	else setTimeout(task, 0);
}
function createCommandRegistry(options = {}) {
	const dev = options.dev ?? false;
	const contextProvider = options.context ?? (() => void 0);
	const resolveMessage = options.resolve ?? ((message) => typeof message === "string" ? message : message.key);
	const schedule = options.schedule ?? defaultSchedule;
	const slots = /* @__PURE__ */ new Map();
	const listeners = /* @__PURE__ */ new Map();
	const unbinders = [];
	let seq = 0;
	let epoch = 0;
	let frameQueued = false;
	let disposed = false;
	function labelOf(command) {
		return resolveMessage(command.label);
	}
	function publish(e) {
		const previous = e.pushed;
		e.pushed = e.state;
		if (previous === void 0 || sameState(previous, e.state)) return;
		const set = listeners.get(e.command.id);
		if (!set) return;
		for (const fn of [...set]) fn(e.state, previous);
	}
	/** 求值并广播。`state()` 的惰性路径与合帧路径共用这一条，保证任何一次真实变化都不会漏通知。 */
	function refresh(e) {
		if (e.command.state && e.epoch !== epoch) {
			e.state = e.command.state(contextProvider());
			e.epoch = epoch;
		}
		publish(e);
	}
	function flush() {
		frameQueued = false;
		if (disposed) return;
		for (const e of slots.values()) refresh(e);
	}
	/** 宣告"外部状态可能变了"。合帧：一帧内一千次选区变化只重算一轮。 */
	function invalidate() {
		epoch += 1;
		if (disposed || frameQueued) return;
		frameQueued = true;
		schedule(flush);
	}
	function slotOf(id) {
		return disposed ? void 0 : slots.get(id);
	}
	function register(command) {
		if (typeof command.id !== "string" || command.id.length === 0) throw new TypeError("命令必须有非空 id");
		if (typeof command.run !== "function") throw new TypeError(`命令 ${command.id} 必须有 run`);
		if (slots.get(command.id) && dev) console.warn(`[oj/commands] 重复注册 "${command.id}"，后注册的覆盖前者（生产模式下静默）`);
		const e = {
			command,
			seq: seq++,
			state: NO_STATE,
			pushed: void 0,
			epoch: -1
		};
		slots.set(command.id, e);
		invalidate();
		return () => {
			if (slots.get(command.id) === e) {
				slots.delete(command.id);
				listeners.delete(command.id);
				invalidate();
			}
		};
	}
	function unregister(id) {
		const had = slots.delete(id);
		listeners.delete(id);
		if (had) invalidate();
		return had;
	}
	function list(query = {}) {
		const ctx = query.context === void 0 ? contextProvider() : query.context;
		const picked = [];
		for (const e of slots.values()) {
			const c = e.command;
			if (query.group !== void 0 && c.group !== query.group) continue;
			if (!query.includeUnavailable && c.when && !c.when(ctx)) continue;
			picked.push(e);
		}
		picked.sort((a, b) => (a.command.order ?? 0) - (b.command.order ?? 0) || a.seq - b.seq);
		return picked.map((e) => e.command);
	}
	function state(id) {
		const e = slotOf(id);
		if (!e) return void 0;
		refresh(e);
		return e.state;
	}
	async function run(id, arg) {
		const e = slotOf(id);
		if (!e) return {
			id,
			ok: false,
			skipped: "not-found"
		};
		const command = e.command;
		const ctx = contextProvider();
		if (command.when && !command.when(ctx)) return {
			id,
			ok: false,
			skipped: "when"
		};
		const live = command.state ? command.state(ctx) : void 0;
		if (live && live.enabled === false) return {
			id,
			ok: false,
			skipped: "disabled"
		};
		const mode = command.history ?? "undoable";
		const label = labelOf(command);
		const adapter = options.history;
		try {
			const invoke = () => command.run(ctx, arg);
			await (mode === "undoable" && adapter ? adapter.transact(label, invoke) : invoke());
			if (mode !== "none") adapter?.recordRecent?.(label);
			invalidate();
			return {
				id,
				ok: true
			};
		} catch (error) {
			invalidate();
			if (options.onError) options.onError(error, id);
			else console.error(`[oj/commands] "${id}" 执行失败`, error);
			return {
				id,
				ok: false,
				error
			};
		}
	}
	function subscribe(id, listener) {
		let set = listeners.get(id);
		if (!set) {
			set = /* @__PURE__ */ new Set();
			listeners.set(id, set);
		}
		set.add(listener);
		return () => {
			const current = listeners.get(id);
			if (!current) return;
			current.delete(listener);
			if (current.size === 0) listeners.delete(id);
		};
	}
	function bind(source) {
		const detach = source.subscribe(() => invalidate());
		const record = () => {
			detach();
			const i = unbinders.indexOf(record);
			if (i >= 0) unbinders.splice(i, 1);
		};
		unbinders.push(record);
		invalidate();
		return record;
	}
	function dispose() {
		disposed = true;
		for (const off of [...unbinders]) off();
		listeners.clear();
		slots.clear();
	}
	return {
		register,
		unregister,
		get: (id) => slotOf(id)?.command,
		list,
		state,
		run,
		bind,
		refresh: invalidate,
		subscribe,
		resolve: resolveMessage,
		dispose
	};
}
//#endregion
exports.createCommandRegistry = createCommandRegistry;
