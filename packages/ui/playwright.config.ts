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
  projects: [
    {
      name: 'chromium',
      use: {
        browserName: 'chromium',
        ...(channel === undefined || channel === '' ? {} : { channel }),
      },
    },
  ],
})
