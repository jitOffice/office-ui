import type { OjLocale } from '../types.ts'

/**
 * 繁体中文。术语按台式办公习惯（對話方塊、字型、載入、資料），
 * 不是简体的逐字转换——逐字转换会把「软件/資訊/設定」这类分歧词写成简体用词。
 */
const zhTW: OjLocale = {
  name: 'zh-TW',
  intl: 'zh-TW',
  label: '繁體中文',
  tokenLang: 'zh-TW',
  direction: 'ltr',
  formats: {
    date: 'YYYY年M月D日',
    time: 'H時m分',
    dateTime: 'YYYY年M月D日 H時m分',
    // 台湾印刷历以周日起算，与大陆的 GB/T 周一不同；这条差异属于区域习惯，不是笔误。
    weekStartsOn: 0,
  },
  messages: {
    oj: {
      common: {
        confirm: '確定',
        cancel: '取消',
        close: '關閉',
        clear: '清除',
        more: '更多',
        loading: '載入中',
        empty: '尚無資料',
        yes: '是',
        no: '否',
        inputPlaceholder: '請輸入',
        selectPlaceholder: '請選擇',
        language: '語言',
      },
      tableGridPicker: {
        label: '表格',
        size: '{rows} × {cols} 表格',
        insertDialog: '插入表格…',
        exceedMax: '超出 {max} 上限，請使用插入表格對話方塊',
        rows: '行數',
        cols: '列數',
      },
      ribbon: {
        collapse: '摺疊功能區',
        expand: '展開功能區',
        moreCommands: '其他命令',
        keyTipsHint: '按 {key} 顯示快速鍵提示',
        showAll: '固定功能區顯示',
      },
      colorPicker: {
        themeColors: '主題色彩',
        standardColors: '標準色彩',
        recent: '最近使用的色彩',
        custom: '自訂色彩',
        noColor: '無色彩',
        auto: '自動',
        moreColors: '其他顏色…',
        eyedropper: '取色器',
      },
      fontPicker: {
        recent: '最近使用的字型',
        all: '所有字型',
        chinese: '中文字型',
        latin: '西文字型',
        notInstalled: '未安裝',
        preview: '永字八法 AaBb',
      },
      validation: {
        required: '請填寫{label}',
        numberOnly: '請輸入數字',
        range: '請輸入 {min} 到 {max} 之間的值',
        maxLength: '最多 {max} 個字元',
        invalidColor: '顏色格式不正確',
      },
      command: {
        bold: '粗體',
        italic: '斜體',
        underline: '底線',
        alignLeft: '靠左對齊',
        heading: '標題',
        blockquote: '引用',
        bulletList: '項目符號',
        orderedList: '編號清單',
        codeBlock: '程式碼區塊',
        hardBreak: '換行',
        horizontalRule: '分隔線',
        insertTable: '插入表格',
      },
      shell: {
        tabs: { start: '開始', insert: '插入', view: '檢視' },
        search: {
          find: '尋找',
          replace: '取代為',
          next: '下一個',
          previous: '上一個',
          matchCase: '區分大小寫',
          count: '{current}/{total}',
          replaceAction: '取代',
          replaceAll: '全部取代',
        },
        zoom: { zoomOut: '縮小', zoomIn: '放大', reset: '100%' },
        files: { title: '檔案', search: '搜尋檔案', empty: '沒有相符的檔案' },
        dialog: { insertTitle: '插入表格', rows: '列數', cols: '欄數' },
        paper: { untitled: '未命名文件' },
        watermark: { sample: '內部資料', toggle: '浮水印' },
        ai: {
          title: '助手',
          placeholder: '描述你想做的事',
          send: '傳送',
          notice: '尚未連接模型。傳送的內容只留在這一頁。',
        },
        signature: { clear: '清除', open: '簽名' },
        stamp: { sample: '印', open: '印章' },
        status: { kernel: '圖片、連結和正文編輯需要文件核心，目前的倉庫不包含它。' },
        insert: { image: '圖片' },
      },
    },
  },
}

export default zhTW
