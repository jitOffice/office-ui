import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import { existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * 02 §7 / 01 §8：`light/dark × comfortable/compact × zh-CN/zh-TW/ja` **12 组**视觉回归。
 *
 * 这一组用例回答的是单测与 CSS 文本断言答不了的问题：**声明到底生效了没有**。
 * `node --test` 能确认 `--oj-fs-14: 13px` 写在 `html[lang|="ja"]` 里，
 * 但它确认不了浏览器把 13px 用到了正文上；能确认 `text-autospace` 在产物里只有一条，
 * 确认不了混排真的被推开了。这两件事只在真排版引擎里发生。
 *
 * 三条刻意的选择：
 *
 * 1. **一个页面 × 12 次改属性**，不是 12 个页面。主题/密度/语言在产物里就是 `<html>` 上的
 *    三个属性（`data-oj-theme` / `data-oj-density` / `lang`），复制 12 份 HTML 只会让
 *    "12 组"变成 12 份需要同步维护的副本。
 *
 * 2. **不止截图**。前半条用例只读计算值，锁交叉不变量：颜色只许随主题变、尺寸只许随密度变、
 *    排版只许随语言变（01 §3 的原话是"密度与语言维度不得改变任何颜色 token"——
 *    那条规矩原本只在 token 文本上验过，这里在真盒子上再验一次）。
 *    截图腿只负责"像素级的东西有没有挪"，两者互为对照：
 *    计算值对、截图错 = 某个组件没走 token；计算值错 = token 层就错了。
 *
 * 3. **阈值 0.1%**（`maxDiffPixelRatio: 0.001`），不是 0。12 组里全是 CJK 文本，
 *    亚像素抗锯齿在不同内核/显卡上本来就会差几个像素。
 *
 * 基线按平台存（Playwright 的 `-darwin` / `-linux` 后缀）。仓库里现在只有 darwin 一套，
 * 因为唯一能真跑浏览器的机器就是它；linux 那套需要在 runner 上跑一次
 * `pnpm --filter @jitoffice/ui test:visual --update-snapshots` 再提交。
 * **当前平台没有基线时这条腿是"写基线并放行"，不是门禁**——所以它在报告里会显式提示，
 * 不让人把"12 passed"误读成"12 组都被比过了"。
 */

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(here, '../../../..')
const pageUrl = `file://${join(repoRoot, 'examples/theme-matrix/index.html')}`

const THEMES = ['light', 'dark'] as const
const DENSITIES = ['comfortable', 'compact'] as const
const LANGS = ['zh-CN', 'zh-TW', 'ja'] as const

type Theme = (typeof THEMES)[number]
type Density = (typeof DENSITIES)[number]
type Lang = (typeof LANGS)[number]

interface Combo {
  theme: Theme
  density: Density
  lang: Lang
}

const COMBOS: Combo[] = THEMES.flatMap((theme) =>
  DENSITIES.flatMap((density) => LANGS.map((lang) => ({ theme, density, lang }))),
)

/** 板子上有 8 个 `[data-oj]`：4 个图标 + tabs / 框选 / 数字框 / 状态栏 */
const INSTANCE_COUNT = 8

/**
 * 截图**按板块切**，不截整块板子。
 *
 * 原因是一个实测出来的数：整块板子是 640×676 ≈ 43 万像素，0.1% 阈值等于允许 432 个像素不一样。
 * 而把 `.oj-status-bar` 的颜色写死成字面色值（不再走 `--oj-text-3`）在暗色下只差 214–437 像素——
 * 一半的档位正好从阈值底下溜过去，绿的。**门禁的松紧取决于分母**，
 * 所以分母要跟着"一个组件"走：状态栏那块是 608×68 ≈ 4 万像素，同样的差异是 0.5%，五倍余量。
 *
 * 为什么是这 6 块而不是 59 个组件各一张：这一组用例的目的是锁**三条轴有没有生效**，
 * 6 块已经覆盖了颜色/边框/圆角/密度尺寸/中日文字体，再乘上去只会把快照数量翻十倍，
 * 而漏掉的组件级回归由它们各自的单测与样式门禁兜。
 */
const SECTIONS = [
  'buttons',
  'icons',
  'tabs-cell',
  'grid-cell',
  'number-cell',
  'status-cell',
] as const

async function openBoard(page: Page): Promise<void> {
  await page.goto(pageUrl)
  // 水合是同步的，但"同步"不等于"可以立刻截图"：等最后一个实例真的进了 DOM 再动手
  await page.waitForSelector('[data-oj-instance="status-bar"]')
  await expect
    .poll(() => page.locator('[data-oj-instance]').count())
    .toBe(INSTANCE_COUNT)
}

async function applyCombo(page: Page, combo: Combo): Promise<void> {
  await page.evaluate((c) => {
    const html = document.documentElement
    html.dataset['ojTheme'] = c.theme
    html.dataset['ojDensity'] = c.density
    html.lang = c.lang
  }, combo)
}

interface Reading {
  pageBg: string
  textColor: string
  buttonHeight: number
  buttonFs: number
  specimenFs: number
  letterSpacing: string
  fontSans: string
  /** 排版样本的盒高：行高 × 折行数，语言档位唯一"肉眼但量不出字号"的产物 */
  specimenHeight: number
}

async function read(page: Page): Promise<Reading> {
  return page.evaluate(() => {
    const style = (selector: string): CSSStyleDeclaration =>
      getComputedStyle(document.querySelector(selector) as Element)
    const specimen = document.querySelector('[data-testid="specimen"]') as HTMLElement
    return {
      pageBg: style('body').backgroundColor,
      textColor: style('body').color,
      buttonHeight: Number.parseFloat(style('[data-testid="btn-plain"]').height),
      buttonFs: Number.parseFloat(style('[data-testid="btn-plain"]').fontSize),
      specimenFs: Number.parseFloat(style('[data-testid="specimen"]').fontSize),
      letterSpacing: style('[data-testid="specimen"]').letterSpacing,
      fontSans: getComputedStyle(document.documentElement).getPropertyValue('--oj-font-sans'),
      specimenHeight: specimen.getBoundingClientRect().height,
    }
  })
}

test('12 组交叉不变量：颜色只随主题变、尺寸只随密度变、排版只随语言变', async ({ page }) => {
  await openBoard(page)

  const readings = new Map<string, Reading>()
  for (const combo of COMBOS) {
    await applyCombo(page, combo)
    readings.set(`${combo.theme}/${combo.density}/${combo.lang}`, await read(page))
  }
  const at = (combo: Combo): Reading => {
    const found = readings.get(`${combo.theme}/${combo.density}/${combo.lang}`)
    expect(found, `缺 ${combo.theme}/${combo.density}/${combo.lang} 的读数`).toBeDefined()
    return found as Reading
  }

  // 三条轴（主题 / 密度 / 语言）各自"只许动自己那一类"。写成逐轴扫而不是逐组合写死 12 份读数，
  // 是因为 12 份读数只能证明"今天是这 12 个数"，证明不了"这条轴没越界"。
  //
  // 注意**字号不属于纯语言轴**：`compact` 把 `--oj-fs-14` 压到 13px，`ja` 也把它压到 13px，
  // 两条轴都能改字号。第一版断言写成"字号只随语言变"，跑第一次就是红的（期望 14、实际 13）——
  // 那不是产物错了，是把不变量写错了。所以字号只在**单条轴内部**断言方向，不跨轴比较。

  // ---- 轴 1：主题只换颜色 ----
  const pageBgs = new Set<string>()
  const textColors = new Set<string>()
  for (const lang of LANGS) {
    for (const density of DENSITIES) {
      const light = at({ theme: 'light', density, lang })
      const dark = at({ theme: 'dark', density, lang })
      const where = `light/dark × ${density} × ${lang}`
      expect(dark.pageBg, `${where}：暗色没换底色`).not.toBe(light.pageBg)
      expect(dark.textColor, `${where}：暗色没换正文色`).not.toBe(light.textColor)
      // 主题越界：它不该动尺寸与排版
      expect(dark.buttonHeight, `${where}：主题改了控件高度`).toBe(light.buttonHeight)
      expect(dark.specimenFs, `${where}：主题改了字号`).toBe(light.specimenFs)
      expect(dark.letterSpacing, `${where}：主题改了字距`).toBe(light.letterSpacing)
      pageBgs.add(light.pageBg)
      pageBgs.add(dark.pageBg)
      textColors.add(light.textColor)
      textColors.add(dark.textColor)
    }
  }
  // 两个主题不能解析成同一个颜色——那不是"暗色没生效"，是 token 表里两档写重了
  expect(pageBgs.size, [...pageBgs].join(' / ')).toBe(2)
  expect(textColors.size, [...textColors].join(' / ')).toBe(2)

  // ---- 轴 2：密度只换尺寸 ----
  for (const theme of THEMES) {
    for (const lang of LANGS) {
      const comfortable = at({ theme, density: 'comfortable', lang })
      const compact = at({ theme, density: 'compact', lang })
      const where = `${theme} × comfortable/compact × ${lang}`
      // 具体像素不写死（token 值改动是合法变更），但方向必须是"压矮"，且不能压成 0
      expect(compact.buttonHeight, `${where}：compact 没把控件压矮`).toBeLessThan(
        comfortable.buttonHeight,
      )
      expect(compact.buttonHeight, `${where}：控件高度是 0，等于样式整个没加载`).toBeGreaterThan(0)
      // 密度越界：它不该动颜色，也不该动字距（字距是 em，跟着字号走，不跟着密度走）
      expect(compact.pageBg, `${where}：密度改了页面底色`).toBe(comfortable.pageBg)
      expect(compact.letterSpacing, `${where}：密度改了字距`).toBe(comfortable.letterSpacing)
    }
  }

  // ---- 轴 3：语言只换排版 ----
  for (const theme of THEMES) {
    for (const density of DENSITIES) {
      const zhCN = at({ theme, density, lang: 'zh-CN' })
      const zhTW = at({ theme, density, lang: 'zh-TW' })
      const ja = at({ theme, density, lang: 'ja' })
      const where = `${theme} × ${density} × zh-CN/zh-TW/ja`

      // ja 是唯一"字号 + 字距 + 字体族"三样都变的档位（01 §7）：
      // 字距必须真的落到正文上，而不是只写在 `html[lang|="ja"]` 里没人用。
      expect(Number.parseFloat(ja.letterSpacing), `${where}：ja 没有字距`).toBeGreaterThan(0)
      expect(zhCN.letterSpacing, `${where}：非 ja 档位不该有字距`).toBe('normal')
      expect(zhTW.letterSpacing, `${where}：非 ja 档位不该有字距`).toBe('normal')
      expect(ja.fontSans, `${where}：ja 没换字体族`).toContain('Yu Gothic')
      expect(zhTW.fontSans, `${where}：zh-TW 没换字体族`).toContain('PingFang TC')
      expect(zhCN.fontSans, `${where}：zh-CN 不该带上繁体字体`).not.toContain('PingFang TC')

      // zh-TW 只换字体族，不覆写字号——覆写就成了排版档位，而它只是字体偏好
      expect(zhTW.specimenFs, `${where}：zh-TW 不该改字号`).toBe(zhCN.specimenFs)
      // 语言越界：它不该动控件尺寸
      expect(ja.buttonHeight, `${where}：语言改了控件高度`).toBe(zhCN.buttonHeight)
    }
  }

  // ja 的字号档位（舒适档下 13 vs 14）——只在 comfortable 里比：
  // compact 已经把 zh-CN 也压到 13px，两条轴在那里重合，比出来的是 0 差异，看着像没生效。
  const jaComfortable = at({ theme: 'light', density: 'comfortable', lang: 'ja' })
  const zhComfortable = at({ theme: 'light', density: 'comfortable', lang: 'zh-CN' })
  expect(jaComfortable.specimenFs, 'ja 的字号档位没生效').toBeLessThan(zhComfortable.specimenFs)
  // 行高是计算后的产物：字号变了而盒高没变，说明 line-height 被写死成了 px
  expect(jaComfortable.specimenHeight).not.toBe(zhComfortable.specimenHeight)
})

test.describe('12 组截图', () => {
  for (const combo of COMBOS) {
    const name = `${combo.theme}-${combo.density}-${combo.lang}`
    test(name, async ({ page }, testInfo) => {
      await openBoard(page)
      await applyCombo(page, combo)

      for (const section of SECTIONS) {
        // 基线是按平台存的（`-darwin` / `-linux`）。本平台没有基线时 Playwright 会写一份并放行，
        // 那不是门禁；把它写进报告，别让人把"12 passed"读成"12 组都真的比过了"。
        const snapshot = testInfo.snapshotPath(`${name}--${section}.png`)
        if (!existsSync(snapshot)) {
          testInfo.annotations.push({ type: 'baseline-missing', description: snapshot })
        }

        await test.step(section, async () => {
          await expect(page.locator(`[data-testid="${section}"]`)).toHaveScreenshot(
            `${name}--${section}.png`,
            {
              maxDiffPixelRatio: 0.001,
              animations: 'disabled',
              caret: 'hide',
              scale: 'css',
            },
          )
        })
      }
    })
  }
})
