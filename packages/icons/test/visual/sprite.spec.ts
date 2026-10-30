import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * 05 C1 验收原文：「`<use href="#oj-format-bold">` 在无构建器页面可渲染」。
 *
 * 这条只有真浏览器能回答：sprite 里 `<symbol>` 的 id 对不对、根属性有没有搬到 symbol 上、
 * 引用一个不存在的 id 会静默渲染成空白——三种情况在 Node 侧都长得一样。
 *
 * 注入方式刻意选「内联 sprite」：无构建器页面就是这么用的。跨文件 `<use href="sprite.svg#id">`
 * 在 `file://` 与跨源场景下会被浏览器挡掉，那不是我们要验的东西。
 */

const here = dirname(fileURLToPath(import.meta.url))
const sprite = readFileSync(join(here, '../../dist/sprite.svg'), 'utf8')
const ids = [...sprite.matchAll(/<symbol id="([^"]+)"/g)].map((m) => m[1] as string)

test('sprite 里的每枚图标都能被 <use> 引用并渲染出非零尺寸', async ({ page }) => {
  expect(ids.length).toBeGreaterThan(0)

  await page.setContent(`
    <style>body { margin: 0 } .probe { width: 24px; height: 24px; color: #f00 }</style>
    <div id="host">${sprite}</div>
    ${ids.map((id) => `<svg class="probe" data-id="${id}"><use href="#${id}"/></svg>`).join('\n')}
  `)

  const boxes = await page.evaluate((names) => {
    return names.map((id) => {
      const el = document.querySelector(`svg[data-id="${id}"]`) as SVGSVGElement
      const box = el.getBoundingClientRect()
      // use 元素的实际绘制范围：id 解析失败时它是 0×0（不会报错，只是空白）
      const use = el.querySelector('use') as SVGUseElement
      return { id, width: box.width, height: box.height, bbox: use.getBBox().width }
    })
  }, ids)

  for (const item of boxes) {
    expect(item.width, `${item.id} 的容器宽度`).toBe(24)
    expect(item.bbox, `${item.id} 的 <use> 没解析出图形（id 错或 symbol 为空）`).toBeGreaterThan(0)
  }
})

test('引用不存在的 id 是空白的——所以上面那条断言必须量尺寸，而不是"没报错"', async ({ page }) => {
  await page.setContent(`
    <style>body { margin: 0 } .probe { width: 24px; height: 24px }</style>
    <div>${sprite}</div>
    <svg class="probe" data-id="missing"><use href="#oj-not-a-real-icon"/></svg>
  `)
  const bbox = await page.evaluate(() => {
    const el = document.querySelector('svg[data-id="missing"]') as SVGSVGElement
    return el.querySelector('use')?.getBBox().width ?? -1
  })
  expect(bbox).toBe(0)
})

test('sprite 不带外链与脚本：离线/内网部署的前提', () => {
  expect(/href="http/.test(sprite)).toBe(false)
  expect(sprite.includes('<script')).toBe(false)
  expect(sprite.includes('<image')).toBe(false)
})
