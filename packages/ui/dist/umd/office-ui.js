(function(global, factory) {
	typeof exports === "object" && typeof module !== "undefined" ? factory(exports, require("vue")) : typeof define === "function" && define.amd ? define(["exports", "vue"], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, factory(global.OfficeUI = {}, global.Vue));
})(this, function(exports, vue) {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	//#region src/icons.ts
	/**
	* 自绘图标。只发 SVG 字符串，不发图标字体（prd/00 许可红线）。
	* 完整图标管线仍是后续的 `@jitoffice/icons`，这里先覆盖外壳会用到的三十枚。
	*/
	var SVG_OPEN = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\" fill=\"currentColor\">";
	var icons = {
		"oj-format-bold": SVG_OPEN + "<path d=\"M4 2h4.1A2.55 2.55 0 0 1 8.1 7.1H4V2zm0 5.1h4.7A2.65 2.65 0 0 1 8.7 14H4V7.1z\"/></svg>",
		"oj-insert-table": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.2\"><rect x=\"2.2\" y=\"2.2\" width=\"11.6\" height=\"11.6\" rx=\"1\"/><path d=\"M2.2 6.4h11.6M2.2 10.2h11.6M6.4 2.2v11.6M10.2 2.2v11.6\"/></svg>",
		"oj-horizontal-rule": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.4\"><path d=\"M2 8h12\"/></svg>",
		"oj-format-italic": SVG_OPEN + "<path d=\"M6.2 2h6l-.4 1.6H9.7L7.4 12.4h2.1L9.1 14H3.2l.4-1.6h2.1L8 3.6H5.8L6.2 2z\"/></svg>",
		"oj-format-underline": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.3\"><path d=\"M4 2.5v5.2a4 4 0 0 0 8 0V2.5M3 13.5h10\"/></svg>",
		"oj-align-left": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\" fill=\"currentColor\"><path d=\"M2 3h12v1.4H2zm0 3.2h8v1.4H2zm0 3.2h12v1.4H2zm0 3.2h8v1.4H2z\"/></svg>",
		"oj-align-center": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\" fill=\"currentColor\"><path d=\"M2 3h12v1.4H2zm2 3.2h8v1.4H4zm-2 3.2h12v1.4H2zm2 3.2h8v1.4H4z\"/></svg>",
		"oj-align-right": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\" fill=\"currentColor\"><path d=\"M2 3h12v1.4H2zm4 3.2h8v1.4H6zm-4 3.2h12v1.4H2zm4 3.2h8v1.4H6z\"/></svg>",
		"oj-list-bullet": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\" fill=\"currentColor\"><circle cx=\"3\" cy=\"4\" r=\"1.1\"/><circle cx=\"3\" cy=\"8\" r=\"1.1\"/><circle cx=\"3\" cy=\"12\" r=\"1.1\"/><path d=\"M6 3.3h8v1.4H6zm0 4h8v1.4H6zm0 4h8v1.4H6z\"/></svg>",
		"oj-list-number": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\" fill=\"currentColor\"><path d=\"M2.2 3.2h1.2V6H2.2zm0 3.6h2.2v.9H3.2v.5h1.2V9.6H2.2v-.9h1.2v-.4H2.2zm.2 3.2h1.6c.4 0 .7.2.7.6s-.3.6-.7.6H2.4v.9h2.2v.9H2.2v-2.1h.2zM6 3.3h8v1.4H6zm0 4h8v1.4H6zm0 4h8v1.4H6z\"/></svg>",
		"oj-search": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.4\"><circle cx=\"7\" cy=\"7\" r=\"4.2\"/><path d=\"M10.2 10.2 13.5 13.5\"/></svg>",
		"oj-zoom-in": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.4\"><circle cx=\"7\" cy=\"7\" r=\"4.2\"/><path d=\"M10.2 10.2 13.5 13.5M7 5v4M5 7h4\"/></svg>",
		"oj-zoom-out": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.4\"><circle cx=\"7\" cy=\"7\" r=\"4.2\"/><path d=\"M10.2 10.2 13.5 13.5M5 7h4\"/></svg>",
		"oj-folder": SVG_OPEN + "<path d=\"M2 4.2A1.2 1.2 0 0 1 3.2 3h3l1.2 1.4H13a1 1 0 0 1 1 1V12a1 1 0 0 1-1 1H3.2A1.2 1.2 0 0 1 2 11.8z\"/></svg>",
		"oj-file": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.2\"><path d=\"M4 2.2h5.2L12.5 5.5V13.8H4z\"/><path d=\"M9.2 2.2V5.5H12.5\"/></svg>",
		"oj-chevron-right": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.4\"><path d=\"M6 3.5 10.5 8 6 12.5\"/></svg>",
		"oj-chevron-down": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.4\"><path d=\"M3.5 6 8 10.5 12.5 6\"/></svg>",
		"oj-close": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.4\"><path d=\"M4 4l8 8M12 4l-8 8\"/></svg>",
		"oj-undo": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.3\"><path d=\"M4 7.5 1.8 5.2 4 3\"/><path d=\"M2.2 5.2h6.2a4.2 4.2 0 1 1 0 8.4H6\"/></svg>",
		"oj-image": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.2\"><rect x=\"2.2\" y=\"3\" width=\"11.6\" height=\"10\" rx=\"1\"/><circle cx=\"5.5\" cy=\"6.2\" r=\"1\"/><path d=\"M3 11.5 6.2 8.2l2 2 1.6-1.4L13 11.5\"/></svg>",
		"oj-link": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.3\"><path d=\"M6.8 9.2a2.6 2.6 0 0 0 3.7 0l1.8-1.8a2.6 2.6 0 0 0-3.7-3.7L7.6 4.7\"/><path d=\"M9.2 6.8a2.6 2.6 0 0 0-3.7 0L3.7 8.6a2.6 2.6 0 0 0 3.7 3.7l1-1\"/></svg>",
		"oj-comment": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.2\"><path d=\"M3 3.2h10v7.2H6.2L3 12.8z\"/></svg>",
		"oj-print": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.2\"><path d=\"M4.5 6V2.8h7V6\"/><path d=\"M4 11.2H2.8V6.5h10.4v4.7H12\"/><rect x=\"4.5\" y=\"9\" width=\"7\" height=\"4.2\"/></svg>",
		"oj-page": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.2\"><rect x=\"3.5\" y=\"2\" width=\"9\" height=\"12\" rx=\"0.6\"/></svg>",
		"oj-signature": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.3\"><path d=\"M2 11.5c1.6-2.4 2.4-2.2 3.2-.4.6 1.4 1.2 1.6 2-.2 1-2.2 1.6-2 2.6.2.6 1.4 1.4 1.6 2.4-.2\"/><path d=\"M2 13.6h12\"/></svg>",
		"oj-stamp": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.2\"><circle cx=\"8\" cy=\"7\" r=\"4.2\"/><path d=\"M5.2 13.2h5.6M6.4 11.2h3.2\"/></svg>",
		"oj-watermark": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.2\"><rect x=\"2.2\" y=\"2.2\" width=\"11.6\" height=\"11.6\" rx=\"1\"/><path d=\"M4 11.2 12 4.8\"/></svg>",
		"oj-ai": SVG_OPEN + "<path d=\"M8 1.8 9.2 6h4.3L10.3 8.6l1.1 4.2L8 10.4 4.6 12.8 5.7 8.6 2.5 6h4.3z\"/></svg>",
		"oj-indent": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\" fill=\"currentColor\"><path d=\"M2 3h12v1.4H2zm4 3.2h8v1.4H6zm-4 3.2h12v1.4H2zm4 3.2h8v1.4H6z\"/></svg>",
		"oj-outdent": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\" fill=\"currentColor\"><path d=\"M2 3h12v1.4H2zm0 3.2h8v1.4H2zm0 3.2h12v1.4H2zm0 3.2h8v1.4H2z\"/></svg>",
		"oj-code": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.4\"><path d=\"M6 4.5 3 8l3 3.5M10 4.5 13 8l-3 3.5\"/></svg>"
	};
	function iconMarkup(name) {
		if (Object.prototype.hasOwnProperty.call(icons, name)) return icons[name];
	}
	function iconLabelProblem(name, options = {}) {
		if (typeof options.label === "string" && options.label.length > 0 || options.decorative === true) return void 0;
		return `[OjIcon] "${name}" 既没有 label 也没有标 decorative：纯图标元素不进无障碍树，读屏用户读到的是一片空白（prd/03 §2）。给 label（有语义）或 decorative（装饰性，渲染 aria-hidden）二选一。`;
	}
	/**
	* 只有构建器**明确**说是 dev 才告警。宁可线上漏报，也不要在产物里刷控制台——
	* 这个判定读的是 `import.meta.env.DEV`，Vite 在 dev server 下注入 true，产物里没有它。
	*/
	function isDevEnv(env) {
		return (env === null || env === void 0 ? void 0 : env.DEV) === true;
	}
	//#endregion
	//#region src/vue/icon.ts
	function cssSize(size) {
		return typeof size === "number" ? `${size}px` : size;
	}
	/**
	* dev 告警按图标名去重：一个 Ribbon 里同一枚图标会出现十几次，
	* 每个实例刷一行只会让人把控制台关掉——那等于没有告警。
	*/
	var reported = /* @__PURE__ */ new Set();
	var OjIcon = (0, vue.defineComponent)({
		name: "OjIcon",
		props: {
			name: {
				type: String,
				required: true
			},
			size: {
				type: [Number, String],
				default: void 0
			},
			label: {
				type: String,
				default: void 0
			},
			/** 装饰性图标：显式声明「这枚图标没有语义」，渲染 `aria-hidden`（03 §2）。 */
			decorative: {
				type: Boolean,
				default: false
			}
		},
		setup(props) {
			const env = {
				"BASE_URL": "/",
				"DEV": false,
				"MODE": "production",
				"PROD": true,
				"SSR": false
			};
			const problem = iconLabelProblem(props.name, {
				label: props.label,
				decorative: props.decorative
			});
			if (problem !== void 0 && isDevEnv(env) && !reported.has(props.name)) {
				reported.add(props.name);
				console.warn(problem);
			}
			return () => {
				const markup = iconMarkup(props.name);
				const labelled = typeof props.label === "string" && props.label.length > 0;
				return (0, vue.h)("span", {
					class: "oj-icon",
					role: labelled ? "img" : void 0,
					"aria-label": labelled ? props.label : void 0,
					"aria-hidden": labelled ? void 0 : "true",
					style: props.size === void 0 ? void 0 : {
						width: cssSize(props.size),
						height: cssSize(props.size)
					},
					innerHTML: markup !== null && markup !== void 0 ? markup : ""
				});
			};
		}
	});
	//#endregion
	//#region src/vue/command-button.ts
	var OjCommandButton = (0, vue.defineComponent)({
		name: "OjCommandButton",
		props: {
			source: {
				type: Object,
				required: true
			},
			id: {
				type: String,
				required: true
			},
			size: {
				type: String,
				default: "medium"
			}
		},
		setup(props) {
			const view = (0, vue.shallowRef)({ enabled: true });
			let stop = () => {};
			function bind() {
				var _props$source$state;
				stop();
				view.value = (_props$source$state = props.source.state(props.id)) !== null && _props$source$state !== void 0 ? _props$source$state : { enabled: true };
				stop = props.source.subscribe(props.id, (next) => {
					view.value = next;
				});
			}
			(0, vue.onMounted)(bind);
			(0, vue.watch)(() => props.id, bind);
			(0, vue.onUnmounted)(() => stop());
			return () => {
				const command = props.source.get(props.id);
				const state = view.value;
				const enabled = state.enabled !== false;
				const label = command ? props.source.resolve(command.label) : props.id;
				const pressed = typeof state.active === "boolean" ? String(state.active) : void 0;
				return (0, vue.h)("button", {
					type: "button",
					class: "oj-button",
					"data-size": props.size === "mini" ? "mini" : void 0,
					"data-active": state.active === true ? "" : void 0,
					"data-command": props.id,
					"aria-pressed": pressed,
					"aria-disabled": enabled ? void 0 : "true",
					onClick: () => {
						if (enabled) props.source.run(props.id);
					}
				}, [(command === null || command === void 0 ? void 0 : command.icon) ? (0, vue.h)(OjIcon, {
					name: command.icon,
					decorative: true
				}) : null, (0, vue.h)("span", { class: "oj-button__label" }, label)]);
			};
		}
	});
	//#endregion
	//#region src/popper.ts
	function placePopper(options) {
		var _options$gap, _options$padding, _options$placement;
		const gap = (_options$gap = options.gap) !== null && _options$gap !== void 0 ? _options$gap : 4;
		const padding = (_options$padding = options.padding) !== null && _options$padding !== void 0 ? _options$padding : 8;
		const { anchor, popup, viewport } = options;
		const preferred = (_options$placement = options.placement) !== null && _options$placement !== void 0 ? _options$placement : "bottom-start";
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
	//#region src/vue/popper.ts
	var OjPopper = (0, vue.defineComponent)({
		name: "OjPopper",
		props: {
			open: {
				type: Boolean,
				required: true
			},
			anchor: {
				type: Object,
				default: null
			},
			placement: {
				type: String,
				default: "bottom-start"
			}
		},
		setup(props, { slots }) {
			const panel = (0, vue.ref)(null);
			const x = (0, vue.ref)(0);
			const y = (0, vue.ref)(0);
			const placed = (0, vue.ref)(false);
			function update() {
				const anchor = props.anchor;
				const el = panel.value;
				if (!props.open || !anchor || !el) return;
				const box = anchor.getBoundingClientRect();
				const popup = el.getBoundingClientRect();
				const next = placePopper({
					anchor: {
						x: box.left,
						y: box.top,
						width: box.width,
						height: box.height
					},
					popup: {
						width: popup.width,
						height: popup.height
					},
					viewport: {
						width: window.innerWidth,
						height: window.innerHeight
					},
					placement: props.placement
				});
				x.value = next.x;
				y.value = next.y;
				placed.value = true;
			}
			(0, vue.onMounted)(() => {
				(0, vue.nextTick)(update);
			});
			(0, vue.watch)(() => props.open, (open) => {
				if (!open) placed.value = false;
				else (0, vue.nextTick)(update);
			});
			return () => {
				var _slots$default;
				if (!props.open) return null;
				return (0, vue.h)("div", {
					ref: panel,
					class: "oj-popper",
					style: {
						left: `${x.value}px`,
						top: `${y.value}px`,
						visibility: placed.value ? "visible" : "hidden"
					}
				}, (_slots$default = slots.default) === null || _slots$default === void 0 ? void 0 : _slots$default.call(slots));
			};
		}
	});
	//#endregion
	//#region src/tooltip.ts
	function defaultSchedule(fn, ms) {
		const id = setTimeout(fn, ms);
		return () => clearTimeout(id);
	}
	function createTooltipMachine(options = {}) {
		var _options$delay, _options$schedule;
		const delay = (_options$delay = options.delay) !== null && _options$delay !== void 0 ? _options$delay : 400;
		const schedule = (_options$schedule = options.schedule) !== null && _options$schedule !== void 0 ? _options$schedule : defaultSchedule;
		let open = false;
		let pending = null;
		function setOpen(next) {
			var _options$onChange;
			if (open === next) return;
			open = next;
			(_options$onChange = options.onChange) === null || _options$onChange === void 0 || _options$onChange.call(options, open);
		}
		function cancel() {
			pending === null || pending === void 0 || pending();
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
	//#region src/vue/tooltip.ts
	var OjTooltip = (0, vue.defineComponent)({
		name: "OjTooltip",
		props: {
			label: {
				type: String,
				required: true
			},
			delay: {
				type: Number,
				default: 400
			}
		},
		setup(props, { slots }) {
			const root = (0, vue.ref)(null);
			const open = (0, vue.ref)(false);
			const x = (0, vue.ref)(0);
			const y = (0, vue.ref)(0);
			const machine = createTooltipMachine({
				get delay() {
					return props.delay;
				},
				onChange: (next) => {
					open.value = next;
					if (!next || !root.value) return;
					const box = root.value.getBoundingClientRect();
					const pos = placePopper({
						anchor: {
							x: box.left,
							y: box.top,
							width: box.width,
							height: box.height
						},
						popup: {
							width: Math.max(props.label.length * 12, 48),
							height: 28
						},
						viewport: {
							width: window.innerWidth,
							height: window.innerHeight
						},
						placement: "top-start"
					});
					x.value = pos.x;
					y.value = pos.y;
				}
			});
			(0, vue.onUnmounted)(() => machine.dispose());
			return () => {
				var _slots$default;
				return (0, vue.h)("span", {
					ref: root,
					class: "oj-tooltip-anchor",
					onMouseenter: () => machine.enter(),
					onMouseleave: () => machine.leave(),
					onFocusin: () => machine.show(),
					onFocusout: () => machine.hide()
				}, [(_slots$default = slots.default) === null || _slots$default === void 0 ? void 0 : _slots$default.call(slots), open.value ? (0, vue.h)("span", {
					class: "oj-tooltip",
					role: "tooltip",
					style: {
						left: `${x.value}px`,
						top: `${y.value}px`
					}
				}, props.label) : null]);
			};
		}
	});
	//#endregion
	//#region src/vue/dropdown.ts
	var OjDropdown = (0, vue.defineComponent)({
		name: "OjDropdown",
		props: { open: {
			type: Boolean,
			default: false
		} },
		emits: ["update:open"],
		setup(props, { slots, emit }) {
			const root = (0, vue.ref)(null);
			const anchor = (0, vue.ref)(null);
			function setOpen(next) {
				emit("update:open", next);
			}
			function onPointerDown(event) {
				const el = root.value;
				if (!props.open || !el) return;
				if (event.target instanceof Node && el.contains(event.target)) return;
				setOpen(false);
			}
			function onKey(event) {
				if (event.key === "Escape" && props.open) {
					var _anchor$value;
					event.stopPropagation();
					setOpen(false);
					(_anchor$value = anchor.value) === null || _anchor$value === void 0 || _anchor$value.focus();
				}
			}
			(0, vue.onMounted)(() => {
				document.addEventListener("pointerdown", onPointerDown);
			});
			(0, vue.onUnmounted)(() => {
				document.removeEventListener("pointerdown", onPointerDown);
			});
			return () => {
				var _slots$trigger;
				return (0, vue.h)("div", {
					ref: root,
					class: "oj-dropdown",
					onKeydown: onKey
				}, [(0, vue.h)("span", {
					ref: anchor,
					class: "oj-dropdown__trigger",
					onClick: () => setOpen(!props.open)
				}, (_slots$trigger = slots.trigger) === null || _slots$trigger === void 0 ? void 0 : _slots$trigger.call(slots)), (0, vue.h)(OjPopper, {
					open: props.open,
					anchor: anchor.value
				}, { default: () => {
					var _slots$default;
					return (_slots$default = slots.default) === null || _slots$default === void 0 ? void 0 : _slots$default.call(slots);
				} })]);
			};
		}
	});
	//#endregion
	//#region src/table-grid.ts
	/** prd/03 §4：可见网格到 10 行 × 20 列，再大走插入对话框。 */
	var DEFAULT_GRID_LIMITS = {
		rows: 10,
		cols: 20
	};
	function assertLimits(limits) {
		if (!Number.isInteger(limits.rows) || !Number.isInteger(limits.cols) || limits.rows < 1 || limits.cols < 1) throw new Error("表格框选上限必须是正整数");
	}
	function createGridPicker(limits = DEFAULT_GRID_LIMITS) {
		assertLimits(limits);
		let hover = null;
		let exceeded = false;
		function place(cell) {
			if (!Number.isInteger(cell.row) || !Number.isInteger(cell.col)) return;
			if (cell.row < 1 || cell.col < 1) return;
			if (cell.row > limits.rows || cell.col > limits.cols) {
				exceeded = true;
				return;
			}
			exceeded = false;
			hover = {
				row: cell.row,
				col: cell.col
			};
		}
		return {
			limits,
			get hover() {
				return hover;
			},
			get exceeded() {
				return exceeded;
			},
			move: place,
			leave() {},
			key(key) {
				var _hover;
				const current = (_hover = hover) !== null && _hover !== void 0 ? _hover : {
					row: 1,
					col: 1
				};
				if (key === "Escape") return "cancel";
				if (key === "Enter") return hover ? "commit" : "ignore";
				if (key === "Home") {
					place({
						row: current.row,
						col: 1
					});
					return "move";
				}
				if (key === "End") {
					place({
						row: current.row,
						col: limits.cols
					});
					return "move";
				}
				const next = {
					ArrowUp: {
						row: current.row - 1,
						col: current.col
					},
					ArrowDown: {
						row: current.row + 1,
						col: current.col
					},
					ArrowLeft: {
						row: current.row,
						col: current.col - 1
					},
					ArrowRight: {
						row: current.row,
						col: current.col + 1
					}
				}[key];
				if (!next) return "ignore";
				place(hover ? next : {
					row: 1,
					col: 1
				});
				return "move";
			},
			commit: () => hover,
			vars: () => {
				var _hover$row, _hover$col;
				return {
					"--oj-gp-row": String((_hover$row = hover === null || hover === void 0 ? void 0 : hover.row) !== null && _hover$row !== void 0 ? _hover$row : 0),
					"--oj-gp-col": String((_hover$col = hover === null || hover === void 0 ? void 0 : hover.col) !== null && _hover$col !== void 0 ? _hover$col : 0)
				};
			}
		};
	}
	//#endregion
	//#region src/vue/table-grid-picker.ts
	var OjTableGridPicker = (0, vue.defineComponent)({
		name: "OjTableGridPicker",
		props: {
			rows: {
				type: Number,
				default: 10
			},
			cols: {
				type: Number,
				default: 20
			},
			format: {
				type: Function,
				default: void 0
			},
			detailLabel: {
				type: String,
				default: ""
			},
			exceedLabel: {
				type: String,
				default: ""
			}
		},
		emits: ["select", "detail"],
		setup(props, { emit }) {
			const picker = createGridPicker({
				rows: props.rows,
				cols: props.cols
			});
			const tick = (0, vue.ref)(0);
			function touch() {
				tick.value += 1;
			}
			return () => {
				var _props$format, _props$format2;
				tick.value;
				const hover = picker.hover;
				const vars = picker.vars();
				const cells = [];
				for (let row = 1; row <= picker.limits.rows; row += 1) {
					const rowCells = [];
					for (let col = 1; col <= picker.limits.cols; col += 1) {
						const cell = {
							row,
							col
						};
						rowCells.push((0, vue.h)("button", {
							type: "button",
							class: "oj-grid-picker__cell",
							role: "gridcell",
							"aria-selected": (hover === null || hover === void 0 ? void 0 : hover.row) === row && (hover === null || hover === void 0 ? void 0 : hover.col) === col ? "true" : "false",
							tabindex: -1,
							onMouseenter: () => {
								picker.move(cell);
								touch();
							},
							onClick: () => {
								picker.move(cell);
								const chosen = picker.commit();
								if (chosen) emit("select", chosen);
							}
						}));
					}
					cells.push((0, vue.h)("div", { role: "row" }, rowCells));
				}
				const size = hover ? (_props$format = (_props$format2 = props.format) === null || _props$format2 === void 0 ? void 0 : _props$format2.call(props, hover)) !== null && _props$format !== void 0 ? _props$format : `${hover.row} × ${hover.col}` : "";
				return (0, vue.h)("div", {
					class: "oj-grid-picker",
					onMouseleave: () => {
						picker.leave();
						touch();
					}
				}, [
					(0, vue.h)("div", {
						class: "oj-grid-picker__cells",
						role: "grid",
						tabindex: 0,
						"aria-rowcount": picker.limits.rows,
						"aria-colcount": picker.limits.cols,
						style: {
							...vars,
							"--oj-gp-cols": String(picker.limits.cols)
						},
						onKeydown: (event) => {
							const result = picker.key(event.key);
							if (result === "ignore" || result === "cancel") return;
							event.preventDefault();
							touch();
							if (result === "commit") {
								const chosen = picker.commit();
								if (chosen) emit("select", chosen);
							}
						}
					}, [(0, vue.h)("div", {
						class: "oj-grid-picker__overlay",
						"aria-hidden": "true",
						"data-empty": hover ? void 0 : ""
					}), ...cells]),
					size ? (0, vue.h)("p", { class: "oj-grid-picker__size" }, size) : null,
					picker.exceeded && props.exceedLabel ? (0, vue.h)("p", { class: "oj-grid-picker__exceed" }, props.exceedLabel) : null,
					props.detailLabel ? (0, vue.h)("button", {
						type: "button",
						class: "oj-grid-picker__detail",
						onClick: () => emit("detail")
					}, props.detailLabel) : null
				]);
			};
		}
	});
	//#endregion
	//#region src/shell/tabs.ts
	/** 选项卡键盘模型。方向键在一组 id 里循环，Home / End 跳到两端。 */
	function selectByKey(ids, current, key) {
		var _ids, _ids2, _ids$, _ids3;
		if (ids.length === 0) return current;
		const index = Math.max(0, ids.indexOf(current));
		if (key === "ArrowRight") return (_ids = ids[(index + 1) % ids.length]) !== null && _ids !== void 0 ? _ids : current;
		if (key === "ArrowLeft") return (_ids2 = ids[(index - 1 + ids.length) % ids.length]) !== null && _ids2 !== void 0 ? _ids2 : current;
		if (key === "Home") return (_ids$ = ids[0]) !== null && _ids$ !== void 0 ? _ids$ : current;
		if (key === "End") return (_ids3 = ids[ids.length - 1]) !== null && _ids3 !== void 0 ? _ids3 : current;
		return current;
	}
	//#endregion
	//#region src/vue/tabs.ts
	var OjTabs = (0, vue.defineComponent)({
		name: "OjTabs",
		props: {
			items: {
				type: Array,
				required: true
			},
			modelValue: {
				type: String,
				required: true
			}
		},
		emits: ["update:modelValue"],
		setup(props, { emit }) {
			return () => (0, vue.h)("div", {
				class: "oj-tabs",
				role: "tablist",
				onKeydown: (event) => {
					const next = selectByKey(props.items.map((item) => item.id), props.modelValue, event.key);
					if (next === props.modelValue) return;
					event.preventDefault();
					emit("update:modelValue", next);
				}
			}, props.items.map((item) => {
				const selected = item.id === props.modelValue;
				return (0, vue.h)("button", {
					type: "button",
					class: "oj-tabs__tab",
					role: "tab",
					id: `oj-tab-${item.id}`,
					"aria-selected": selected ? "true" : "false",
					tabindex: selected ? 0 : -1,
					onClick: () => emit("update:modelValue", item.id)
				}, item.label);
			}));
		}
	});
	//#endregion
	//#region src/vue/dialog.ts
	/**
	* 03 §2「弹层归属」：`teleport: 'body' | '[selector]' | false`。
	*
	* Office 场景里弹窗不能一律挂 body：全屏放映要投进放映容器、iframe 内要投进 iframe 的
	* document、打印区域同理。`false` 留在原地，给已经自己做了层级管理的宿主用。
	*/
	function teleportTarget(value) {
		if (value === false) return void 0;
		return typeof value === "string" && value.length > 0 ? value : "body";
	}
	var OjDialog = (0, vue.defineComponent)({
		name: "OjDialog",
		props: {
			open: {
				type: Boolean,
				required: true
			},
			title: {
				type: String,
				required: true
			},
			confirmLabel: {
				type: String,
				default: ""
			},
			cancelLabel: {
				type: String,
				default: ""
			},
			teleport: {
				type: [String, Boolean],
				default: "body"
			}
		},
		emits: [
			"update:open",
			"confirm",
			"cancel"
		],
		setup(props, { slots, emit }) {
			function cancel() {
				emit("cancel");
				emit("update:open", false);
			}
			function confirm() {
				emit("confirm");
			}
			function onKey(event) {
				if (!props.open || event.key !== "Escape") return;
				event.preventDefault();
				cancel();
			}
			(0, vue.onMounted)(() => document.addEventListener("keydown", onKey));
			(0, vue.onUnmounted)(() => document.removeEventListener("keydown", onKey));
			(0, vue.watch)(() => props.open, (open) => {
				if (!open) return;
				queueMicrotask(() => {
					var _document$querySelect;
					return (_document$querySelect = document.querySelector(".oj-dialog__confirm")) === null || _document$querySelect === void 0 ? void 0 : _document$querySelect.focus();
				});
			});
			return () => {
				var _slots$default;
				if (!props.open) return null;
				const content = (0, vue.h)("div", {
					class: "oj-dialog__mask",
					onClick: () => cancel()
				}, [(0, vue.h)("div", {
					class: "oj-dialog",
					role: "dialog",
					"aria-modal": "true",
					"aria-label": props.title,
					onClick: (event) => event.stopPropagation()
				}, [
					(0, vue.h)("header", { class: "oj-dialog__header" }, [(0, vue.h)("h2", { class: "oj-dialog__title" }, props.title), (0, vue.h)("button", {
						type: "button",
						class: "oj-button",
						"data-size": "mini",
						"aria-label": props.cancelLabel,
						onClick: () => cancel()
					}, [(0, vue.h)(OjIcon, {
						name: "oj-close",
						decorative: true
					})])]),
					(0, vue.h)("div", { class: "oj-dialog__body" }, (_slots$default = slots.default) === null || _slots$default === void 0 ? void 0 : _slots$default.call(slots)),
					(0, vue.h)("footer", { class: "oj-dialog__footer" }, [props.cancelLabel ? (0, vue.h)("button", {
						type: "button",
						class: "oj-button",
						onClick: () => cancel()
					}, props.cancelLabel) : null, props.confirmLabel ? (0, vue.h)("button", {
						type: "button",
						class: "oj-button oj-dialog__confirm",
						"data-active": "",
						onClick: () => confirm()
					}, props.confirmLabel) : null])
				])]);
				const to = teleportTarget(props.teleport);
				return to === void 0 ? content : (0, vue.h)(vue.Teleport, { to }, [content]);
			};
		}
	});
	//#endregion
	//#region src/vue/search-bar.ts
	var OjSearchReplaceBar = (0, vue.defineComponent)({
		name: "OjSearchReplaceBar",
		props: {
			find: {
				type: String,
				default: ""
			},
			replace: {
				type: String,
				default: ""
			},
			matchCase: {
				type: Boolean,
				default: false
			},
			current: {
				type: Number,
				default: 0
			},
			total: {
				type: Number,
				default: 0
			},
			findLabel: {
				type: String,
				required: true
			},
			replaceLabel: {
				type: String,
				required: true
			},
			nextLabel: {
				type: String,
				required: true
			},
			previousLabel: {
				type: String,
				required: true
			},
			matchCaseLabel: {
				type: String,
				required: true
			},
			countLabel: {
				type: String,
				required: true
			},
			replaceActionLabel: {
				type: String,
				required: true
			},
			replaceAllLabel: {
				type: String,
				required: true
			}
		},
		emits: [
			"update:find",
			"update:replace",
			"update:matchCase",
			"next",
			"previous",
			"replace",
			"replace-all"
		],
		setup(props, { emit }) {
			return () => (0, vue.h)("form", {
				class: "oj-search",
				onSubmit: (event) => event.preventDefault()
			}, [
				(0, vue.h)("label", { class: "oj-search__field" }, [(0, vue.h)("span", props.findLabel), (0, vue.h)("input", {
					value: props.find,
					onInput: (event) => emit("update:find", event.target.value)
				})]),
				(0, vue.h)("label", { class: "oj-search__field" }, [(0, vue.h)("span", props.replaceLabel), (0, vue.h)("input", {
					value: props.replace,
					onInput: (event) => emit("update:replace", event.target.value)
				})]),
				(0, vue.h)("span", { class: "oj-search__count" }, props.countLabel),
				(0, vue.h)("button", {
					type: "button",
					class: "oj-button",
					"data-size": "mini",
					"data-active": props.matchCase ? "" : void 0,
					"aria-pressed": props.matchCase ? "true" : "false",
					onClick: () => emit("update:matchCase", !props.matchCase)
				}, props.matchCaseLabel),
				(0, vue.h)("button", {
					type: "button",
					class: "oj-button",
					"data-size": "mini",
					onClick: () => emit("previous")
				}, props.previousLabel),
				(0, vue.h)("button", {
					type: "button",
					class: "oj-button",
					"data-size": "mini",
					onClick: () => emit("next")
				}, props.nextLabel),
				(0, vue.h)("button", {
					type: "button",
					class: "oj-button",
					"data-size": "mini",
					onClick: () => emit("replace")
				}, props.replaceActionLabel),
				(0, vue.h)("button", {
					type: "button",
					class: "oj-button",
					"data-size": "mini",
					onClick: () => emit("replace-all")
				}, props.replaceAllLabel)
			]);
		}
	});
	function clampZoom(value) {
		if (!Number.isFinite(value)) return 100;
		return Math.min(200, Math.max(50, Math.round(value)));
	}
	function stepZoom(value, direction) {
		return clampZoom(clampZoom(value) + direction * 10);
	}
	//#endregion
	//#region src/vue/zoom-control.ts
	var OjZoomControl = (0, vue.defineComponent)({
		name: "OjZoomControl",
		props: {
			modelValue: {
				type: Number,
				required: true
			},
			zoomOutLabel: {
				type: String,
				required: true
			},
			zoomInLabel: {
				type: String,
				required: true
			},
			resetLabel: {
				type: String,
				required: true
			}
		},
		emits: ["update:modelValue"],
		setup(props, { emit }) {
			return () => (0, vue.h)("div", {
				class: "oj-zoom",
				role: "group"
			}, [
				(0, vue.h)("button", {
					type: "button",
					class: "oj-button",
					"data-size": "mini",
					"aria-label": props.zoomOutLabel,
					onClick: () => emit("update:modelValue", stepZoom(props.modelValue, -1))
				}, [(0, vue.h)(OjIcon, {
					name: "oj-zoom-out",
					decorative: true
				})]),
				(0, vue.h)("span", { class: "oj-zoom__value" }, `${props.modelValue}%`),
				(0, vue.h)("button", {
					type: "button",
					class: "oj-button",
					"data-size": "mini",
					"aria-label": props.zoomInLabel,
					onClick: () => emit("update:modelValue", stepZoom(props.modelValue, 1))
				}, [(0, vue.h)(OjIcon, {
					name: "oj-zoom-in",
					decorative: true
				})]),
				(0, vue.h)("button", {
					type: "button",
					class: "oj-button",
					"data-size": "mini",
					onClick: () => emit("update:modelValue", 100)
				}, props.resetLabel)
			]);
		}
	});
	//#endregion
	//#region src/vue/file-tree.ts
	var OjFileTree = (0, vue.defineComponent)({
		name: "OjFileTree",
		props: {
			nodes: {
				type: Array,
				required: true
			},
			openIds: {
				type: Array,
				default: () => []
			},
			selectedId: {
				type: String,
				default: ""
			},
			emptyLabel: {
				type: String,
				default: ""
			}
		},
		emits: ["toggle", "select"],
		setup(props, { emit }) {
			function renderNode(node, depth) {
				const open = props.openIds.includes(node.id);
				const selected = props.selectedId === node.id;
				return (0, vue.h)("li", {
					key: node.id,
					role: "none"
				}, [(0, vue.h)("button", {
					type: "button",
					class: "oj-files__item",
					role: "treeitem",
					"aria-expanded": node.kind === "folder" ? String(open) : void 0,
					"aria-selected": selected ? "true" : "false",
					style: { paddingLeft: `${8 + depth * 16}px` },
					onClick: () => {
						if (node.kind === "folder") emit("toggle", node.id);
						emit("select", node.id);
					}
				}, [node.kind === "folder" ? (0, vue.h)(OjIcon, {
					name: open ? "oj-chevron-down" : "oj-chevron-right",
					decorative: true
				}) : (0, vue.h)(OjIcon, {
					name: "oj-file",
					decorative: true
				}), (0, vue.h)("span", node.name)]), node.kind === "folder" && open && node.children ? (0, vue.h)("ul", { role: "group" }, node.children.map((child) => renderNode(child, depth + 1))) : null]);
			}
			return () => {
				if (props.nodes.length === 0) return (0, vue.h)("p", { class: "oj-files__empty" }, props.emptyLabel);
				return (0, vue.h)("ul", {
					class: "oj-files",
					role: "tree"
				}, props.nodes.map((node) => renderNode(node, 0)));
			};
		}
	});
	//#endregion
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
	//#endregion
	//#region src/vue/ruler.ts
	var OjRuler = (0, vue.defineComponent)({
		name: "OjRuler",
		props: {
			length: {
				type: Number,
				required: true
			},
			zoom: {
				type: Number,
				required: true
			},
			orientation: {
				type: String,
				default: "horizontal"
			}
		},
		setup(props) {
			return () => {
				const ticks = rulerTicks(props.length, props.zoom);
				const horizontal = props.orientation !== "vertical";
				return (0, vue.h)("div", {
					class: horizontal ? "oj-ruler oj-ruler--h" : "oj-ruler oj-ruler--v",
					style: horizontal ? { width: `${props.length}px` } : { height: `${props.length}px` },
					"aria-hidden": "true"
				}, ticks.map((tick) => (0, vue.h)("span", {
					class: "oj-ruler__tick",
					style: horizontal ? { left: `${tick.offset}px` } : { top: `${tick.offset}px` }
				}, tick.label)));
			};
		}
	});
	//#endregion
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
	//#region src/vue/signature-pad.ts
	var OjSignaturePad = (0, vue.defineComponent)({
		name: "OjSignaturePad",
		props: { clearLabel: {
			type: String,
			required: true
		} },
		emits: ["change"],
		setup(props, { emit }) {
			const strokes = (0, vue.ref)([]);
			const drawing = (0, vue.ref)(false);
			function point(event) {
				const bounds = event.currentTarget.getBoundingClientRect();
				return {
					x: Math.round(event.clientX - bounds.left),
					y: Math.round(event.clientY - bounds.top)
				};
			}
			function publish(next) {
				strokes.value = next;
				emit("change", next);
			}
			return () => (0, vue.h)("div", { class: "oj-signature" }, [(0, vue.h)("svg", {
				class: "oj-signature__pad",
				viewBox: "0 0 360 140",
				onPointerdown: (event) => {
					drawing.value = true;
					event.currentTarget.setPointerCapture(event.pointerId);
					publish(startStroke(strokes.value, point(event)));
				},
				onPointermove: (event) => {
					if (!drawing.value) return;
					publish(extendStroke(strokes.value, point(event)));
				},
				onPointerup: () => {
					drawing.value = false;
				}
			}, strokes.value.map((stroke, index) => (0, vue.h)("path", {
				key: index,
				d: strokePath(stroke),
				fill: "none",
				stroke: "currentColor",
				"stroke-width": "1.6"
			}))), (0, vue.h)("button", {
				type: "button",
				class: "oj-button",
				"data-size": "mini",
				onClick: () => publish([])
			}, props.clearLabel)]);
		}
	});
	//#endregion
	//#region src/vue/stamp.ts
	var OjStamp = (0, vue.defineComponent)({
		name: "OjStamp",
		props: { text: {
			type: String,
			required: true
		} },
		setup(props) {
			return () => (0, vue.h)("span", {
				class: "oj-stamp",
				"aria-hidden": "true"
			}, props.text);
		}
	});
	//#endregion
	//#region src/vue/watermark.ts
	var OjWatermark = (0, vue.defineComponent)({
		name: "OjWatermark",
		props: {
			text: {
				type: String,
				required: true
			},
			visible: {
				type: Boolean,
				default: true
			}
		},
		setup(props, { slots }) {
			return () => {
				var _slots$default;
				return (0, vue.h)("div", { class: "oj-watermark" }, [(_slots$default = slots.default) === null || _slots$default === void 0 ? void 0 : _slots$default.call(slots), props.visible ? (0, vue.h)("div", {
					class: "oj-watermark__layer",
					"aria-hidden": "true"
				}, props.text) : null]);
			};
		}
	});
	//#endregion
	//#region src/vue/ai-panel.ts
	var OjAiPanel = (0, vue.defineComponent)({
		name: "OjAiPanel",
		props: {
			title: {
				type: String,
				required: true
			},
			placeholder: {
				type: String,
				required: true
			},
			sendLabel: {
				type: String,
				required: true
			},
			messages: {
				type: Array,
				default: () => []
			},
			notice: {
				type: String,
				default: ""
			}
		},
		emits: ["submit"],
		setup(props, { emit }) {
			const draft = (0, vue.ref)("");
			return () => (0, vue.h)("aside", {
				class: "oj-ai",
				"aria-label": props.title
			}, [
				(0, vue.h)("header", { class: "oj-ai__title" }, props.title),
				props.notice ? (0, vue.h)("p", { class: "oj-ai__notice" }, props.notice) : null,
				(0, vue.h)("ol", { class: "oj-ai__log" }, props.messages.map((message, index) => (0, vue.h)("li", {
					key: index,
					"data-role": message.role
				}, message.text))),
				(0, vue.h)("form", {
					class: "oj-ai__form",
					onSubmit: (event) => {
						event.preventDefault();
						const text = draft.value.trim();
						if (!text) return;
						draft.value = "";
						emit("submit", text);
					}
				}, [(0, vue.h)("input", {
					value: draft.value,
					placeholder: props.placeholder,
					onInput: (event) => {
						draft.value = event.target.value;
					}
				}), (0, vue.h)("button", {
					type: "submit",
					class: "oj-button",
					"data-size": "mini"
				}, props.sendLabel)])
			]);
		}
	});
	//#endregion
	//#region src/vue/code-block.ts
	var OjCodeBlock = (0, vue.defineComponent)({
		name: "OjCodeBlock",
		props: {
			code: {
				type: String,
				required: true
			},
			language: {
				type: String,
				default: ""
			}
		},
		setup(props) {
			return () => (0, vue.h)("pre", { class: "oj-code" }, [props.language ? (0, vue.h)("span", { class: "oj-code__lang" }, props.language) : null, props.code]);
		}
	});
	//#endregion
	exports.OjAiPanel = OjAiPanel;
	exports.OjCodeBlock = OjCodeBlock;
	exports.OjCommandButton = OjCommandButton;
	exports.OjDialog = OjDialog;
	exports.OjDropdown = OjDropdown;
	exports.OjFileTree = OjFileTree;
	exports.OjIcon = OjIcon;
	exports.OjPopper = OjPopper;
	exports.OjRuler = OjRuler;
	exports.OjSearchReplaceBar = OjSearchReplaceBar;
	exports.OjSignaturePad = OjSignaturePad;
	exports.OjStamp = OjStamp;
	exports.OjTableGridPicker = OjTableGridPicker;
	exports.OjTabs = OjTabs;
	exports.OjTooltip = OjTooltip;
	exports.OjWatermark = OjWatermark;
	exports.OjZoomControl = OjZoomControl;
});
