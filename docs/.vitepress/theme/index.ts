import DefaultTheme from 'vitepress/theme-without-fonts'

// 文档站是组件库的**第一个真实消费者**（04 §2）：样式只用自家产物，不写第二套色值。
// 从 dist 引而不是从 src 引，是为了让"产出的 CSS 够不够用"在这里先暴露一次。
import '../../../packages/tokens/dist/index.css'
import '../../../packages/ui/dist/styles/office-ui.css'
import './styles/glass.css'
import './styles/search.css'
import Layout from './Layout.vue'
import OjPlayground from './components/OjPlayground.vue'

export default {
  extends: DefaultTheme,
  // 搜索通过 Layout 插槽接管（见 Layout.vue 的注释：内置 `VPNavBarSearch` 是直接 import 的，
  // 全局同名注册覆盖不了它）
  Layout,
  enhanceApp({ app }) {
    app.component('OjPlayground', OjPlayground)
  },
}
