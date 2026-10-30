//#region src/locales/ja-JP.ts
/**
* 日语。术语按 04 §6.5 的对照表（表 / コメント / 変更履歴 / インデント / 太字 / 塗りつぶし），
* 按钮用辞書形（敬体简体），标题用名词形。
*
* ⚠️ 本包译文按内部术语表直译产出，**上线前需日语母语者复核敬语与术语**（04 §6.6）。
* 机翻直接上线会直接损害"企业级"印象，这一条不是形式要求。
*/
var jaJP = {
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
			selectPlaceholder: "選択してください",
			language: "言語"
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
		},
		command: {
			bold: "太字",
			italic: "斜体",
			underline: "下線",
			alignLeft: "左揃え",
			heading: "見出し",
			blockquote: "引用",
			bulletList: "箇条書き",
			orderedList: "番号付きリスト",
			codeBlock: "コードブロック",
			hardBreak: "改行",
			horizontalRule: "水平線",
			insertTable: "表の挿入"
		},
		shell: {
			tabs: {
				start: "ホーム",
				insert: "挿入",
				view: "表示"
			},
			search: {
				find: "検索",
				replace: "置換後",
				next: "次へ",
				previous: "前へ",
				matchCase: "大文字と小文字を区別",
				count: "{current}/{total}",
				replaceAction: "置換",
				replaceAll: "すべて置換"
			},
			zoom: {
				zoomOut: "縮小",
				zoomIn: "拡大",
				reset: "100%"
			},
			files: {
				title: "ファイル",
				search: "ファイルを検索",
				empty: "一致するファイルがありません"
			},
			dialog: {
				insertTitle: "表の挿入",
				rows: "行",
				cols: "列"
			},
			paper: { untitled: "無題の文書" },
			watermark: {
				sample: "社外秘",
				toggle: "透かし"
			},
			ai: {
				title: "アシスタント",
				placeholder: "やりたいことを入力",
				send: "送信",
				notice: "モデルには接続していません。送信内容はこのページに残るだけです。"
			},
			signature: {
				clear: "クリア",
				open: "署名"
			},
			stamp: {
				sample: "印",
				open: "印鑑"
			},
			status: { kernel: "画像、リンク、本文の編集には文書カーネルが必要です。このリポジトリには含まれていません。" },
			insert: { image: "画像" }
		}
	} }
};
//#endregion
module.exports = jaJP;
