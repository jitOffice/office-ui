/**
 * Playground 的本地运行时（04 §3）。
 *
 * 沙箱 iframe 里没有任何打包器，也不访问 CDN，所以它需要的东西必须**提前摆在本站静态目录里**：
 *   1. Vue 的**全局构建**（含编译器——demo 用 `template` 字符串，runtime-only 会静默白屏）；
 *   2. `office-ui.js` 的 UMD 产物（`vue` 已外部化成全局，与无构建器示例同一条路）；
 *   3. 两份 CSS（tokens + 组件样式），否则 iframe 里的组件是裸的。
 *
 * 为什么不是 ESM + import map：`sandbox="allow-scripts"` 下 iframe 的 origin 是 `null`，
 * 模块请求带 `Origin: null`，静态服务器不会回 CORS 头 → 全部 `net::ERR_FAILED`。
 * 真浏览器里实测过（见 examples/playground-frame/index.html 的注释）。
 *
 * 产物放 `docs/public/playground/`（**不入库**，构建前生成），因此这里不做 `--check`。
 */

import { copyFileSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(here, '..', '..', '..')
const publicDir = join(repoRoot, 'docs', 'public', 'playground')

function must(path: string): string {
  if (!existsSync(path)) {
    console.error(`[playground] 缺少 ${path}，先跑 \`pnpm -r build\``)
    process.exit(1)
  }
  return path
}

const vueGlobal = join(repoRoot, 'packages', 'ui', 'node_modules', 'vue', 'dist', 'vue.global.js')
const uiUmd = join(repoRoot, 'packages', 'ui', 'dist', 'umd', 'office-ui.js')
const tokensCss = join(repoRoot, 'packages', 'tokens', 'dist', 'index.css')
const uiCss = join(repoRoot, 'packages', 'ui', 'dist', 'styles', 'office-ui.css')

rmSync(publicDir, { recursive: true, force: true })
mkdirSync(join(publicDir, 'vendor'), { recursive: true })

// 经典脚本（非 module）：`sandbox="allow-scripts"` 下 iframe 的 origin 是 `null`，
// ESM 请求会被 CORS 拦死（见 examples/playground-frame/index.html 里的实测说明）。
copyFileSync(must(vueGlobal), join(publicDir, 'vendor', 'vue.global.js'))
copyFileSync(must(uiUmd), join(publicDir, 'office-ui.js'))
copyFileSync(must(tokensCss), join(publicDir, 'tokens.css'))
copyFileSync(must(uiCss), join(publicDir, 'office-ui.css'))

// 沙箱页的**源文件**放在 examples/（和 no-bundler 示例同一个位置），构建时才复制进来：
// `docs/public/playground/` 整个目录由本脚本独占，避免"手写文件被 rmSync 清掉"这种事故。
mkdirSync(join(publicDir, 'frame'), { recursive: true })
copyFileSync(
  must(join(repoRoot, 'examples', 'playground-frame', 'index.html')),
  join(publicDir, 'frame', 'index.html'),
)

console.log('[playground] 已就绪 · docs/public/playground/{vendor/vue.js, ui/**, *.css}')
