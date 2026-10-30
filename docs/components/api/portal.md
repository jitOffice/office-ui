# OjPortal

> 本页由 `docs/.vitepress/scripts/component-docs.ts` 扫描源码生成，**请勿手改**。
> 改组件后跑 `pnpm docs:gen`；忘记重跑会被 `pnpm lint:docs` 拦下。

- 源码：`packages/ui/src/vue/portal.ts`
- 样式块：`.oj-portal`

## Props

| Prop | 必填 | 默认值 |
|---|---|---|
| `to` | 否 | `body` |
| `zIndex` | 否 | `var(--oj-z-popover)` |
| `lockScroll` | 否 | `false` |
| `trapFocus` | 否 | `false` |

## CSS 变量

| 变量 |
|---|
| `--oj-z-popover` |

## 无障碍

- 纯图标控件必须声明意图：给 `label`（有语义）或 `decorative`（装饰性），两者皆无时开发模式告警。
- 菜单/浮层类组件关闭后**归还焦点**；菜单内上下键环绕并跳过禁用项。
