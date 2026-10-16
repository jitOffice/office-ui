//#region src/locales/zh-CN.ts
/**
* 简体中文（源语言）。其余三语必须以本文件为基准对齐 key 与占位符，
* 构建期由 `scripts/diff-locales.ts` 强制校验（04 §6.2 规则 3）。
*/
var zhCN = {
	name: "zh-CN",
	intl: "zh-CN",
	label: "简体中文",
	tokenLang: "zh",
	direction: "ltr",
	formats: {
		date: "YYYY年M月D日",
		time: "H时m分",
		dateTime: "YYYY年M月D日 H时m分",
		weekStartsOn: 1
	},
	messages: { oj: {
		common: {
			confirm: "确定",
			cancel: "取消",
			close: "关闭",
			clear: "清除",
			more: "更多",
			loading: "加载中",
			empty: "暂无数据",
			yes: "是",
			no: "否",
			inputPlaceholder: "请输入",
			selectPlaceholder: "请选择"
		},
		tableGridPicker: {
			label: "表格",
			size: "{rows} × {cols} 表格",
			insertDialog: "插入表格…",
			exceedMax: "超出 {max} 上限，请使用插入表格对话框",
			rows: "行数",
			cols: "列数"
		},
		ribbon: {
			collapse: "折叠功能区",
			expand: "展开功能区",
			moreCommands: "更多命令",
			keyTipsHint: "按 {key} 显示快捷键提示",
			showAll: "固定功能区显示"
		},
		colorPicker: {
			themeColors: "主题颜色",
			standardColors: "标准色",
			recent: "最近使用的颜色",
			custom: "自定义颜色",
			noColor: "无颜色",
			auto: "自动",
			moreColors: "其他颜色…",
			eyedropper: "取色器"
		},
		fontPicker: {
			recent: "最近使用的字体",
			all: "全部字体",
			chinese: "中文字体",
			latin: "西文字体",
			notInstalled: "未安装",
			preview: "永字八法 AaBb"
		},
		validation: {
			required: "请填写{label}",
			numberOnly: "请输入数字",
			range: "请输入 {min} 到 {max} 之间的值",
			maxLength: "最多 {max} 个字符",
			invalidColor: "颜色格式不正确"
		},
		command: {
			bold: "加粗",
			horizontalRule: "分隔线",
			insertTable: "插入表格"
		}
	} }
};
//#endregion
module.exports = zhCN;
