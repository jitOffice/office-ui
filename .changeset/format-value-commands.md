---
'@jitoffice/ui': minor
'@jitoffice/i18n': minor
---

新增六条**值型格式命令**，把 M2 的选择器集群接到命令注册表上：
`format.fontFamily` / `format.fontSize` / `format.textColor` / `format.border` / `format.lineSpacing` / `format.align`。

- `run(id, value)` 的实参先过 `src/format.ts` 归一化，**交给宿主的实参与 `state(id).value` 是同一个值**。
  边框就是 `borderCss()` 的 CSS 简写（与 `OjBorderPicker` 的预览同一个函数），对齐编码成 `"center middle"`
  （用 `parseAlignValue()` 读回）。非法实参直接抛错，`registry.run()` 的结果里能定位。
- 值型命令报 `value`、布尔命令报 `active`：`createMemoryEditor()` 也只对"实参不是字符串/数字"的命令翻 `active`，
  否则"把字号设成 16"会让字号控件显示成被选中。
- Tiptap 桥新增六条映射；值型命令的可用性只看方法在不在（缺参调 `can()` 会把"装了扩展但选区分不出值"
  读成"没有这条命令"），`format.align` 只把水平方向透给 `setTextAlign`。
- 四种语言的 `oj.command.*`、`oj.border.*`、`oj.align.*` 文案一并补上（新增 9 个 key × 4 语）；
  demo 的功能区新增格式组，字体/字号/颜色/边框/行距/对齐改完即时作用到文档区。

升级方式：纯新增命令与文案，既有命令与 `OjEditorHost` 契约不变。
