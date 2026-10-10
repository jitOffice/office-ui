//#region src/locales/zh-TW.ts
/**
* 繁体中文。术语按台式办公习惯（對話方塊、字型、載入、資料），
* 不是简体的逐字转换——逐字转换会把「软件/資訊/設定」这类分歧词写成简体用词。
*/
var zhTW = {
	name: "zh-TW",
	intl: "zh-TW",
	label: "繁體中文",
	tokenLang: "zh-TW",
	direction: "ltr",
	formats: {
		date: "YYYY年M月D日",
		time: "H時m分",
		dateTime: "YYYY年M月D日 H時m分",
		weekStartsOn: 0
	},
	messages: { oj: {
		common: {
			confirm: "確定",
			cancel: "取消",
			close: "關閉",
			clear: "清除",
			more: "更多",
			loading: "載入中",
			empty: "尚無資料",
			yes: "是",
			no: "否",
			inputPlaceholder: "請輸入",
			selectPlaceholder: "請選擇"
		},
		tableGridPicker: {
			label: "表格",
			size: "{rows} × {cols} 表格",
			insertDialog: "插入表格…",
			exceedMax: "超出 {max} 上限，請使用插入表格對話方塊",
			rows: "行數",
			cols: "列數"
		},
		ribbon: {
			collapse: "摺疊功能區",
			expand: "展開功能區",
			moreCommands: "其他命令",
			keyTipsHint: "按 {key} 顯示快速鍵提示",
			showAll: "固定功能區顯示"
		},
		colorPicker: {
			themeColors: "主題色彩",
			standardColors: "標準色彩",
			recent: "最近使用的色彩",
			custom: "自訂色彩",
			noColor: "無色彩",
			auto: "自動",
			moreColors: "其他顏色…",
			eyedropper: "取色器"
		},
		fontPicker: {
			recent: "最近使用的字型",
			all: "所有字型",
			chinese: "中文字型",
			latin: "西文字型",
			notInstalled: "未安裝",
			preview: "永字八法 AaBb"
		},
		validation: {
			required: "請填寫{label}",
			numberOnly: "請輸入數字",
			range: "請輸入 {min} 到 {max} 之間的值",
			maxLength: "最多 {max} 個字元",
			invalidColor: "顏色格式不正確"
		}
	} }
};
//#endregion
module.exports = zhTW;
