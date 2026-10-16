//#region src/commands.ts
var COMMAND_BOLD = "format.bold";
var COMMAND_HORIZONTAL_RULE = "insert.horizontalRule";
var COMMAND_TABLE = "insert.table";
function isTableSize(arg) {
	if (arg === null || typeof arg !== "object") return false;
	const row = arg.rows;
	const col = arg.cols;
	return typeof row === "number" && typeof col === "number" && Number.isInteger(row) && Number.isInteger(col) && row > 0 && col > 0;
}
function editorCommands() {
	return [
		{
			id: COMMAND_BOLD,
			label: { key: "oj.command.bold" },
			icon: "oj-format-bold",
			keys: "mod+b",
			group: "开始",
			history: "undoable",
			state: (host) => host.state(COMMAND_BOLD),
			run: (host) => {
				host.exec(COMMAND_BOLD);
			}
		},
		{
			id: COMMAND_HORIZONTAL_RULE,
			label: { key: "oj.command.horizontalRule" },
			icon: "oj-horizontal-rule",
			group: "插入",
			history: "undoable",
			state: (host) => host.state(COMMAND_HORIZONTAL_RULE),
			run: (host) => {
				host.exec(COMMAND_HORIZONTAL_RULE);
			}
		},
		{
			id: COMMAND_TABLE,
			label: { key: "oj.command.insertTable" },
			icon: "oj-insert-table",
			group: "插入",
			history: "undoable",
			state: (host) => host.state(COMMAND_TABLE),
			run: (host, arg) => {
				if (!isTableSize(arg)) throw new Error("insert.table 需要正整数 { rows, cols }");
				host.exec(COMMAND_TABLE, {
					rows: arg.rows,
					cols: arg.cols
				});
			}
		}
	];
}
/** 登记三条命令，返回一次性注销。 */
function registerEditorCommands(sink) {
	const offs = editorCommands().map((command) => sink.register(command));
	return () => {
		for (const off of offs) off();
	};
}
//#endregion
export { COMMAND_BOLD, COMMAND_HORIZONTAL_RULE, COMMAND_TABLE, editorCommands, isTableSize, registerEditorCommands };
