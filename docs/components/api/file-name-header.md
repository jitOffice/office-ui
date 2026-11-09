# `<oj-file-name-header>`

> 本页由 `docs/.vitepress/scripts/component-docs.ts` 扫描源码生成，**请勿手改**。
> 改组件后跑 `pnpm docs:gen`；忘记重跑会被 `pnpm lint:docs` 拦下。

组件 `OjFileNameHeader` · 源码 `packages/ui/src/vue/file-name-header.ts` · 样式块 `.oj-file-name`

## 示例

<OjPlayground :code="example" :height="200" />

<script setup>
import { EXAMPLES } from '../../.vitepress/theme/examples.ts'
const example = EXAMPLES['OjFileNameHeader'] ?? ''
</script>

## Props

| Prop | 必填 | 默认值 |
|---|---|---|
| `name` | 是 | `—` |
| `state` | 否 | `saved` |
| `stateLabel` | 否 | `` |
| `renameLabel` | 是 | `—` |
| `favoriteLabel` | 是 | `—` |
| `favored` | 否 | `false` |
| `editable` | 否 | `true` |
| `problemLabels` | 否 | `—` |

## CSS 变量

该组件没有直接引用 `--oj-*` 变量：样式继承自外层 block。

## 无障碍

- 纯图标控件必须声明意图：给 `label`（有语义）或 `decorative`（装饰性），两者皆无时开发模式告警。
- 菜单/浮层类组件关闭后**归还焦点**；菜单内上下键环绕并跳过禁用项。
