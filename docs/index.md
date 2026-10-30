---
layout: home

hero:
  name: office-ui
  text: 面向 Office / WPS 场景的 Vue 3 组件库
  tagline: 零运行时依赖 · Ribbon 功能区 · 办公选择器 · 浮层底座 · 命令系统
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/
    - theme: alt
      text: 组件总览
      link: /components/

features:
  - title: 命令注册表是地基
    details: 一个命令 id 同时驱动按钮的 active/disabled、Tooltip 文案、快捷键与命令面板；两处渲染只重渲染一次。
  - title: 办公场景专属
    details: Ribbon 三档自动降级与 » 溢出、表格框选、标尺、右键菜单（canvas 坐标也能弹）、组启动器。
  - title: 内网可自托管
    details: 文档站与 Playground 不引 CDN、不引 Google Fonts、不引第三方搜索；构建产物有一条"零外联"断言守着。
  - title: 零运行时依赖
    details: 发布包的 dependencies 恒为空；重引擎只能作为 peerDependency，框架无关入口不 import vue。
---

## 五分钟上手

```bash
pnpm add @jitoffice/ui @jitoffice/tokens
```

```ts
import { createApp } from 'vue'
import { OjRibbon, OjRibbonGroup, OjToolbar } from '@jitoffice/ui/vue'
import '@jitoffice/tokens/dist/index.css'
import '@jitoffice/ui/style.css'

createApp({ components: { OjRibbon, OjRibbonGroup, OjToolbar } }).mount('#app')
```

样式只有**一份** CSS（[ADR-0003](https://github.com/jitOffice/office-ui/blob/main/docs/adr/0003-no-per-component-css.md)）：按需引入组件不会丢样式，也不会因为逐组件分包而重复。
