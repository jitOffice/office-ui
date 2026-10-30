# 组件总览

当前 `@jitoffice/ui/vue` 已交付的组件按用途分组。每组都压测着一套不同的体系——不是"凑数量"。

## 命令与工具栏

| 组件 | 说明 |
|---|---|
| `OjRibbon` / `OjRibbonTab` / `OjRibbonGroup` | 选项卡 + 组 + 自动折叠；组内按 large/medium/small 三档降级，装不下收进 `»` |
| `OjToolbar` | 单行工具条，`menu` / `scroll` / `wrap` 三种溢出策略 |
| `OjCommandButton` | 从命令 id 渲染，自动同步 active / disabled / tooltip / 快捷键 |
| `OjToggleButton` / `OjSplitButton` / `OjDropdownButton` | 按下态、主操作与下拉分离、整块展开 |
| `OjCommandLauncher` | 组右下角入口，`aria-haspopup="dialog"` |
| `OjContextMenu` | 右键菜单，**可以只有坐标、没有 DOM 锚点**（canvas 场景） |
| `OjCommandPalette` / `OjHotkey` / `OjStatusBar` / `OjRibbonGallery` | 命令面板、快捷键、状态栏、网格陈列 |

## 浮层与底座

`OjPopper`（元素锚点或矩形锚点、翻转与夹取）、`OjPortal`（teleport / 层级 / 滚动锁 / 焦点陷阱）、`OjTrigger`（hover/click/focus/manual 组合）、`OjTooltip`、`OjDropdown`、`OjDialog`。

## 图标与选择器

`OjIcon`、`OjTableGridPicker`（10 × 20 上限，方向键 + Enter）、`OjZoomControl`。

## 文档外壳与其他

`OjRuler`、`OjSearchReplaceBar`、`OjFileTree`、`OjTabs`、`OjWatermark`、`OjStamp`、`OjSignaturePad`、`OjAiPanel`、`OjCodeBlock`。

## 完整 API 表

[API 索引](./api/) 下的每一页都由源码扫描生成：Props（含必填与默认值）、该组件引用的 `--oj-*` 变量、
用到的 `oj.*` 文案 key。**手写文档一定漏**，所以这部分不手写（04 §5）。

> 逐页的"何时使用 / 代码演示 / 无障碍细节"仍在补，先从 [OjIcon](./icon) 开始。
