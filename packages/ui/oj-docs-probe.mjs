import { chromium } from '@playwright/test'
import { readdirSync, readFileSync } from 'node:fs'

const dir = '/Users/shaun/Desktop/github/office-ui/docs/components/api'
const slugs = readdirSync(dir)
  .filter((f) => f.endsWith('.md'))
  .filter((f) => readFileSync(`${dir}/${f}`, 'utf8').includes('<OjPlayground'))
  .map((f) => f.replace('.md', ''))
  .sort()

console.log(`带示例的页面：${slugs.length} 个`)

const b = await chromium.launch({ channel: 'chrome' })
const p = await b.newPage({ viewport: { width: 1280, height: 900 } })
const bad = []
for (const slug of slugs) {
  await p.goto(`http://127.0.0.1:5181/components/api/${slug}.html`, { waitUntil: 'networkidle' })
  const frame = p.frameLocator('iframe.oj-playground__frame')
  try {
    await frame.locator('body').waitFor({ timeout: 6000 })
    await p.waitForTimeout(650)
    // 统计前先去掉沙箱自己的 <script>：它的源码文本也在 body 里，会把 "const target = …"
    // 混进 text、把节点数撑虚，让"没渲染出来"看起来像渲染了
    const info = await frame.locator('body').evaluate((el) => {
      const scope = el.cloneNode(true)
      scope.querySelectorAll('script').forEach((node) => node.remove())
      return {
        nodes: scope.querySelectorAll('*').length,
        oj: scope.querySelectorAll('[class*="oj-"]').length,
        text: (scope.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 50),
      }
    })
    if (info.nodes < 1 || info.oj === 0) {
      bad.push(`${slug} | nodes=${info.nodes} oj=${info.oj} | ${info.text}`)
    }
  } catch {
    bad.push(`${slug} | 帧没出来`)
  }
  const errBox = await p.locator('.oj-playground__errors').count()
  if (errBox > 0) {
    const msg = await p.locator('.oj-playground__errors').first().innerText()
    bad.push(`${slug} | 错误：${msg.replace(/\s+/g, ' ').slice(0, 100)}`)
  }
}

console.log('有问题的：')
console.log(bad.length === 0 ? '  无' : bad.map((x) => `  ${x}`).join('\n'))
await b.close()
