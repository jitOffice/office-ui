<script setup lang="ts">
/**
 * 布局入口（04 §4）。
 *
 * 为什么要包一层：VitePress 的内置搜索 `VPNavBarSearch` 是 `VPNavBar.vue` **直接 import**
 * 的私有组件，`app.component('VPNavBarSearch', …)` 覆盖不了它（那是全局注册的机制，
 * 对直接 import 无效）。唯一不侵入内置组件的接法就是 Layout 插槽：
 * `nav-bar-content-before` 在 `VPNavBarSearch` 之前、`justify-content: flex-end` 的同一行里，
 * 位置正好是内置搜索原本所在的地方。
 *
 * 配套的两步在别处：`config.ts` 撤掉 `themeConfig.search`（不生成内置索引与
 * `VPLocalSearchBox` chunk），`styles/search.css` 把残留的空搜索容器 `display:none`。
 */
import DefaultTheme from 'vitepress/theme-without-fonts'

import OjSearch from './components/OjSearch.vue'

const { Layout } = DefaultTheme
</script>

<template>
  <Layout>
    <template #nav-bar-content-before>
      <OjSearch />
    </template>
  </Layout>
</template>
