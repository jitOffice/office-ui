import { defineConfig } from '@playwright/test'

/**
 * 只管 `test/visual/`：零依赖的 `*.test.ts` 由 `node --test` 跑（与另两个包同一条规矩）。
 *
 * 不起 dev server：被测对象是 `dist/sprite.svg` 这个静态产物，
 * 注入到 `setContent` 的空页里就是无构建器用户真实的用法。
 *
 * `OJ_BROWSER_CHANNEL` 与 `tokens` / `ui` 同义：给拉不到 `cdn.playwright.dev` 的机器留的口子。
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
