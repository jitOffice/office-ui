//#region src/locales/en-US.ts
/**
* 英语。`tokenLang` 是 `'zh'` 而不是新增一档：tokens 的基底栈（Inter → system-ui → 中文栈）
* 对纯拉丁文本本就命中前两个族，字号/行高/字距也与基底一致，所以 `en` 不是 token 维度（01 §7）。
* 这一档真正代表的不是"中文"，而是"没有覆写"。
*/
var enUS = {
	name: "en-US",
	intl: "en-US",
	label: "English",
	tokenLang: "zh",
	direction: "ltr",
	formats: {
		date: "MMM D, YYYY",
		time: "h:mm A",
		dateTime: "MMM D, YYYY, h:mm A",
		weekStartsOn: 0
	},
	messages: { oj: {
		common: {
			confirm: "OK",
			cancel: "Cancel",
			close: "Close",
			clear: "Clear",
			more: "More",
			loading: "Loading…",
			empty: "No data",
			yes: "Yes",
			no: "No",
			inputPlaceholder: "Enter a value",
			selectPlaceholder: "Select…"
		},
		tableGridPicker: {
			label: "Table",
			size: "{rows} × {cols} table",
			insertDialog: "Insert Table…",
			exceedMax: "Exceeds the {max}-cell limit. Use the Insert Table dialog.",
			rows: "Rows",
			cols: "Columns"
		},
		ribbon: {
			collapse: "Collapse the ribbon",
			expand: "Expand the ribbon",
			moreCommands: "More commands",
			keyTipsHint: "Press {key} to show key tips",
			showAll: "Always show the ribbon"
		},
		colorPicker: {
			themeColors: "Theme colors",
			standardColors: "Standard colors",
			recent: "Recent colors",
			custom: "Custom colors",
			noColor: "No color",
			auto: "Automatic",
			moreColors: "More colors…",
			eyedropper: "Eyedropper"
		},
		fontPicker: {
			recent: "Recent fonts",
			all: "All fonts",
			chinese: "Chinese fonts",
			latin: "Latin fonts",
			notInstalled: "Not installed",
			preview: "AaBbCc DdEeFf"
		},
		validation: {
			required: "{label} is required",
			numberOnly: "Enter a number",
			range: "Enter a value between {min} and {max}",
			maxLength: "{max, plural, one {Up to # character} other {Up to # characters}}",
			invalidColor: "Invalid color format"
		},
		command: {
			bold: "Bold",
			horizontalRule: "Horizontal line",
			insertTable: "Insert table"
		}
	} }
};
//#endregion
export { enUS as default };
