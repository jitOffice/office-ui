import { defineConfig } from 'vitepress'

import { componentPages } from './generated/components.ts'

/**
 * 文档站配置（04 §1、§4）。
 *
 * 一条硬约束贯穿这里：**完全断网的内网也要能跑**。所以没有社交链接、没有编辑链接、
 * 没有 Google Fonts、没有 Algolia——主题从 `vitepress/theme-without-fonts` 继承（默认主题
 * 的 fonts.css 里有一条 `@import url('https://fonts.googleapis.com/…')`，在内网会静默挂住首屏），
 * 字体走系统字体栈。`internal/scripts/check-docs-offline.ts` 会对构建产物做机器校验。
 *
 * `srcExclude: ['adr/**']`：ADR 与 PRD 是仓库内的治理文档，里面有大量指向 `prd/` 的相对链接，
 * 放进站点会让 VitePress 的死链检查直接失败。它们留在仓库里，不参与站点构建。
 */
export default defineConfig({
  lang: 'zh-CN',
  title: 'office-ui',
  description: '面向 Office / WPS 场景的 Vue 3 组件库：零运行时依赖，Ribbon、选择器、浮层与命令系统',
  cleanUrls: true,
  srcExclude: ['adr/**'],
  // 与 PRD 约定的路径一致（`docs/dist`），离线断言脚本按这个目录扫
  outDir: 'dist',
  head: [
    ['meta', { name: 'color-scheme', content: 'light' }],
    // 本地 SVG 图标，不引外部 CDN；不写这条时浏览器会去要 `/favicon.ico`，
    // 每次访问在控制台留一条 404（真浏览器实测，见 05 第十三轮）
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
  ],
  themeConfig: {
    nav: [
      { text: '指南', link: '/guide/' },
      { text: '组件', link: '/components/' },
      { text: 'Playground', link: '/playground/' },
    ],
    sidebar: {
      '/guide/': [
        {
          text: '指南',
          items: [
            { text: '概览', link: '/guide/' },
            { text: '安装与引入', link: '/guide/install' },
          ],
        },
      ],
      '/components/': [
        {
          text: '组件',
          items: [
            { text: '总览', link: '/components/' },
            { text: 'OjIcon', link: '/components/icon' },
            { text: 'API 索引', link: '/components/api/' },
          ],
        },
        {
          text: 'API（源码扫描生成）',
          collapsed: true,
          items: [...componentPages],
        },
      ],
    },
    outline: { level: [2, 3], label: '本页目录' },
    docFooter: { prev: '上一页', next: '下一页' },
    darkModeSwitchLabel: '主题',
    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '目录',
    lastUpdated: { text: '最后更新于' },
    /**
     * 这里**故意没有** `search` 配置——搜索由自建组件接管（04 §4）：
     *   - 构建期 `scripts/build-search-index.ts` 用 `search/tokenize.ts` 的 bigram 分词器建索引
     *     （`docs/public/search/index.json`，入库 + `pnpm lint:docs` 守新鲜度）；
     *   - 运行时 `theme/components/OjSearch.vue` 懒加载 `minisearch` 与索引，`Ctrl+K` / `/` 唤起。
     *
     * 为什么不配 `provider: 'local'`：VitePress 会把 `themeConfig` 序列化成 JSON 塞进客户端，
     * `options.tokenize` 这类函数在序列化时被丢掉——构建能过、词法却还是默认的按空格切
     * （实测：对产物 grep `NFKC` / `tokenize:` 一处都没有）。不配 provider 还有个好处：
     * 不生成那份用不上的内置索引 chunk，也不生成 `VPLocalSearchBox`。
     *
     * 代价是 `VPNavBarSearch` 会渲染成一个空容器——`styles/search.css` 把它隐藏，
     * 自建按钮从 `Layout.vue` 的 `nav-bar-content-before` 插槽进来。
     */
  },
})
