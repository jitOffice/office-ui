(function(global, factory) {
	typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory() : typeof define === "function" && define.amd ? define([], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, global.OfficeUILocaleEnUS = factory());
})(this, function() {
	//#endregion
	return {
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
				italic: "Italic",
				underline: "Underline",
				alignLeft: "Align left",
				heading: "Heading",
				blockquote: "Quote",
				bulletList: "Bulleted list",
				orderedList: "Numbered list",
				codeBlock: "Code block",
				hardBreak: "Line break",
				horizontalRule: "Horizontal line",
				insertTable: "Insert table"
			},
			shell: {
				tabs: {
					start: "Start",
					insert: "Insert",
					view: "View"
				},
				search: {
					find: "Find",
					replace: "Replace with",
					next: "Next",
					previous: "Previous",
					matchCase: "Match case",
					count: "{current}/{total}",
					replaceAction: "Replace",
					replaceAll: "Replace all"
				},
				zoom: {
					zoomOut: "Zoom out",
					zoomIn: "Zoom in",
					reset: "100%"
				},
				files: {
					title: "Files",
					search: "Search files",
					empty: "No matching files"
				},
				dialog: {
					insertTitle: "Insert table",
					rows: "Rows",
					cols: "Columns"
				},
				paper: { untitled: "Untitled document" },
				watermark: {
					sample: "Confidential",
					toggle: "Watermark"
				},
				ai: {
					title: "Assistant",
					placeholder: "Describe what you want",
					send: "Send",
					notice: "No model is connected. Messages stay on this page."
				},
				signature: {
					clear: "Clear",
					open: "Signature"
				},
				stamp: {
					sample: "Stamp",
					open: "Stamp"
				},
				status: { kernel: "Images, links, and body editing need a document kernel. This repository does not include one." },
				insert: { image: "Image" }
			}
		} }
	};
});
