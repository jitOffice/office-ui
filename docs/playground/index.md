# Playground

沙箱里跑的是**真的** `@jitoffice/ui/vue` 与真的 tokens：iframe 只给 `allow-scripts`，
拿不到宿主的 DOM / localStorage / cookie，所以这里的代码可以随便改坏。

```js
{
  template: `<div style="display:flex;gap:8px">
    <button class="oj-button" data-size="mini">加粗</button>
    <button class="oj-button" data-size="mini" data-active>斜体</button>
  </div>`
}
```

<OjPlayground
  :code="demo"
  :height="200"
/>

## 这一版还没做的

- **多文件 SFC**：当前 demo 是组件选项对象（`template` + `setup`），不是 `.vue` 文件。
  PRD 里选的 `@vue/compiler-sfc` 浏览器端编译排在下一轮——它约 100 KB gzip，只在 Playground 页加载。
- **编辑器**：先用 `<textarea>`。CodeMirror 6 的高亮与补全是体验层的下一步。
- **在示例中打开**：组件页的每个示例右上角都应有一个按钮把代码灌进来，需要先把示例抽成独立文件。

## 一条实测出来的约束

沙箱 iframe 只给 `allow-scripts`（不给 `allow-same-origin`），因此它的 origin 是 `null`。
**代价是 ESM 与 import map 用不了**：模块请求变成 `Origin: null` 的 CORS 请求，
静态服务器不会回 `Access-Control-Allow-Origin`，`vendor/vue.js` 与 `ui/vue/index.js` 全部 `ERR_FAILED`，白屏。

两条出路里我们选了第二条：

| 方案 | 结果 |
|---|---|
| 加 `allow-same-origin` | 用户代码能读宿主 DOM 与 localStorage——沙箱等于没有 |
| **改用经典脚本（UMD 全局构建）** | 不受 CORS 约束，纯静态托管即可；与 02 §4.1「无构建器必须用含编译器的全局构建」同形 |

所以这个 Playground 走的是 `vue.global.js` + `office-ui.js` UMD。多文件 SFC 编译要走宿主侧预编译（B 计划），
不是"再配一下 import map"就能解决的。

<script setup>
const demo = `{
  setup() {
    const bold = Vue.ref(true)
    return { bold }
  },
  template: \`
    <div style="display:flex;flex-direction:column;gap:12px">
      <div style="display:flex;gap:8px">
        <button class="oj-button" data-size="mini" :data-active="bold ? '' : undefined"
                @click="bold = !bold">加粗</button>
        <button class="oj-button" data-size="mini">斜体</button>
      </div>
      <p>当前加粗：{{ bold ? '开' : '关' }}</p>
    </div>
  \`
}`
</script>
