import { defineConfig } from '@playwright/test'

/**
 * 只管 `test/visual/`：零依赖的 `*.test.ts` 由 `node --test` 跑，两条线不共用一个 runner。
 * 这里刻意不起 dev server——被测对象是 `dist/index.css` 这个静态产物，
 * `about:blank` + addStyleTag 就是最小可复现环境，也最接近用户 `file://` 直连产物的用法。
 */

/**
 * `cdn.playwright.dev` 在离线/内网环境拉不到二进制，但被测的是排版引擎的行为，
 * 本机已装的 Chromium 内核浏览器就能跑同一批断言，所以留这个环境变量口子：
 * `OJ_BROWSER_CHANNEL=chrome pnpm --filter @jitoffice/tokens test:visual`（`msedge` 同理）。
 * 只在内核版本 ≥ ADR-0002 基线时用——低版本上跑出来的降级行为正是我们要防的，
 * 那不是"测试通过"，是"结论换了一个"。CI 不设这个变量，走默认项目。
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
