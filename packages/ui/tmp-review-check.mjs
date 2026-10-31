import { chromium } from '@playwright/test'

const errors = []
const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(m.text())
})
page.on('pageerror', (e) => errors.push(String(e)))
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' })

// 1 标题栏：文件名 + 保存态 + 头像堆叠
console.log('name   →', await page.locator('.oj-file-name__title').textContent())
console.log('state  →', await page.locator('.oj-file-name__state').textContent())
console.log('avatars→', await page.locator('.oj-presence__avatar').count(), 'more:', await page.locator('.oj-presence__more').textContent())

// 2 重命名 → 保存态三档
await page.click('.oj-file-name__title')
await page.fill('.oj-file-name__input', '合同审核说明')
await page.press('.oj-file-name__input', 'Enter')
console.log('renamed→', await page.locator('.oj-file-name__title').textContent(), '| state:', await page.locator('.oj-file-name__state').textContent())
await page.waitForTimeout(1400)
console.log('settled→', await page.locator('.oj-file-name__state').textContent())

// 3 收藏
await page.click('.oj-file-name__favorite')
console.log('favored→', await page.getAttribute('.oj-file-name__favorite', 'aria-pressed'))

// 4 非法名：不退出编辑态
await page.click('.oj-file-name__title')
await page.fill('.oj-file-name__input', 'a/b')
await page.press('.oj-file-name__input', 'Enter')
console.log('invalid→ input still open:', await page.locator('.oj-file-name__input').count(), 'problem:', await page.locator('.oj-file-name__problem').textContent())
await page.press('.oj-file-name__input', 'Escape')

// 5 审阅页
await page.locator('.oj-tabs__tab').nth(1).click()
console.log('review → items:', await page.locator('.oj-review__item').count())
await page.locator('.oj-review__chip').nth(1).click()
console.log('filter → items:', await page.locator('.oj-review__item').count())
await page.locator('.oj-review__actions button').first().click()
console.log('acceptAll(insert) → items:', await page.locator('.oj-review__item').count())

// 6 批注
console.log('comment → replies before:', await page.locator('.oj-comment').first().locator('.oj-comment__reply').count())
await page.locator('.oj-comment__input').first().fill('同意，我改一下')
await page.locator('.oj-comment__send').first().click()
console.log('comment → replies after:', await page.locator('.oj-comment').first().locator('.oj-comment__reply').count())
await page.locator('.oj-comment__resolve').first().click()
console.log('resolve → data-resolved:', await page.locator('.oj-comment').first().getAttribute('data-resolved'))

console.log('console errors:', errors.length, errors.slice(0, 3))
await browser.close()
