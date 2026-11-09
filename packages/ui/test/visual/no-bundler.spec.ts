import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * 05 §2 DoD #1：一个**纯静态 HTML**（无构建器）用 `<script src>` 引全局 `Vue` + UMD 产物，
 * 渲染出带 tooltip 的图标按钮，且控制台无编译缺失警告。
 *
 * 这条用例存在的原因很具体：UMD 产物"生成成功"与"真能在无构建器页面跑"是两件事。
 * 前者构建日志会告诉你，后者只有真的打开一次才知道——而在浏览器里打开之前，
 * `dist/umd` 里有没有 Vue 运行时、CSS 有没有丢、`template` 有没有因为缺编译器而白屏，
 * 全都是不可见的。
 */

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(here, '../../../..')
const page = `file://${join(repoRoot, 'examples/no-bundler/index.html')}`

test('无构建器页面：UMD 渲染、两份 CSS 生效、tooltip 可键盘唤出、控制台零告警', async ({ page: browser }) => {
  const messages: string[] = []
  browser.on('console', (m) => messages.push(`${m.type()}: ${m.text()}`))
  browser.on('pageerror', (e) => messages.push(`pageerror: ${e.message}`))

  await browser.goto(page)
  await browser.waitForSelector('[data-testid="bold"]')

  // 1. UMD 真把组件挂上了（不是空白页）
  await expect(browser.locator('[data-testid="bold"] svg').first()).toBeVisible()

  // 2. 两份 CSS 都生效。
  //    不能拿背景色判断：`--oj-button-bg` 的值本来就是 transparent，那是个永远为真的探针。
  //    改成对比 `--oj-button-height` 与 `.oj-button` 的计算高度：token 没加载时前者是 0px。
  const applied = await browser.evaluate(() => {
    const el = document.querySelector('[data-testid="bold"]') as HTMLElement
    const probe = document.createElement('div')
    probe.style.height = 'var(--oj-button-height)'
    document.body.appendChild(probe)
    const expected = getComputedStyle(probe).height
    const actual = getComputedStyle(el).height
    probe.remove()
    return { expected, actual }
  })
  expect(applied.expected).not.toBe('0px')
  expect(applied.actual).toBe(applied.expected)

  // 3. tooltip：键盘 focus 就要能唤出（D4 的验收，不只是 hover）
  await expect(browser.locator('[role="tooltip"]')).toHaveCount(0)
  await browser.locator('[data-testid="bold"]').focus()
  await expect(browser.locator('[role="tooltip"]')).toHaveText('加粗 (Ctrl+B)')

  // 4. 框选：点第 2 行第 3 列，父组件的 select 拿到值
  await browser.locator('.oj-grid-picker__cell').nth((2 - 1) * 20 + (3 - 1)).click()
  await expect(browser.locator('[data-testid="log"]')).toHaveText('2 × 3')

  // 5. DoD #1 的控制台断言。页面刻意用含编译器的 **dev** 构建，
  //    所以"template 编译不了"这类错误在这里一定会出现，而在 prod 构建上会被吞掉。
  const noisy = messages.filter(
    (m) => m.startsWith('warning') || m.startsWith('error') || m.startsWith('pageerror'),
  )
  expect(noisy, noisy.join('\n')).toEqual([])
})

