import { defineConfig } from '@playwright/test'

/**
 * 只管 `test/visual/`：零依赖的 `*.test.ts` 由 `node --test` 跑，两条线不共用一个 runner
 * （与 `packages/tokens` 同一条规矩，理由也一样）。
 *
 * 这里不起 dev server：被测对象是**两个静态产物**——`examples/no-bundler/index.html` 与
 * `dist/umd/office-ui.js`。用 `file://` 直连就是无构建器用户真实的打开方式，
 * 起个 vite 反而会把"没有构建器"这个前提弄丢。
 *
 * `OJ_BROWSER_CHANNEL` 是给拉不到 `cdn.playwright.dev` 的机器留的口子（内网/离线）：
 *   OJ_BROWSER_CHANNEL=chrome pnpm --filter @jitoffice/ui test:visual
 * CI 不设它，走默认项目；否则测的是 runner 上碰巧装了什么浏览器。
 */
const channel = process.env['OJ_BROWSER_CHANNEL']

export default defineConfig({
  testDir: './test/visual',
  fullyParallel: false,
  reporter: [['list']],
  // 截图基线是按**平台**存的（Playwright 自动加 `-darwin` / `-linux` 后缀，字体渲染不同不能共用）。
  // `'missing'` = 当前平台没有基线时写一份并放行，有基线时照常逐像素比对。
  // 必须在配置里，不能在用例里 `if`：`--update-snapshots` 会覆盖所有用例，
  // 而"这次跑到底是在核对还是在写基线"恰好是最容易自欺的一句话。
  updateSnapshots: 'missing',
  projects: [
    {
      name: 'chromium',
      use: {
        browserName: 'chromium',
        // 视口写死：元素截图虽然只截元素，但媒体查询、滚动条策略、字体回退都跟视口有关
        viewport: { width: 800, height: 900 },
        deviceScaleFactor: 1,
        ...(channel === undefined || channel === '' ? {} : { channel }),
      },
    },
  ],
})
