import { OjIcon } from "./icon.js";
import { defineComponent, h } from "vue";
//#region src/vue/file-tree.ts
var OjFileTree = defineComponent({
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
			return h("li", {
				key: node.id,
				role: "none"
			}, [h("button", {
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
			}, [node.kind === "folder" ? h(OjIcon, {
				name: open ? "oj-chevron-down" : "oj-chevron-right",
				decorative: true
			}) : h(OjIcon, {
				name: "oj-file",
				decorative: true
			}), h("span", node.name)]), node.kind === "folder" && open && node.children ? h("ul", { role: "group" }, node.children.map((child) => renderNode(child, depth + 1))) : null]);
		}
		return () => {
			if (props.nodes.length === 0) return h("p", { class: "oj-files__empty" }, props.emptyLabel);
			return h("ul", {
				class: "oj-files",
				role: "tree"
			}, props.nodes.map((node) => renderNode(node, 0)));
		};
	}
});
//#endregion
export { OjFileTree };
