const require_ribbon = require("../ribbon.cjs");
const require_dropdown = require("./dropdown.cjs");
let vue = require("vue");
//#region src/vue/ribbon-group.ts
var OjRibbonGroup = (0, vue.defineComponent)({
	name: "OjRibbonGroup",
	props: {
		items: {
			type: Array,
			required: true
		},
		/** 可用宽度。给了就不观察 DOM，宿主自己掌握的那一路（SSR、虚拟化列表）走这里 */
		available: {
			type: Number,
			default: void 0
		},
		/** 与 CSS 的 gap 同源：由组件写进 style，避免"预算按 2px、排版按 4px"那种错位 */
		gap: {
			type: Number,
			default: 2
		},
		overflowWidth: {
			type: Number,
			default: 20
		},
		label: {
			type: String,
			default: void 0
		},
		overflowLabel: {
			type: String,
			default: "更多"
		}
	},
	setup(props, { slots }) {
		const root = (0, vue.ref)(null);
		const boxWidth = (0, vue.ref)(0);
		const widths = (0, vue.ref)({});
		const probe = (0, vue.ref)(null);
		const open = (0, vue.ref)(false);
		/** 已经探过的档位：量不到（隐藏、零尺寸）时也不能无限重试 */
		const probed = /* @__PURE__ */ new Set();
		let observer;
		/** 有命令没给宽度时才需要自己量 */
		const auto = (0, vue.computed)(() => props.items.some((item) => item.width === void 0));
		function observe() {
			observer?.disconnect();
			observer = void 0;
			const el = root.value;
			if (props.available != null || !el || typeof ResizeObserver === "undefined") return;
			boxWidth.value = el.clientWidth;
			observer = new ResizeObserver((entries) => {
				const box = entries[0]?.contentRect;
				if (box) boxWidth.value = box.width;
			});
			observer.observe(el);
		}
		(0, vue.onMounted)(() => {
			observe();
			measure();
		});
		(0, vue.onUnmounted)(() => observer?.disconnect());
		(0, vue.watch)(() => props.available, observe);
		(0, vue.watch)(() => props.items, () => {
			probed.clear();
			probe.value = null;
		});
		/** 把声明 + 已量到的宽度合成 `packRibbon` 要的形态。没量到的档位不虚构成小值。 */
		const packInput = (0, vue.computed)(() => props.items.map((item) => {
			const table = {
				...item.widths ?? {},
				...widths.value[item.id] ?? {}
			};
			return {
				id: item.id,
				size: item.size,
				width: item.width ?? table[item.size] ?? 0,
				widths: table
			};
		}));
		const result = (0, vue.computed)(() => require_ribbon.packRibbon(packInput.value, props.available ?? boxWidth.value, {
			gap: props.gap,
			overflowWidth: props.overflowWidth
		}));
		/**
		* 探测期间把**所有**命令按目标档渲染出来：如果这一版还按 `packRibbon` 的结果只渲染
		* 可见项，那么"宽度为 0 时全部溢出"的情况下根本没有节点可量，探测就成了死循环。
		*/
		const layout = (0, vue.computed)(() => {
			const cap = probe.value;
			if (cap === null) return {
				visible: result.value.visible,
				overflow: result.value.overflow
			};
			return {
				visible: [...result.value.visible, ...result.value.overflow].map((item) => ({
					...item,
					display: require_ribbon.ribbonSmallerSize(item.display, cap)
				})),
				overflow: []
			};
		});
		/** 量当前渲染出来的每一档宽度。返回是否有新数据。 */
		function measure() {
			const el = root.value;
			if (!el || !auto.value) return false;
			let changed = false;
			for (const node of el.querySelectorAll("[data-item]")) {
				const id = node.dataset.item;
				const size = node.dataset.size;
				if (id === void 0 || size === void 0) continue;
				const width = node.offsetWidth;
				if (width <= 0) continue;
				const known = widths.value[id]?.[size];
				if (known !== void 0 && Math.abs(known - width) < .5) continue;
				widths.value = {
					...widths.value,
					[id]: {
						...widths.value[id] ?? {},
						[size]: width
					}
				};
				changed = true;
			}
			return changed;
		}
		(0, vue.watch)(() => result.value.overflow.length === 0, (empty) => {
			if (empty) open.value = false;
		});
		(0, vue.onUpdated)(() => {
			if (!auto.value) return;
			measure();
			if (probe.value !== null) {
				probed.add(probe.value);
				probe.value = null;
				return;
			}
			if (result.value.overflow.length === 0) return;
			const next = require_ribbon.ribbonProbeSize(props.items, widths.value);
			if (next !== void 0 && !probed.has(next)) probe.value = next;
		});
		function renderItem(item, where) {
			const body = (where === "menu" ? slots.overflow ?? slots.item : slots.item)?.({ item }) ?? (0, vue.h)("span", { class: "oj-ribbon-group__label" }, item.id);
			return (0, vue.h)("div", {
				class: where === "menu" ? "oj-ribbon-group__menu-item" : "oj-ribbon-group__item",
				"data-item": item.id,
				"data-size": where === "group" ? item.display : void 0,
				role: where === "menu" ? "menuitem" : void 0,
				tabindex: where === "menu" ? "-1" : void 0
			}, [body]);
		}
		function renderOverflow(items) {
			return (0, vue.h)(require_dropdown.OjDropdown, {
				open: open.value,
				"onUpdate:open": (next) => {
					open.value = next;
				}
			}, {
				trigger: () => (0, vue.h)("button", {
					type: "button",
					class: "oj-ribbon-group__overflow",
					style: { width: `${props.overflowWidth}px` },
					"aria-haspopup": "menu",
					"aria-expanded": open.value ? "true" : "false",
					"aria-label": props.overflowLabel,
					title: props.overflowLabel
				}, "»"),
				default: () => (0, vue.h)("div", {
					class: "oj-ribbon-group__menu",
					role: "menu",
					"aria-label": props.overflowLabel,
					onClick: () => {
						open.value = false;
					}
				}, items.map((item) => renderItem(item, "menu")))
			});
		}
		return () => {
			const packed = layout.value;
			return (0, vue.h)("div", {
				ref: root,
				class: "oj-ribbon-group",
				role: "toolbar",
				"aria-label": props.label,
				"data-probe": probe.value !== null ? "" : void 0,
				style: { gap: `${props.gap}px` }
			}, [
				...packed.visible.map((item) => renderItem(item, "group")),
				packed.overflow.length > 0 ? renderOverflow(packed.overflow) : null,
				slots.launcher === void 0 ? null : (0, vue.h)("span", { class: "oj-ribbon-group__launcher" }, slots.launcher())
			]);
		};
	}
});
//#endregion
exports.OjRibbonGroup = OjRibbonGroup;
