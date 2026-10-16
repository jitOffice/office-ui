//#region src/tiptap-host.ts
var BRIDGE = {
	"format.bold": {
		can: "toggleBold",
		run: "toggleBold",
		active: "bold"
	},
	"insert.horizontalRule": {
		can: "setHorizontalRule",
		run: "setHorizontalRule"
	},
	"insert.table": {
		can: "insertTable",
		run: "insertTable"
	}
};
function call(table, name, arg) {
	const fn = table[name];
	if (typeof fn !== "function") return false;
	return fn(arg) !== false;
}
function tiptapEditorHost(editor) {
	return {
		can(id) {
			const entry = BRIDGE[id];
			if (!entry) return false;
			return call(editor.can(), entry.can);
		},
		state(id) {
			const entry = BRIDGE[id];
			if (!entry) return { enabled: false };
			const enabled = call(editor.can(), entry.can);
			if (!entry.active) return { enabled };
			return {
				enabled,
				active: editor.isActive(entry.active)
			};
		},
		exec(id, arg) {
			const entry = BRIDGE[id];
			if (!entry) return false;
			return call(editor.commands, entry.run, arg);
		},
		subscribe(listener) {
			editor.on("transaction", listener);
			editor.on("selectionUpdate", listener);
			return () => {
				editor.off("transaction", listener);
				editor.off("selectionUpdate", listener);
			};
		}
	};
}
//#endregion
exports.tiptapEditorHost = tiptapEditorHost;
