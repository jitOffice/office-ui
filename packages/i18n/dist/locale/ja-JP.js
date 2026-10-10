(function(global, factory) {
	typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory() : typeof define === "function" && define.amd ? define([], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, global.OfficeUILocaleJaJP = factory());
})(this, function() {
	//#endregion
	return {
		name: "ja-JP",
		intl: "ja-JP",
		label: "日本語",
		tokenLang: "ja",
		direction: "ltr",
		formats: {
			date: "YYYY年M月D日",
			time: "H時m分",
			dateTime: "YYYY年M月D日 H時m分",
			weekStartsOn: 1
		},
		messages: { oj: {
			common: {
				confirm: "確定",
				cancel: "キャンセル",
				close: "閉じる",
				clear: "クリア",
				more: "その他",
				loading: "読み込み中",
				empty: "データがありません",
				yes: "はい",
				no: "いいえ",
				inputPlaceholder: "入力してください",
				selectPlaceholder: "選択してください"
			},
			tableGridPicker: {
				label: "表",
				size: "{rows} × {cols} の表",
				insertDialog: "表の挿入",
				exceedMax: "上限の {max} を超えています。［表の挿入］ダイアログを使用してください",
				rows: "行数",
				cols: "列数"
			},
			ribbon: {
				collapse: "リボンを折りたたむ",
				expand: "リボンを展開する",
				moreCommands: "その他のコマンド",
				keyTipsHint: "{key} キーでキーヒントを表示",
				showAll: "リボンを常に表示"
			},
			colorPicker: {
				themeColors: "テーマの色",
				standardColors: "標準色",
				recent: "最近使った色",
				custom: "ユーザー設定の色",
				noColor: "色なし",
				auto: "自動",
				moreColors: "その他の色…",
				eyedropper: "画面から色を選ぶ"
			},
			fontPicker: {
				recent: "最近使ったフォント",
				all: "すべてのフォント",
				chinese: "中国語フォント",
				latin: "欧文フォント",
				notInstalled: "未インストール",
				preview: "あいうえお AaBb"
			},
			validation: {
				required: "{label}を入力してください",
				numberOnly: "数字を入力してください",
				range: "{min} から {max} の範囲で入力してください",
				maxLength: "最大 {max} 文字です",
				invalidColor: "色の形式が正しくありません"
			}
		} }
	};
});
