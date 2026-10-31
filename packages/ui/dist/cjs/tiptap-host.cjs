//#region src/tiptap-host.ts
var BRIDGE = {
	"format.bold": {
		can: "toggleBold",
		run: "toggleBold",
		active: "bold"
	},
	"format.italic": {
		can: "toggleItalic",
		run: "toggleItalic",
		active: "italic"
	},
	"format.underline": {
		can: "toggleUnderline",
		run: "toggleUnderline",
		active: "underline"
	},
	"format.alignLeft": {
		can: "setTextAlign",
		run: "setTextAlign",
		active: { textAlign: "left" },
		arg: "left"
	},
	"format.fontFamily": {
		can: "setFontFamily",
		run: "setFontFamily",
		value: true
	},
	"format.fontSize": {
		can: "setFontSize",
		run: "setFontSize",
		value: true
	},
	"format.textColor": {
		can: "setColor",
		run: "setColor",
		value: true
	},
	"format.border": {
		can: "setBorder",
		run: "setBorder",
		value: true
	},
	"format.lineSpacing": {
		can: "setLineHeight",
		run: "setLineHeight",
		value: true,
		toArg: (arg) => String(arg)
	},
	"format.align": {
		can: "setTextAlign",
		run: "setTextAlign",
		value: true,
		toArg: (arg) => String(arg).trim().split(/\s+/)[0]
	},
	"format.heading": {
		can: "toggleHeading",
		run: "toggleHeading",
		active: "heading"
	},
	"format.blockquote": {
		can: "toggleBlockquote",
		run: "toggleBlockquote",
		active: "blockquote"
	},
	"format.bulletList": {
		can: "toggleBulletList",
		run: "toggleBulletList",
		active: "bulletList"
	},
	"format.orderedList": {
		can: "toggleOrderedList",
		run: "toggleOrderedList",
		active: "orderedList"
	},
	"format.codeBlock": {
		can: "toggleCodeBlock",
		run: "toggleCodeBlock",
		active: "codeBlock"
	},
	"insert.hardBreak": {
		can: "setHardBreak",
		run: "setHardBreak"
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
/** 桥里登记过的命令 id。用来证明它和 `editorCommands()` 没有漂移。 */
function bridgedCommandIds() {
	return Object.keys(BRIDGE);
}
/**
* 值型命令"能不能执行"的判据：方法在不在。
*
* 不用 `editor.can().setFontFamily()`：缺参调用时 Tiptap 返回 false，
* 于是"装了字体扩展但当前选区分不出值"会被读成"这个宿主没有这条命令"。
*/
function hasCommand(editor, name) {
	return typeof editor.commands[name] === "function";
}
function tiptapEditorHost(editor) {
	return {
		can(id) {
			const entry = BRIDGE[id];
			if (!entry) return false;
			if (entry.value === true) return hasCommand(editor, entry.can);
			return call(editor.can(), entry.can, entry.arg);
		},
		state(id) {
			const entry = BRIDGE[id];
			if (!entry) return { enabled: false };
			const enabled = entry.value === true ? hasCommand(editor, entry.can) : call(editor.can(), entry.can, entry.arg);
			if (!entry.active) return { enabled };
			return {
				enabled,
				active: editor.isActive(entry.active)
			};
		},
		exec(id, arg) {
			const entry = BRIDGE[id];
			if (!entry) return false;
			const actual = arg === void 0 ? entry.arg : entry.toArg === void 0 ? arg : entry.toArg(arg);
			return call(editor.commands, entry.run, actual);
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
exports.bridgedCommandIds = bridgedCommandIds;
exports.tiptapEditorHost = tiptapEditorHost;
