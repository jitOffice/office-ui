import { paneSplitter } from "../shell/splitter.js";
import { OjSplitter } from "./splitter.js";
import { defineComponent, h } from "vue";
//#region src/vue/pane-group.ts
/**
* `OjPaneGroup`（03 §3 D 组）：按声明排布多栏，并在栏之间插分隔条。
*
* 只做三件组件里最容易写错的事，其余交给宿主：
*   - **哪根条子调哪一栏**由 `paneSplitter()` 决定——永远调固定宽的那一栏。
*     可伸缩栏的尺寸是"剩下的空间"，让它当被调对象就会出现"拖完跳回原处"。
*   - **栏位用命名插槽**（`#<id>`），不用默认插槽：默认插槽会把同一段内容画进每一栏，
*     而多栏布局里每栏内容必然不同，复制出来的 DOM 只会让宿主以为组件坏了。
*   - **不自己存尺寸**。`update:size` 带栏位 id 上抛，宿主回写 `panes`；否则拖拽与
*     外部改布局（切换预设、恢复会话）会各存一份，谁赢取决于时序。
*
* 布局只用 flex：固定栏 `flex: 0 0 auto` + 宽/高，可伸缩栏 `flex: 1 1 0`。
* 全部用 `width: calc(...)` 之类的表达式反而会在收起时算不清最小宽度。
*/
var OjPaneGroup = defineComponent({
	name: "OjPaneGroup",
	props: {
		panes: {
			type: Array,
			required: true
		},
		orientation: {
			type: String,
			default: "vertical"
		},
		/** 分隔条的兜底可访问名；栏位自己给了 `label` 时优先用栏位的。 */
		label: {
			type: String,
			required: true
		}
	},
	emits: ["update:size"],
	setup(props, { emit, slots }) {
		/** 固定栏沿主轴的长度；可伸缩栏沿主轴的 `min` 仍然要生效，否则会被压到 0 无法操作。 */
		function paneStyle(pane) {
			const vertical = props.orientation === "vertical";
			const min = Number.isFinite(pane.min) ? Math.max(0, pane.min) : 0;
			if (pane.flexible === true) return vertical ? {
				flex: "1 1 0",
				minWidth: `${min}px`
			} : {
				flex: "1 1 0",
				minHeight: `${min}px`
			};
			const size = Number.isFinite(pane.size) ? Math.max(0, pane.size) : 0;
			return vertical ? {
				flex: "0 0 auto",
				width: `${size}px`
			} : {
				flex: "0 0 auto",
				height: `${size}px`
			};
		}
		return () => {
			const children = [];
			props.panes.forEach((pane, index) => {
				if (index > 0) {
					const splitter = paneSplitter(props.panes, index);
					const target = splitter === void 0 ? void 0 : props.panes.find((entry) => entry.id === splitter.controlled);
					if (splitter !== void 0 && target !== void 0) children.push(h(OjSplitter, {
						key: `splitter-${pane.id}`,
						size: target.size,
						min: target.min ?? 0,
						max: target.max ?? Number.POSITIVE_INFINITY,
						collapsible: target.collapsible === true,
						pane: splitter.side,
						orientation: props.orientation,
						label: target.label ?? props.label,
						"onUpdate:size": (size) => emit("update:size", target.id, size)
					}));
				}
				children.push(h("section", {
					key: pane.id,
					class: "oj-pane-group__pane",
					"data-pane": pane.id,
					"data-flexible": pane.flexible === true ? "" : void 0,
					"data-collapsed": pane.flexible !== true && pane.size === 0 ? "" : void 0,
					style: paneStyle(pane)
				}, slots[pane.id]?.()));
			});
			return h("div", {
				class: "oj-pane-group",
				"data-orientation": props.orientation
			}, children);
		};
	}
});
//#endregion
export { OjPaneGroup };