test('声明式 hydrate：属性即声明，两个 [data-oj] 变真图标、幂等、不碰主 app 的树', async ({
  page: browser,
}) => {
  await browser.goto(page)
  await browser.waitForSelector('[data-testid="hydrate-log"]')
  await browser.waitForSelector('[data-oj-instance="icon"]')

  // 1. 返回值就是"挂载了几个"——页面把它直接打在日志里，所以这行日志本身就是被测对象：
  //    它是 §4.3 唯一对外的可观测结果，写错一个数字就说明扫描把某个元素漏了或多扫了。
  await expect(browser.locator('[data-testid="hydrate-log"]')).toHaveText(
    'hydrate() 挂载了 2 个实例',
  )

  // 2. 真的画出来了：两个图标各带一个 svg path，尺寸取的是属性上的 20
  const icons = browser.locator('[data-oj-instance="icon"]')
  await expect(icons).toHaveCount(2)
  await expect(icons.nth(0).locator('svg path')).toHaveCount(1)
  await expect(icons.nth(1).locator('svg path')).toHaveCount(1)
  const size = await icons.nth(0).evaluate((el) => {
    const icon = el.querySelector('.oj-icon') as HTMLElement
    return { width: getComputedStyle(icon).width, height: getComputedStyle(icon).height }
  })
  expect(size).toEqual({ width: '20px', height: '20px' })

  // 3. 实例是**占位元素的兄弟**，不是子节点（create.ts 里 `anchor.after(el)`）。
  //    塞进去会把占位元素自己的内容顶走——这正是 jQuery 页面最容易被搞坏的形态。
  const nested = await browser.evaluate(() => {
    const first = document.querySelector('[data-oj="icon"]')
    return first === null ? -1 : first.querySelectorAll('[data-oj-instance]').length
  })
  expect(nested).toBe(0)

  // 4. 幂等：jQuery 页面里脚本被重复执行是常态（局部刷新、模板二次注入）。
  //    第二次 hydrate 必须返回 0，否则同一个位置会叠出第二份图标。
  //    `OfficeUI` 是 UMD 的浏览器全局，TS 侧只能就地声明它的形状。
  const again = await browser.evaluate(
    () => (window as unknown as { OfficeUI: { hydrate: () => unknown[] } }).OfficeUI.hydrate().length,
  )
  expect(again).toBe(0)
  await expect(icons).toHaveCount(2)
})

test('命令式 create：插在 anchor 之后、打开即渲染、update:open=false 后 destroy 收干净', async ({
  page: browser,
}) => {
  await browser.goto(page)
  await browser.waitForSelector('[data-testid="make-dialog"]')

  await expect(browser.locator('[role="dialog"]')).toHaveCount(0)
  await browser.locator('[data-testid="make-dialog"]').click()
  const dialog = browser.locator('[role="dialog"]')
  await expect(dialog).toBeVisible()
  await expect(dialog).toContainText('命令式创建的对话框')

  // create 生成的是独立实例：宿主 div 挂在锚点**之后**，主题/密度之类的配置写在它自己身上，
  // 不会去改页面（02 §4.2 的 `configure` 之所以存在，就是因为这里拿不到页面的 provide）
  const host = await browser.evaluate(() => {
    const anchor = document.querySelector('#make-dialog') as HTMLElement
    const next = anchor.nextElementSibling as HTMLElement | null
    return {
      instanceName: next?.getAttribute('data-oj-instance') ?? null,
      insideAnchor: anchor.querySelectorAll('[data-oj-instance]').length,
    }
  })
  expect(host.instanceName).toBe('oj-dialog')
  expect(host.insideAnchor).toBe(0)

  // 关掉之后 DOM 与实例都要没：`destroy()` 是显式契约，不是 GC 的活。
  // 取消按钮没有专属类名（`.oj-dialog__confirm` 才是那个被 data-active 标出来的），
  // 只能按可访问名找；但页眉的关闭叉也叫「关闭」，所以要限定在页脚里点。
  await dialog.locator('.oj-dialog__footer').getByRole('button', { name: '关闭' }).click()
  await expect(browser.locator('[role="dialog"]')).toHaveCount(0)
  await expect(browser.locator('[data-oj-instance="oj-dialog"]')).toHaveCount(0)
})

test('样式双产物：layered 版只是同一批规则多包了一层 @layer', () => {
  const plain = readFileSync(join(repoRoot, 'packages/ui/dist/styles/office-ui.css'), 'utf8')
  const layered = readFileSync(join(repoRoot, 'packages/ui/dist/styles/office-ui.layered.css'), 'utf8')

  expect(layered.startsWith('@layer oj-ui {\n')).toBe(true)
  expect(layered.trimEnd().endsWith('}')).toBe(true)
  // 剥掉那层壳之后必须逐字节相同：两份文件来自同一个源，多出来的只有封装
  expect(layered.slice('@layer oj-ui {\n'.length).trimEnd().slice(0, -1).trimEnd()).toBe(plain.trimEnd())
  // 不是空壳：规则真的在里面
  expect(plain.includes('.oj-button')).toBe(true)
})
