/**
 * 排版层的真浏览器回归锁（B5 第一切片）。
 *
 * 为什么需要第三个文件：`test/typography.test.ts` 与门禁 8 都在**比对 CSS 文本**，
 * 它们证明不了真解析器接受这些声明，更证明不了排版引擎真的照做。2026-10-09 手工实测时
 * 连着得到两次假阴性——用行盒宽度看禁则、用无效关键字 `none` 当对照——
 * 而这套用例第一次真跑又给出第三种坏法：断言绿了，但它量的是 UA 不是产物
 * （盒子上内联设了被测属性，压过 body 的继承值）。这类结论只有可重跑的用例守得住。
 * 数字与量法见 prd/01 §7，三次仪器错误见 prd/05 偏差 10 与 13。
 *
 * 跑法：`pnpm --filter @jitoffice/tokens test:visual`（要浏览器，所以它不进零依赖的 `pnpm verify`）。
 * 拉不到 Playwright 二进制的机器上加 `OJ_BROWSER_CHANNEL=chrome|msedge` 用本机内核，
 * 前提是该内核 ≥ ADR-0002 基线。
 */
import { fileURLToPath } from 'node:url'

import { expect, test, type Page } from '@playwright/test'

/** 产物 CSS 的真实路径：用 addStyleTag 注入，避免为测试再造一份 fixture 样式表。 */
const CSS_PATH = fileURLToPath(new URL('../../dist/index.css', import.meta.url))

/** 混排样本：两处中日韩↔拉丁/数字边界，正是 text-autospace 的作用面。 */
const MIX_SAMPLE = 'テキストABCテキスト123テキスト。'

/** 折行样本：把半宽小假名与长音符摆在会落进行末的位置上。 */
const WRAP_SAMPLE = 'カタカナ語の長音符ァィゥェォーッーを行末に置く禁止規則の確認用テキストテキストテキスト'

/**
 * JIS 禁则里不得落在行末的字符（小假名 + 长音符，全角与半宽都要）。
 * 这只是 UA 内部表的子集：测试用它断言"我们的产物没把这类字符放到行末"，
 * 不复现 UA 的完整表。
 */
const LINE_FINAL_FORBIDDEN = 'ァィゥェォャュョッーｧｨｩｪｫｬｭｮｯ'

async function openLocalized(page: Page, lang: string) {
  await page.goto('about:blank')
  await page.evaluate((value) => {
    document.documentElement.lang = value
  }, lang)
  await page.addStyleTag({ path: CSS_PATH })
}

test('真解析器下四个排版声明都命中，antialiased 不进日文作用域', async ({ page }) => {
  await openLocalized(page, 'ja-JP')
  const ja = await page.evaluate(() => {
    const cs = getComputedStyle(document.body)
    return {
      lineBreak: cs.getPropertyValue('line-break'),
      wordBreak: cs.getPropertyValue('word-break'),
      underline: cs.getPropertyValue('text-underline-position'),
      autospace: cs.getPropertyValue('text-autospace'),
      smoothing: cs.getPropertyValue('-webkit-font-smoothing'),
      fs14: cs.getPropertyValue('--oj-fs-14').trim(),
    }
  })
  // computed 必须就是这四个关键字。写成 ideograph-alpha ideograph-numeric 会整条被丢弃
  // 并退回本内核的 UA 默认值 no-autospace，autospace 这一项就是它漏掉的地方。
  expect(ja).toEqual({
    lineBreak: 'strict',
    wordBreak: 'normal',
    underline: 'from-font',
    autospace: 'normal',
    smoothing: 'auto',
    fs14: '13px',
  })

  await page.evaluate(() => {
    document.documentElement.lang = 'zh-CN'
  })
  const zh = await page.evaluate(() => getComputedStyle(document.body).getPropertyValue('-webkit-font-smoothing'))
  expect(zh).toBe('antialiased')
})

