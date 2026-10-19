const require_icon = require("./icon.cjs");
let vue = require("vue");
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
			}, [node.kind === "folder" ? (0, vue.h)(require_icon.OjIcon, { name: open ? "oj-chevron-down" : "oj-chevron-right" }) : (0, vue.h)(require_icon.OjIcon, { name: "oj-file" }), (0, vue.h)("span", node.name)]), node.kind === "folder" && open && node.children ? (0, vue.h)("ul", { role: "group" }, node.children.map((child) => renderNode(child, depth + 1))) : null]);
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
exports.OjFileTree = OjFileTree;
