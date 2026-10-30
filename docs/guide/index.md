# 指南

office-ui 做的是**办公应用的外壳**：Ribbon、命令按钮、选择器、浮层与状态栏。文档引擎（ProseMirror / Tiptap / Univer）留在宿主那边，本库只提供命令桥。

## 三条必须知道的前提

1. **零运行时依赖**。发布包的 `dependencies` 恒为空；`vue` 是可选 peer。框架无关入口（`@jitoffice/ui`）里一处 `vue` 都没有，Node 与 jQuery 场景可以直接用。
2. **一份 CSS**。不按组件拆样式产物——按需引入之后组件不会"裸着"（[ADR-0003](https://github.com/jitOffice/office-ui/blob/main/docs/adr/0003-no-per-component-css.md)）。
3. **命令 id 是公开 API**。一旦发布不得改名：用户会把自定义 Ribbon 配置持久化下来。

## 接下来读什么

- [安装与引入](./install)：ESM / UMD / 无构建器三种路径，以及零依赖环境下的验证方式。
- [组件总览](../components/)：当前已交付的组件与它们各自压测的体系。