test('text-autospace: normal 每处混排边界插入 0.25em（16px 样本 = 8px）', async ({ page }) => {
  await openLocalized(page, 'ja-JP')

  // null = 不写这条声明，让它从 body 继承下来——继承到的才是产物给的。
  // 只在盒子上内联设值的话，用例读的是 UA 行为，跟 dist/index.css 一点关系都没有：
  // 2026-10-09 故意把产物改成 line-break: auto，另一条同样结构的用例照样绿，
  // 就是这个原因。产物锁必须走 null 这一支。
  const widthWith = (autospace: string | null) =>
    page.evaluate(({ sample, value }) => {
      const box = document.createElement('div')
      box.style.cssText =
        'position:absolute;left:0;top:0;white-space:nowrap;font-size:16px;line-height:1.5;' +
        'font-family:"Yu Gothic UI","Yu Gothic",Meiryo,sans-serif'
      box.textContent = sample
      if (value !== null) box.style.setProperty('text-autospace', value)
      document.body.appendChild(box)
      const width = box.getBoundingClientRect().width
      box.remove()
      return width
    }, { sample: MIX_SAMPLE, value: autospace })

  const fromArtifact = await widthWith(null)
  const normal = await widthWith('normal')
  const off = await widthWith('no-autospace')
  // 断言差值而不是绝对宽度：插入的间距按 em 算，与机器装了哪套字体无关；
  // 绝对宽度有关，写成断言就变成环境依赖的脆测试。
  expect(fromArtifact - off).toBeCloseTo(8, 1)
  // 产物给的间距与显式 normal 一致：这条声明真的透过继承作用到了盒子上。
  expect(fromArtifact - normal).toBeCloseTo(0, 1)
})

test('line-break: strict 不把小假名或长音符留在行末，而 auto 会', async ({ page }) => {
  await openLocalized(page, 'ja-JP')

  // 同上一条：null 这一支量的是产物经 body 继承下来的行为，不是测试自己设的值。
  const lineEnds = (lineBreak: string | null) =>
    page.evaluate(({ sample, value }) => {
      const box = document.createElement('div')
      box.style.cssText =
        'position:absolute;left:0;top:0;width:180px;font-size:16px;line-height:1.5;word-break:normal;' +
        'font-family:"Yu Gothic UI","Yu Gothic",Meiryo,sans-serif'
      box.textContent = sample
      if (value !== null) box.style.setProperty('line-break', value)
      document.body.appendChild(box)

      // 逐字符包 span：禁则移动的是断点位置，量行盒宽度看不见它。
      const marks = [...sample].map((char) => {
        const span = document.createElement('span')
        span.textContent = char
        box.appendChild(span)
        return { char, top: Math.round(span.getBoundingClientRect().top) }
      })
      const ends: string[] = []
      for (const [index, mark] of marks.entries()) {
        const next = marks[index + 1]
        if (next === undefined || next.top !== mark.top) ends.push(mark.char)
      }
      const lineCount = ends.length
      box.remove()
      return { ends: ends.join(''), lineCount }
    }, { sample: WRAP_SAMPLE, value: lineBreak })

  const artifact = await lineEnds(null)
  const auto = await lineEnds('auto')
  const initial = await lineEnds('normal')
  const violations = (ends: string) => [...ends].filter((char) => LINE_FINAL_FORBIDDEN.includes(char))

  // 产物这一侧必须干净（同一设置下 strict = `の末テト`，没有小假名也没有长音符）。
  // 断的是继承来的值，所以产物写成 auto / 删掉这条都会红——内联设值时抓不到，见上面的注释。
  expect(violations(artifact.ends)).toEqual([])

  // 产物必须显式写 strict：CSS 初始值 normal 与 auto/loose 一样放任违禁字符落在行末，
  // "内核会按 lang 自己判断"是不成立的（旧记录里那句 normal 已接近 strict 就是这么被推翻的）。
  expect(violations(initial.ends).length).toBeGreaterThan(0)

  // 非空洞化检查：样本必须真的能让 auto 把违禁字符放到行末。
  // 这套设置（180px 内容宽、16px、word-break: normal）下的实测读数：
  // auto / loose / normal 都是 `ゥ止スト`，strict 是 `の末テト`。
  // 这条在别的内核或字体上失败时，要重排样本，而不是删掉下面那条。
  expect(violations(auto.ends).length).toBeGreaterThan(0)

  // 禁则减少断点机会，行数只可能变多。这条与字体无关，兜住上面几条被换行环境同时削弱的情况。
  expect(artifact.lineCount).toBeGreaterThanOrEqual(auto.lineCount)
})
