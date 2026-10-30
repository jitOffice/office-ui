# OjStatusBar

> 本页由 `docs/.vitepress/scripts/component-docs.ts` 扫描源码生成，**请勿手改**。
> 改组件后跑 `pnpm docs:gen`；忘记重跑会被 `pnpm lint:docs` 拦下。

- 源码：`packages/ui/src/vue/status-bar.ts`
- 样式块：`.oj-status-bar`

## Props

| Prop | 必填 | 默认值 |
|---|---|---|
| `page` | 否 | `undefined` |
| `words` | 否 | `undefined` |
| `language` | 否 | `undefined` |
| `zoom` | 否 | `undefined` |
| `collaborators` | 否 | `undefined` |
| `label` | 否 | `undefined` |

## CSS 变量

该组件没有直接引用 `--oj-*` 变量：样式继承自外层 block。

## 无障碍

- 纯图标控件必须声明意图：给 `label`（有语义）或 `decorative`（装饰性），两者皆无时开发模式告警。
- 菜单/浮层类组件关闭后**归还焦点**；菜单内上下键环绕并跳过禁用项。
