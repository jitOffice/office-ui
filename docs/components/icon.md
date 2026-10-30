# OjIcon

办公图标：31 枚自绘 SVG，继承 `currentColor`，三种消费形态（Vue 组件 / sprite `<use>` / JS 常量）。

## 何时使用

- 命令按钮里的图标（配合 `OjCommandButton` 的 `icon`）。
- Ribbon 组的 large 档图标。

**不要**用它当布局占位或插图：它固定 `1em` 见方、只画单色线条。

## 基本用法

```ts
import { OjIcon } from '@jitoffice/ui/vue'

h(OjIcon, { name: 'oj-format-bold', label: '加粗' })
```

装饰性图标要显式声明，读屏才不会被念两遍：

```ts
h('button', { 'aria-label': '关闭' }, [h(OjIcon, { name: 'oj-close', decorative: true })])
```

## API

| Prop | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `name` | `string` | — | 图标 id，如 `oj-format-bold`（注册表见 `@jitoffice/icons`） |
| `size` | `number \| string` | `1em` | 数字按 px 处理 |
| `label` | `string` | — | 有语义时的可访问名，渲染 `role="img"` |
| `decorative` | `boolean` | `false` | 装饰性图标，渲染 `aria-hidden` |

## 无障碍

`label` 与 `decorative` **必须给一个**。两者都没有时开发模式会按图标名去重告警——"图标按钮没有可访问名"是办公界面最普遍的缺陷。

## 体积

单枚图标组件 tree-shaken 后 **836 B gzip**（阈值 1 KB，由 size-limit 守着）。31 枚顶层调用加了 `/* @__PURE__ */`，否则压缩器会把它们全留下——这是体积门禁上线第一轮就抓到的问题。

## CSS 变量

| 变量 | 说明 |
|---|---|
| `--oj-icon-size` | 默认尺寸（`size` 未给时） |
