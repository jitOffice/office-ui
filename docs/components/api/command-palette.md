# OjCommandPalette

> 本页由 `docs/.vitepress/scripts/component-docs.ts` 扫描源码生成，**请勿手改**。
> 改组件后跑 `pnpm docs:gen`；忘记重跑会被 `pnpm lint:docs` 拦下。

- 源码：`packages/ui/src/vue/command-palette.ts`
- 样式块：`.oj-palette`

## Props

| Prop | 必填 | 默认值 |
|---|---|---|
| `open` | 是 | `—` |
| `items` | 是 | `—` |
| `query` | 否 | `undefined` |
| `label` | 否 | `命令面板` |
| `placeholder` | 否 | `搜索命令` |
| `emptyLabel` | 否 | `没有匹配的命令` |

## CSS 变量

| 变量 |
|---|
| `--oj-z-modal` |

## 无障碍

- 纯图标控件必须声明意图：给 `label`（有语义）或 `decorative`（装饰性），两者皆无时开发模式告警。
- 菜单/浮层类组件关闭后**归还焦点**；菜单内上下键环绕并跳过禁用项。
