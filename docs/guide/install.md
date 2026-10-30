# 安装与引入

## ESM（推荐）

```bash
pnpm add @jitoffice/ui @jitoffice/tokens
```

```ts
import { OjCommandButton, OjRibbon } from '@jitoffice/ui/vue'
import '@jitoffice/tokens/dist/index.css'
import '@jitoffice/ui/style.css'
```

`@jitoffice/ui` 的根入口是**框架无关**的行为层（命令、表格框选、浮层定位、快捷键、菜单模型），
Vue 组件全部在 `@jitoffice/ui/vue` 子路径。根入口不 import `vue`，所以 `node --test` 能在没有
`node_modules` 的环境里直接跑它。

## 兼容线：两份 CSS 产物

```ts
// 现代浏览器（Chromium 99+）：把规则放进 @layer，压过宿主应用的选择器特异性
import '@jitoffice/ui/layered.css'
```

`@layer` 是 Chromium 99+ 才有的，而兼容线 floor 是 Chromium 86（ADR-0002），
所以 `style.css` 不带 `@layer`，它才是唯一形态；`layered.css` 是同一份规则的封装版，由宿主按目标环境二选一。

## 无构建器 / jQuery

```html
<link rel="stylesheet" href="/vendor/tokens/index.css" />
<link rel="stylesheet" href="/vendor/office-ui/office-ui.css" />
<script src="/vendor/vue.global.js"></script>
<script src="/vendor/office-ui/office-ui.js"></script>
<script>
  const { OjIcon, OjTooltip } = OfficeUI
</script>
```

两个必须注意的点：

- 必须用**含编译器的** Vue 全局构建（`vue.global.js`）。换成 runtime-only，`template` 字符串会静默白屏——这是 02 §4.1 的原始契约。
- 用 dev 构建调试：prod 构建会吞掉编译警告，而"控制台无编译缺失警告"正是我们要验的东西。
